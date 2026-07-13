# Runbook — Backup & Restore do Banco de Produção (Metalab Store)

> **Objetivo:** restaurar o banco de produção em caso de perda de dados, corrupção,
> exclusão acidental ou incidente. Procedimento de infraestrutura — **não** envolve
> deploy de código.

## 0. Fatos do ambiente (verificados em 15/06/2026)

| Item | Valor |
|---|---|
| Provedor | Supabase (PostgreSQL 17.6) |
| Project ref | `ndbbpkwnfqypajjneabx` |
| Região | `us-east-1` |
| Org | `zerkjee's Org` |
| Acesso da app | **Prisma** via pooler (não usa PostgREST/anon) |
| Connection strings | `DATABASE_URL` (pooler txn :6543), `DIRECT_URL` (pooler session :5432) — na Vercel |
| App host | Vercel (`metalab-farma.vercel.app`, deploy on push `main`) |

**Baseline de dados (15/06/2026)** — usar como referência mínima pós-restore:

| Tabela | Linhas |
|---|---|
| usuarios | 8 |
| produtos | 37 |
| pedidos | 10 |
| itens_pedido | 12 |
| categorias | 13 |
| cupons | 10 |
| enderecos | 1 |
| avaliacoes | 0 |
| banners | 1 |
| audit_logs | 0 |
| **Tabelas (schema public)** | **18** |
| **Migrations aplicadas** | **4** (`0_init` … `20260604130000_add_tiny_erp_fields`) |

---

## 1. Onde acessar o backup

> ⚠️ **Pré-requisito:** backups automáticos e PITR **exigem o plano Pro**. No Free
> não há backup gerenciado — a única cópia seria um `pg_dump` manual.

**Dashboard Supabase** → projeto `ndbbpkwnfqypajjneabx`:

- **Backups diários:** `Database` → `Backups` → aba **Scheduled backups** (retenção 7 dias no Pro).
- **PITR (Point-in-Time Recovery):** `Database` → `Backups` → aba **Point in Time**
  (add-on pago; permite restaurar a um instante exato, granularidade de segundos,
  janela conforme retenção contratada — tipicamente 7 dias).
- **Backup manual (recomendado ter sempre o mais recente):**
  ```bash
  # Usa a DIRECT_URL (porta 5432). Rodar de máquina confiável.
  pg_dump "$DIRECT_URL" --no-owner --no-privileges -Fc -f metalab_$(date +%Y%m%d_%H%M).dump
  ```
  Guardar o `.dump` em local seguro (cofre/backup externo), **fora** do Supabase.

---

## 2. Como restaurar

Escolha o método conforme o incidente:

### 2A. PITR — perda/corrupção recente, precisa de instante exato *(preferido se disponível)*
1. Dashboard → `Database` → `Backups` → **Point in Time**.
2. Escolher data/hora **imediatamente antes** do incidente.
3. Confirmar. O Supabase restaura **no mesmo projeto** (operação destrutiva sobre o
   estado atual — ver §5 para testar antes em ambiente isolado).
4. Aguardar conclusão (status no dashboard).

### 2B. Backup diário — incidente do dia anterior
1. Dashboard → `Database` → `Backups` → **Scheduled backups**.
2. Selecionar o snapshot desejado → **Restore**.
3. Confirmar e aguardar.

### 2C. `pg_restore` de dump manual **formato custom (`-Fc`)** — DR total / fora do Supabase
> ⚠️ **Só funciona se o dump foi gerado com `-Fc`** (formato custom, extensão `.dump`).
> **NÃO** use `pg_restore` no backup automático diário — aquele é SQL puro cifrado
> (`.sql.gz.gpg`); ver **§2D**.
```bash
# Restaura para um banco-alvo (NUNCA produção direto sem validar — ver §5)
pg_restore --no-owner --no-privileges --clean --if-exists \
  -d "$TARGET_DATABASE_URL" metalab_AAAAMMDD_HHMM.dump
```

### 2D. Backup automático diário cifrado (`.sql.gz.gpg`) — **o que realmente existe hoje** *(preferido no Free)*
O workflow `.github/workflows/db-backup.yml` roda diário (06:00 UTC), produz um dump
**SQL puro** (`pg_dump` sem `-Fc`) → `gzip` → **GPG AES256**, e sobe como artifact do
Actions (retenção 30 dias). Como é SQL puro, restaura-se com **`psql`**, não `pg_restore`.

```bash
# 1. Baixar o artifact mais recente (precisa do gh CLI autenticado como owner)
gh run download -R zerkjee/metalab-farma \
  "$(gh run list -R zerkjee/metalab-farma --workflow=db-backup.yml \
       --status=success -L1 --json databaseId -q '.[0].databaseId')"

# 2. Decifrar + descomprimir + restaurar num banco-alvo (NUNCA produção sem validar — §5)
#    BACKUP_PASSPHRASE = secret do GitHub (só o owner tem). Passar por env, nunca em argv.
gpg --batch --quiet --decrypt --passphrase "$BACKUP_PASSPHRASE" \
    metalab-backup-AAAA-MM-DD-HH-MM.sql.gz.gpg \
  | gunzip \
  | psql "$TARGET_DATABASE_URL"
```
> O dump traz `DROP/CREATE` de todos os objetos do schema `public` (inclui
> `_prisma_migrations`). Restaurar em banco **vazio** ou descartável. Para restaurar
> por cima de um banco existente, avaliar `--clean` no dump ou zerar o schema antes.

