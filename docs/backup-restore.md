# Backup automático & Restore — Metalab Store (Supabase Free)

Backup lógico **diário** do PostgreSQL via GitHub Actions + `pg_dump`, enquanto o
projeto está no Supabase Free (sem backup gerenciado). O dump é **cifrado** (GPG
AES256) antes de virar artifact — **obrigatório**, pois o repositório é **público** e
artifacts de repo público são baixáveis por terceiros.

> Companion: [`RUNBOOK-restore-banco.md`](./RUNBOOK-restore-banco.md) (restore via
> PITR/backup gerenciado quando houver upgrade para Pro).

---

## Como funciona

- Workflow: [`.github/workflows/db-backup.yml`](../.github/workflows/db-backup.yml)
- Agenda: diário às **06:00 UTC (03:00 BRT)** + **execução manual** (`workflow_dispatch`).
- Pipeline: `pg_dump → gzip -9 → gpg AES256` → artifact `metalab-backup-AAAA-MM-DD-HH-mm.sql.gz.gpg`.
- Retenção do artifact: **30 dias**.
- Conexão: o job usa o secret `DATABASE_URL` e **converte internamente para session mode
  (porta 5432)** — `pg_dump` não funciona pelo pooler de transação (6543/pgbouncer).
  A URL nunca é impressa nos logs.

## Secrets necessários

| Secret | Para quê | Observação |
|---|---|---|
| `DATABASE_URL` | conexão ao banco | já existe no repo; o job troca `:6543`→`:5432` |
| `BACKUP_PASSPHRASE` | cifrar/decifrar o dump | **criar**; guardar no gerenciador de senhas. **Sem ela, o backup é irrecuperável.** |

Criar o secret de passphrase:
`Settings → Secrets and variables → Actions → New repository secret`
→ nome `BACKUP_PASSPHRASE`, valor = passphrase forte (ex.: 32+ chars aleatórios).

## Executar manualmente

- **UI:** aba **Actions** → workflow **DB Backup (Supabase)** → **Run workflow**.
- **CLI:**
  ```bash
  gh workflow run db-backup.yml --repo zerkjee/metalab-farma
  gh run watch --repo zerkjee/metalab-farma   # acompanhar
  ```

## Baixar o backup

- **UI:** Actions → run concluído → seção **Artifacts** → baixar o `.sql.gz.gpg`.
- **CLI:**
  ```bash
  # Último run do workflow:
  RID=$(gh run list --repo zerkjee/metalab-farma --workflow db-backup.yml -L1 --json databaseId -q '.[0].databaseId')
  gh run download "$RID" --repo zerkjee/metalab-farma -D ./restore-tmp
  ```
  > O GitHub empacota o artifact em `.zip`; ao descompactar você obtém o `.sql.gz.gpg`.

## Descompactar (decifrar + descomprimir)

```bash
cd ./restore-tmp
# 1) decifrar (vai pedir a BACKUP_PASSPHRASE):
gpg --batch --decrypt --output metalab-backup.sql.gz metalab-backup-AAAA-MM-DD-HH-mm.sql.gz.gpg
# 2) descomprimir:
gunzip metalab-backup.sql.gz        # → metalab-backup.sql
```

## Restaurar em um banco de TESTE (nunca em produção)

> 🔴 Nunca restaure direto na produção. Valide num banco descartável primeiro.

```bash
# Postgres local de teste (Docker):
docker run -d --name pg-restore-test -e POSTGRES_PASSWORD=test -p 5433:5432 postgres:17
export TARGET="postgresql://postgres:test@localhost:5433/postgres"

# Restaurar (dump em formato plain = psql):
psql "$TARGET" -v ON_ERROR_STOP=1 -f metalab-backup.sql
```

## Validar tabelas principais

```sql
-- nº de tabelas no schema public (esperado: 18)
SELECT count(*) FROM information_schema.tables
  WHERE table_schema='public' AND table_type='BASE TABLE';

-- contagens (comparar com o dia do backup; baseline 15/06/2026):
SELECT 'produtos' t, count(*) FROM produtos
UNION ALL SELECT 'pedidos', count(*) FROM pedidos
UNION ALL SELECT 'usuarios', count(*) FROM usuarios
UNION ALL SELECT 'itens_pedido', count(*) FROM itens_pedido
UNION ALL SELECT 'categorias', count(*) FROM categorias;

-- migrations aplicadas (esperado: 4):
SELECT migration_name FROM _prisma_migrations ORDER BY finished_at;
```

Baseline de referência (15/06/2026): produtos 37 · pedidos 10 · usuarios 8 ·
itens_pedido 12 · categorias 13 · cupons 10 · 18 tabelas · 4 migrations.

## Checklist pós-restore

- [ ] Decifração OK (passphrase correta).
- [ ] `psql` aplicou sem erros (`ON_ERROR_STOP=1`).
- [ ] 18 tabelas em `public`; 4 migrations em `_prisma_migrations`.
- [ ] Contagens batem com o esperado para a data do backup.
- [ ] Spot-check: `SELECT * FROM pedidos ORDER BY "criadoEm" DESC LIMIT 3;` tem dados coerentes.
- [ ] (Se for promover a produção) seguir o [`RUNBOOK-restore-banco.md`](./RUNBOOK-restore-banco.md) e atualizar `DATABASE_URL`/`DIRECT_URL` na Vercel só se o host/projeto mudou.

---

## Segurança & riscos restantes

- ✅ Dump **cifrado** (AES256) — seguro mesmo em repo público.
- ✅ `DATABASE_URL`/`BACKUP_PASSPHRASE` nunca impressos; mascarados pelo Actions.
- ✅ Dumps **não** são commitados (`.gitignore`).
- ⚠️ **Backup ≠ alta disponibilidade:** isto protege contra perda de dados, mas **não**
  remove o **auto-pause** do Supabase Free nem dá PITR. A correção completa continua
  sendo o upgrade para Pro (ver `LAUNCH-READINESS.md`, BLK-01).
- ⚠️ Recuperação é até o **último backup diário** (perda máx. ~24h). PITR resolveria.
- ⚠️ **Guardar a `BACKUP_PASSPHRASE`** com segurança e redundância: sem ela os backups
  são irrecuperáveis. Rotação invalida a decifração de backups antigos.
- ⚠️ O artifact expira em 30 dias — para retenção longa, baixar/arquivar externamente.

_Última atualização: 15/06/2026._
