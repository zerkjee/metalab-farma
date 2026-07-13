# Launch Readiness — Status & Bloqueadores (Metalab Store)

> Documento de registro do estado de prontidão para lançamento. Atualizar a cada
> mudança relevante. Companion: [`RUNBOOK-restore-banco.md`](./RUNBOOK-restore-banco.md).

**Última atualização:** 15/06/2026 · Commit auditado: `94e3afd` (main)

---

## Veredito atual

🟡 **Backup automático ATIVO e verificado (12/07/2026)** — BLK-01 **rebaixado de 🔴 para 🟡**.
O documento anterior (15/06) marcava "sem backup" no mesmo dia em que o backup foi criado;
estava desatualizado. Estado real conferido em 12/07/2026:

- ✅ Workflow `db-backup.yml` roda **diário com sucesso** (runs verdes 08–12/07; último hoje 07:56 UTC).
- ✅ Artifact do dia baixado e **validado como GPG AES256 real** (~95 KB, SQL puro cifrado); guard de tamanho `>10KB` no CI garante que não é dump vazio.
- ✅ Secrets `DATABASE_URL` + `BACKUP_PASSPHRASE` presentes no GitHub.
- ✅ Procedimento de restore **corrigido** no RUNBOOK (§2D): o backup é SQL puro → `psql`, **não** `pg_restore` (era um gap perigoso — a doc mandava usar a ferramenta errada).
- ✅ Drill de recuperação pronto: `scripts/restore-drill.sh` (restaura em banco descartável, guard anti-produção).

**Gaps residuais (hardening, não bloqueadores):**
1. ⏳ **Nunca test-restaurado de ponta a ponta** — rodar `scripts/restore-drill.sh` uma vez (precisa do `BACKUP_PASSPHRASE`). Backup não testado é esperança, não backup.
2. Retenção **30 dias** só (sem PITR / histórico longo). RPO ~24h.
3. **Cópia única** (só artifacts do GitHub). Ideal: 3-2-1 (uma cópia off-site).
4. **Auto-pause do Free ainda ativo** + sem PITR — só o **upgrade Pro (~US$25/mês)** remove. Decisão de billing do dono (adiada em 15/06).

**Nota de maturidade: 8 / 10.** (Código apto; backup operante com hardening pendente.)

---

## Bloqueador aberto (P0)

> **⚠️ ATUALIZAÇÃO 12/07/2026 — BLK-01 rebaixado para 🟡 (ver Veredito acima).** A tabela
> abaixo é o registro histórico de 15/06. Hoje há **backup automático diário cifrado
> funcionando e validado** (`db-backup.yml`); "Backups automáticos ❌ Não" **não vale mais**.
> Permanece pendente apenas: rodar o drill 1×, e a decisão de billing do upgrade Pro
> (auto-pause + PITR). Não é mais bloqueador de lançamento.

### BLK-01 — Banco de produção sem backup (Supabase plano Free) *(histórico — ver atualização acima)*
| Campo | Valor |
|---|---|
| Severidade | 🔴 Bloqueador de lançamento |
| Confirmado | 15/06/2026 (`org.plan = "free"`) |
| Risco | Perda **irreversível** de pedidos/clientes; auto-pause após 7 dias de inatividade |
| Backups automáticos | ❌ Não | 
| PITR | ❌ Não |
| Auto-pause | ⚠️ Ativo (risco) |
| **Decisão do dono (15/06/2026)** | **Upgrade adiado ("decidir depois")** — bloqueador permanece aberto por opção do dono |
| Correção definitiva | Upgrade Supabase **Pro** (~US$25/mês: backups diários + remove auto-pause) + add-on **PITR** |
| Mitigação interina (sem billing) | `pg_dump` manual periódico guardado fora do Supabase — ver Runbook §1. *(Obs.: `pg_dump` client PG17 não está instalado na máquina local; instalar antes de usar.)* |
| Quem executa | Owner da org Supabase (`zerkjee`) — ação de billing no dashboard |

