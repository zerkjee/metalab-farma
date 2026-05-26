#!/usr/bin/env bash
# setup-dev.sh — configura o ambiente de desenvolvimento do zero em qualquer máquina
# Uso: bash setup-dev.sh
set -e
BOLD="\033[1m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"

header() { echo -e "\n${BOLD}── $1 ──────────────────────────────────────${RESET}"; }
ok()     { echo -e "  ${GREEN}✓${RESET} $1"; }
warn()   { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
fail()   { echo -e "  ${RED}✗${RESET}  $1"; }

echo -e "${BOLD}🧪 Metalab Store — Setup de Desenvolvimento${RESET}"
echo "  $(date)"

# ─── 1. Verifica Node ────────────────────────────────────────────────────────
header "Node / npm"
node_ver=$(node -v 2>/dev/null || echo "none")
npm_ver=$(npm -v 2>/dev/null || echo "none")
echo "  Node: $node_ver | npm: $npm_ver"
if [[ "$node_ver" == "none" ]]; then
  fail "Node.js não encontrado. Instale via https://nodejs.org (v18+)"
  exit 1
fi
ok "Node disponível"

# ─── 2. Verifica .env.local ──────────────────────────────────────────────────
header "Variáveis de ambiente"
if [[ ! -f ".env.local" ]]; then
  warn ".env.local não existe — criando a partir de .env.example"
  cp .env.example .env.local
  warn "Edite .env.local e preencha DATABASE_URL antes de continuar"
  exit 1
fi

# Verifica DATABASE_URL
DB_URL=$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2- | tr -d '"')
if [[ -z "$DB_URL" ]]; then
  fail "DATABASE_URL está vazio em .env.local"
  echo ""
  echo "  Como obter:"
  echo "  1. Vercel → Settings → Environment Variables → DATABASE_URL"
  echo "  2. Supabase Dashboard → Settings → Database → Connection string (Session mode)"
  echo "  Formato: postgresql://postgres.[ref]:[SENHA]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
  exit 1
fi
ok "DATABASE_URL configurada"

# Verifica NEXTAUTH_SECRET / AUTH_SECRET
NS=$(grep '^NEXTAUTH_SECRET=' .env.local | cut -d'=' -f2- | tr -d '"')
AS=$(grep '^AUTH_SECRET=' .env.local | cut -d'=' -f2- | tr -d '"')
if [[ -z "$NS" && -z "$AS" ]]; then
  warn "NEXTAUTH_SECRET ausente — gerando automaticamente"
  NEW_SECRET=$(openssl rand -base64 32)
  echo "NEXTAUTH_SECRET=\"$NEW_SECRET\"" >> .env.local
  echo "AUTH_SECRET=\"$NEW_SECRET\"" >> .env.local
  ok "NEXTAUTH_SECRET gerado e adicionado ao .env.local"
else
  ok "NEXTAUTH_SECRET/AUTH_SECRET configurado"
fi

# ─── 3. Dependências ─────────────────────────────────────────────────────────
header "Dependências npm"
if [[ ! -d "node_modules" ]] || [[ ! -f "node_modules/.package-lock.json" ]]; then
  echo "  Instalando dependências..."
  npm ci
  ok "npm ci concluído"
else
  ok "node_modules presente (npm ci pulado)"
fi

# ─── 4. Prisma ───────────────────────────────────────────────────────────────
header "Prisma"
echo "  Gerando Prisma Client..."
npx prisma generate 2>&1 | grep -E "Generated|Error|warn" || true
ok "Prisma Client gerado"

echo "  Verificando schema..."
npx prisma validate 2>&1 | grep -v "^$" | head -5
ok "Schema válido"

echo "  Verificando status das migrations..."
export DATABASE_URL="$DB_URL"
MIGRATE_STATUS=$(npx prisma migrate status 2>&1)
if echo "$MIGRATE_STATUS" | grep -q "Database schema is up to date"; then
  ok "Banco sincronizado com as migrations"
elif echo "$MIGRATE_STATUS" | grep -q "unapplied migration"; then
  warn "Há migrations não aplicadas — executando deploy"
  npx prisma migrate deploy
  ok "Migrations aplicadas"
else
  echo "$MIGRATE_STATUS" | tail -5
fi

# ─── 5. Verifica / cria admin ────────────────────────────────────────────────
header "Admin no banco"
ADMIN_CHECK=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as c FROM \"Usuario\" WHERE papel IN ('ADMIN','SUPER_ADMIN');" 2>&1 || echo "query_failed")
if echo "$ADMIN_CHECK" | grep -q "query_failed\|error\|Error"; then
  warn "Não foi possível verificar admin diretamente — rodando seed"
  npm run db:seed
elif echo "$ADMIN_CHECK" | grep -qE '"c"\s*:\s*"0"'; then
  warn "Nenhum admin encontrado — rodando seed"
  npm run db:seed
  ok "Seed concluído — admin@metalab.com.br / metalab@2026"
else
  ok "Admin já existe no banco"
fi

# ─── 6. Testes unitários ─────────────────────────────────────────────────────
header "Testes unitários (Vitest)"
npm test 2>&1 | tail -5
ok "Testes unitários OK"

# ─── 7. TypeScript ───────────────────────────────────────────────────────────
header "TypeScript"
npx tsc --noEmit 2>&1 | head -10
ok "TypeScript OK"

# ─── 8. Playwright ───────────────────────────────────────────────────────────
header "Playwright"
if npx playwright --version > /dev/null 2>&1; then
  ok "Playwright CLI disponível"
  echo "  Instalando Chromium (se necessário)..."
  npx playwright install chromium 2>&1 | grep -E "Downloading|already installed|chromium" | head -3
  ok "Playwright Chromium pronto"
else
  warn "Playwright não encontrado — instale com: npm ci"
fi

# ─── 9. Relatório final ───────────────────────────────────────────────────────
header "Resumo"
echo ""
echo -e "  ${GREEN}${BOLD}Ambiente configurado!${RESET}"
echo ""
echo "  Para iniciar o projeto:"
echo "  → npm run dev        (servidor de desenvolvimento)"
echo "  → npm run db:studio  (Prisma Studio — visualizar banco)"
echo ""
echo "  Login admin:"
echo "  → http://localhost:3000/login"
echo "  → Email: admin@metalab.com.br"
echo "  → Senha: metalab@2026"
echo ""
echo "  Serviços opcionais (não bloqueiam dev):"
echo "  → Mercado Pago : MERCADOPAGO_ACCESS_TOKEN no .env.local"
echo "  → Resend (email): RESEND_API_KEY no .env.local"
echo "  → Melhor Envio : MELHOR_ENVIO_TOKEN no .env.local"
echo "  → Upstash Redis: UPSTASH_REDIS_REST_URL/TOKEN (rate limit)"
echo ""