> 🔴 **Regra de ouro:** restauração que sobrescreve produção só com **autorização
> explícita do dono** e, de preferência, validada antes num clone (§5).

---

## 3. Tempo estimado

| Cenário | Tempo típico |
|---|---|
| PITR (base atual ~pequena, <1 GB) | 5–15 min |
| Restore de backup diário | 5–15 min |
| `pg_restore` de dump (<1 GB) | 2–10 min |
| Reativar projeto pausado (Free auto-pause) | 1–3 min |
| **+ propagação de cache/ISR da Vercel** | até ~60 s após o banco voltar |

---

## 4. Quem pode executar

- **Owner da org Supabase** (`zerkjee`) — único com acesso a Backups/PITR e billing.
- Restore destrutivo em produção: **somente o dono do negócio autoriza**.
- `pg_dump`/`pg_restore` manual: quem tiver a `DIRECT_URL` (tratar como segredo).

---

## 5. Testar restore SEM afetar produção *(recomendado antes de qualquer restore destrutivo)*

Opção A — **Branch/clone Supabase** (Pro): `Database` → criar **branch** → restaurar/inspecionar lá.
Opção B — **Banco-alvo separado** (Supabase novo projeto ou Postgres local):
```bash
createdb metalab_restore_test         # ou um projeto Supabase descartável
# Dump custom (-Fc):
pg_restore --no-owner --no-privileges -d "$URL_TESTE" metalab_AAAAMMDD_HHMM.dump
# OU backup automático cifrado (.sql.gz.gpg — o que existe hoje, ver §2D):
gpg --batch --quiet --decrypt --passphrase "$BACKUP_PASSPHRASE" \
    metalab-backup-AAAA-MM-DD-HH-MM.sql.gz.gpg | gunzip | psql "$URL_TESTE"
```
Validar no alvo (não em produção):
```sql
SELECT count(*) FROM information_schema.tables
  WHERE table_schema='public' AND table_type='BASE TABLE';   -- esperado: ~18-19 (verificar)
SELECT count(*) FROM produtos;   -- comparar com o dia do backup
SELECT count(*) FROM pedidos;    -- >= valor do dia do backup
SELECT migration_name FROM _prisma_migrations ORDER BY finished_at;  -- 7 migrations (12/07/2026)
```
> **Drill pronto:** existe um script guiado em `scripts/restore-drill.sh` (gerado
> 12/07/2026) que baixa o último artifact, decifra, restaura num Postgres local
> descartável e valida — sem tocar produção. Rodar com `BACKUP_PASSPHRASE` no ambiente.

---

## 6. Checklist pós-restore

- [ ] Status do projeto = `ACTIVE_HEALTHY` no dashboard.
- [ ] Contagens batem com o baseline (§0) ou com o esperado para a data restaurada.
- [ ] `~18-19` tabelas no schema `public`; `7` migrations em `_prisma_migrations` (contagem de 12/07/2026 — reconferir se o schema mudou).
- [ ] `DATABASE_URL` e `DIRECT_URL` na Vercel **inalteradas** (restore no mesmo projeto
      mantém host/ref/pooler — não precisa trocar). Se foi restore para projeto NOVO,
      atualizar ambas na Vercel e **redeployar**.
- [ ] Sem locks/migrations pendentes (`_prisma_migrations` sem `rolled_back_at`).
- [ ] Rodar o **smoke test** (§7).
- [ ] Registrar o incidente (data, causa, ponto restaurado, perda de dados se houve).

---

## 7. Validar a aplicação depois do restore (smoke test)

```bash
BASE=https://metalab-farma.vercel.app
for u in / /produtos /api/produtos /api/categorias /api/banners; do
  curl -s -o /dev/null -w "%{http_code}  $u\n" "$BASE$u"   # esperar 200
done
# Frete (cotação real):
curl -s -X POST "$BASE/api/frete" -H 'Content-Type: application/json' \
  -d '{"cep":"01310100","itens":[{"produtoId":"<ID_VALIDO>","quantidade":1}]}'
```
Manual (navegador):
- [ ] Home carrega com produtos.
- [ ] Login admin (`/admin/login`) → dashboard abre.
- [ ] `/admin/pedidos` lista os pedidos restaurados.
- [ ] Checkout: adicionar ao carrinho → calcular frete → tela de pagamento.
- [ ] (Se autorizado) criar 1 pedido-teste e validar PIX.

---

## 8. Prevenção (estado-alvo)

- [ ] **Plano Pro ativo** (backups diários + opção de PITR).
- [ ] **PITR add-on habilitado** (recuperação a instante exato).
- [ ] **Auto-pause eliminado** (Pro não pausa por inatividade).
- [ ] `pg_dump` manual semanal guardado fora do Supabase (defesa extra).
- [ ] Este runbook revisado a cada mudança de schema.

_Última atualização: 12/07/2026 — corrigido o método de restore do backup automático
(SQL puro cifrado `.sql.gz.gpg` → `psql`, não `pg_restore`); adicionado §2D e
`scripts/restore-drill.sh`. Backup automático diário confirmado funcionando (runs verdes
diários; artifact validado como GPG AES256 real)._