**Passo a passo do upgrade:** Dashboard Supabase → org → **Billing → Upgrade to Pro** →
(opcional) `Database → Backups` → habilitar **PITR**. As connection strings
(`DATABASE_URL`/`DIRECT_URL`) **não mudam** (mesmo projeto/pooler) — sem redeploy.

---

## Resumo da Launch Readiness Review (15/06/2026)

| # | Item | Status |
|---|------|--------|
| 1 | Fluxo de compra (produto→carrinho→checkout→PIX→confirmação) | 🟢 |
| 2 | Login cliente/admin | 🟢 |
| 3 | Frete recalculado no servidor | 🟢 |
| 4 | Estoque/pedidos consistentes | 🟢 |
| 5 | Integrações degradando seguro (MP, Melhor Envio, Resend, Tiny) | 🟢 |
| 6 | Logs/Sentry sem PII | 🟢 |
| 7 | Performance | 🟡 (rodar Lighthouse; home ~240KB) |
| 8 | SEO/sitemap/robots/metadata | 🟢 (verificar OG por produto/categoria) |
| 9 | Segurança (headers, rate limit, auth, upload, webhooks) | 🟢 (follow-ups menores) |
| 10 | **Backup e recuperação** | 🔴 **BLK-01** |

**Follow-ups 🟡 (não bloqueadores):**
- Rate limit é fail-open se o Upstash cair (hoje Upstash provisionado → ativo).
- Upload confia no `file.type` declarado (mitigado pelo Cloudinary).
- Supabase: função `rls_auto_enable()` `SECURITY DEFINER` exposta ao `anon` — revogar EXECUTE.
- Lighthouse mobile/desktop não medido nesta review.

---

## Checklist de Go-Live

**Gate (obrigatório antes de clientes reais):**
- [ ] **BLK-01 resolvido:** Supabase Pro ativo · backups diários ✅ · (PITR ✅) · auto-pause removido ✅
- [ ] Verificação pós-upgrade (via MCP/SQL): banco `ACTIVE_HEALTHY`, 18 tabelas, 4 migrations, `DATABASE_URL`/`DIRECT_URL` válidas
- [ ] Smoke test **pós-upgrade** verde (ver Runbook §7)
- [ ] **Só então:** smoke test de **PIX real** (1 pedido) autorizado

**Recomendado (pode ser pós-lançamento):**
- [ ] Lighthouse mobile/desktop (LCP/CLS/INP) e mitigar payload da home se preciso
- [ ] Revogar EXECUTE de `rls_auto_enable()` no Supabase
- [ ] Verificar metadata/OpenGraph por produto e categoria
- [ ] `pg_dump` manual semanal arquivado fora do Supabase

---

## Estado verificado do banco (baseline 15/06/2026)
`ACTIVE_HEALTHY` · PostgreSQL 17.6 · 18 tabelas (public) · 4 migrations sem drift.
Linhas: usuarios 8 · produtos 37 · pedidos 10 · itens_pedido 12 · categorias 13 ·
cupons 10 · enderecos 1 · avaliacoes 0 · banners 1 · audit_logs 0.

## Smoke test executado (baseline pré-upgrade, 15/06/2026)
✅ `/`, `/produtos`, `/api/produtos`, `/api/categorias`, `/api/banners`, `/vip`,
`/avaliacoes`, `/admin/login` → HTTP 200 · `/api/frete` (POST, cotação real
Melhor Envio) → PAC R$22,08 / SEDEX R$34,62.
⏸️ Pós-upgrade e PIX real: **pendentes** (gated pelo BLK-01).

---

## Log de decisões
- **15/06/2026** — Owner optou por **adiar o upgrade do Supabase** ("decidir depois").
  Bloqueador BLK-01 registrado como aberto; loja mantida como **não liberada** para
  clientes reais / PIX real até o upgrade. Runbook de restore criado.
