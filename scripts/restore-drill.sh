#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# restore-drill.sh — Prova de recuperabilidade do backup automático (BLK-01).
#
# Baixa o artifact cifrado mais recente do workflow db-backup.yml, decifra
# (GPG AES256), descomprime e RESTAURA num banco-alvo DESCARTÁVEL, depois valida.
# NUNCA toca produção — há guarda que aborta se a URL-alvo apontar pro projeto real.
#
# Pré-requisitos:
#   - gh CLI autenticado como owner (zerkjee)
#   - gpg, gunzip, psql instalados
#   - BACKUP_PASSPHRASE  no ambiente (o secret do GitHub — só o owner tem)
#   - TARGET_DATABASE_URL no ambiente, apontando pra um Postgres de teste
#       (local: postgres://postgres@localhost:5432/metalab_restore_test)
#
# Uso:
#   BACKUP_PASSPHRASE='...' TARGET_DATABASE_URL='postgres://...localhost.../metalab_restore_test' \
#     bash scripts/restore-drill.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO="zerkjee/metalab-farma"
PROD_REF="ndbbpkwnfqypajjneabx"   # project ref de produção — proibido como alvo

: "${BACKUP_PASSPHRASE:?defina BACKUP_PASSPHRASE (secret do GitHub) no ambiente}"
: "${TARGET_DATABASE_URL:?defina TARGET_DATABASE_URL apontando pra um banco de TESTE}"

# ── Guarda anti-produção ─────────────────────────────────────────────────────
if printf '%s' "$TARGET_DATABASE_URL" | grep -qiE "${PROD_REF}|pooler\.supabase\.com|:6543"; then
  echo "ABORTADO: TARGET_DATABASE_URL parece ser produção (${PROD_REF}/pooler Supabase)." >&2
  echo "Este drill só roda contra um banco descartável. Use um Postgres local/temporário." >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"

echo "==> [1/5] Descobrindo o último backup verde…"
RUN_ID="$(gh run list -R "$REPO" --workflow=db-backup.yml --status=success -L1 \
            --json databaseId -q '.[0].databaseId')"
[ -n "$RUN_ID" ] || { echo "Nenhum run verde do db-backup encontrado." >&2; exit 1; }
echo "    run id: $RUN_ID"

echo "==> [2/5] Baixando o artifact cifrado…"
gh run download -R "$REPO" "$RUN_ID"
GPG_FILE="$(find . -type f -name '*.sql.gz.gpg' | head -1)"
[ -n "$GPG_FILE" ] || { echo "Artifact .sql.gz.gpg não encontrado no run." >&2; exit 1; }
echo "    arquivo: $GPG_FILE ($(wc -c <"$GPG_FILE") bytes)"

echo "==> [3/5] Decifrando + descomprimindo…"
gpg --batch --quiet --decrypt --passphrase "$BACKUP_PASSPHRASE" "$GPG_FILE" \
  | gunzip > dump.sql
echo "    dump.sql: $(wc -c <dump.sql) bytes, $(grep -c '^' dump.sql) linhas"

echo "==> [4/5] Restaurando no banco-alvo de TESTE…"
psql "$TARGET_DATABASE_URL" -v ON_ERROR_STOP=1 -q -f dump.sql
echo "    restore concluído."

echo "==> [5/5] Validando…"
psql "$TARGET_DATABASE_URL" -At <<'SQL'
\echo Tabelas (schema public):
SELECT count(*) FROM information_schema.tables
  WHERE table_schema='public' AND table_type='BASE TABLE';
\echo Produtos:
SELECT count(*) FROM produtos;
\echo Pedidos:
SELECT count(*) FROM pedidos;
\echo Usuarios:
SELECT count(*) FROM usuarios;
\echo Migrations aplicadas:
SELECT count(*) FROM _prisma_migrations WHERE rolled_back_at IS NULL;
SQL

echo ""
echo "✅ DRILL OK — o backup é recuperável. (Banco de teste descartável; produção intocada.)"
echo "   Registre a data deste drill no RUNBOOK §8 / LAUNCH-READINESS."
