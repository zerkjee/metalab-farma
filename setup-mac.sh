#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# setup-mac.sh — Metalab Store · Setup completo para macOS (Apple Silicon + Intel)
# Uso: bash setup-mac.sh
# ══════════════════════════════════════════════════════════════════════════════
set -e

BOLD="\033[1m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; CYAN="\033[36m"; RESET="\033[0m"
ok()     { echo -e "  ${GREEN}✓${RESET}  $1"; }
warn()   { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
fail()   { echo -e "  ${RED}✗${RESET}  $1"; }
info()   { echo -e "  ${CYAN}→${RESET}  $1"; }
header() { echo -e "\n${BOLD}━━ $1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; }

echo ""
echo -e "${BOLD}🧬 Metalab Store — Setup para macOS${RESET}"
echo "   $(date)"
echo ""

# ─── Detecta arquitetura ──────────────────────────────────────────────────────
ARCH=$(uname -m)
[[ "$ARCH" == "arm64" ]] && info "Apple Silicon (M1/M2/M3/M4)" || info "Intel x86_64"

# ══════════════════════════════════════════════════════════════════════════════
header "1. Homebrew"
# ══════════════════════════════════════════════════════════════════════════════
if command -v brew &>/dev/null; then
  ok "Homebrew já instalado ($(brew --version | head -1))"
else
  warn "Homebrew não encontrado — instalando..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Adiciona brew ao PATH para Apple Silicon
  if [[ "$ARCH" == "arm64" ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  ok "Homebrew instalado"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "2. Node.js 22 (via nvm)"
# ══════════════════════════════════════════════════════════════════════════════
if ! command -v nvm &>/dev/null && [[ ! -f "$HOME/.nvm/nvm.sh" ]]; then
  warn "nvm não encontrado — instalando..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
  ok "nvm instalado"
else
  export NVM_DIR="$HOME/.nvm"
  [[ -f "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"
  ok "nvm disponível"
fi

REQUIRED_NODE="22"
CURRENT_NODE=$(node -v 2>/dev/null | sed 's/v//' | cut -d'.' -f1 || echo "0")

if [[ "$CURRENT_NODE" -ge "$REQUIRED_NODE" ]]; then
  ok "Node.js $(node -v) — OK"
else
  warn "Node.js v$REQUIRED_NODE necessário — instalando via nvm..."
  nvm install 22
  nvm use 22
  nvm alias default 22
  ok "Node.js $(node -v) instalado"
fi

ok "npm $(npm -v)"

# ══════════════════════════════════════════════════════════════════════════════
header "3. Git — clonar repositório"
# ══════════════════════════════════════════════════════════════════════════════
REPO_DIR="$HOME/metalab-farma"
REPO_URL="https://github.com/zerkjee/metalab-farma.git"

if [[ -d "$REPO_DIR/.git" ]]; then
  ok "Repositório já existe em $REPO_DIR"
  cd "$REPO_DIR"
  git checkout main
  git pull origin main
  ok "Atualizado com origin/main ($(git log --oneline -1))"
else
  info "Clonando $REPO_URL..."
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
  ok "Repositório clonado em $REPO_DIR"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "4. Variáveis de ambiente (.env.local)"
# ══════════════════════════════════════════════════════════════════════════════

# Credenciais pré-configuradas — trocar senha no Supabase após primeiro uso
_DB_URL="postgresql://postgres.ndbbpkwnfqypajjneabx:P3dro*mancio@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

if [[ -f ".env.local" ]]; then
  DB_EXISTING=$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2- | tr -d '"')
  if [[ -n "$DB_EXISTING" ]]; then
    ok ".env.local já configurado"
    SKIP_ENV=true
  else
    warn ".env.local existe mas DATABASE_URL está vazio — preenchendo automaticamente"
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$_DB_URL\"|" .env.local 2>/dev/null \
      || sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$_DB_URL\"|" .env.local
    ok "DATABASE_URL preenchido"
    SKIP_ENV=true
  fi
else
  warn ".env.local não encontrado — criando..."
  SKIP_ENV=false
fi

if [[ "$SKIP_ENV" != "true" ]]; then
  cat > .env.local << ENVEOF
# ─── BANCO (Supabase) ─────────────────────────────────────────────────────────
DATABASE_URL="${_DB_URL}"

# ─── AUTH (NextAuth v5) ───────────────────────────────────────────────────────
# Secret compartilhado entre todos os ambientes do projeto
NEXTAUTH_SECRET="FzJjpiKXf7wYb7DXUJqb+SRlwEV3l9HEDT+lm3Vl6I4="
AUTH_SECRET="FzJjpiKXf7wYb7DXUJqb+SRlwEV3l9HEDT+lm3Vl6I4="
NEXTAUTH_URL="http://localhost:3000"

# ─── URLs ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Metalab Store"

# ─── MERCADO PAGO (opcional em dev) ──────────────────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=""
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=""
MP_WEBHOOK_SECRET=""

# ─── EMAIL - Resend (opcional em dev) ────────────────────────────────────────
RESEND_API_KEY=""
EMAIL_FROM="Metalab <onboarding@resend.dev>"

# ─── UPLOAD - Cloudinary (opcional em dev) ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ─── FRETE - Melhor Envio (opcional em dev) ───────────────────────────────────
MELHOR_ENVIO_TOKEN=""
MELHOR_ENVIO_ORIGIN_CEP=""
FRETE_PESO_KG="0.5"
FRETE_ALTURA_CM="10"
FRETE_LARGURA_CM="15"
FRETE_COMPRIMENTO_CM="20"

# ─── QSTASH (opcional — e-mails caem no fallback síncrono sem isso) ───────────
QSTASH_URL="https://qstash.upstash.io"
QSTASH_TOKEN=""
QSTASH_CURRENT_SIGNING_KEY=""
QSTASH_NEXT_SIGNING_KEY=""

# ─── UPSTASH REDIS (opcional — rate limit vira no-op sem isso) ────────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ─── ANALYTICS (opcional) ─────────────────────────────────────────────────────
NEXT_PUBLIC_GA4_ID=""
NEXT_PUBLIC_META_PIXEL_ID=""

# ─── SENTRY (opcional) ────────────────────────────────────────────────────────
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
SENTRY_ORG="metalab-02"
SENTRY_PROJECT="javascript-nextjs"
ENVEOF

  ok ".env.local criado"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "5. Dependências npm"
# ══════════════════════════════════════════════════════════════════════════════
npm ci
ok "npm ci concluído ($(ls node_modules | wc -l | tr -d ' ') pacotes)"

# ══════════════════════════════════════════════════════════════════════════════
header "6. Prisma"
# ══════════════════════════════════════════════════════════════════════════════
echo "  Gerando client..."
npx prisma generate 2>&1 | grep -E "Generated|Error" | head -3
ok "Prisma Client gerado"

echo "  Verificando migrations..."
MIGRATE_OUT=$(npx prisma migrate status 2>&1)
if echo "$MIGRATE_OUT" | grep -q "up to date\|Database schema is up to date"; then
  ok "Banco sincronizado — todas as migrations aplicadas"
elif echo "$MIGRATE_OUT" | grep -q "unapplied\|pending"; then
  warn "Migrations pendentes — aplicando..."
  npx prisma migrate deploy
  ok "Migrations aplicadas"
else
  warn "Status: $(echo "$MIGRATE_OUT" | tail -3)"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "7. Admin no banco"
# ══════════════════════════════════════════════════════════════════════════════
SEED_CHECK=$(npx ts-node --compiler-options '{"module":"CommonJS"}' -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.usuario.count({ where: { papel: { in: ['ADMIN','SUPER_ADMIN'] } } })
  .then(n => { console.log(n); process.exit(0); })
  .catch(() => { console.log('-1'); process.exit(0); })
  .finally(() => p.\$disconnect());
" 2>/dev/null || echo "-1")

if [[ "$SEED_CHECK" == "0" || "$SEED_CHECK" == "-1" ]]; then
  warn "Admin não encontrado — rodando seed..."
  npm run db:seed
  ok "Seed concluído"
  echo ""
  echo -e "  ${BOLD}Credenciais admin criadas:${RESET}"
  echo "  Email : admin@metalab.com.br"
  echo "  Senha : metalab@2026"
else
  ok "Admin já existe no banco ($SEED_CHECK usuário(s) admin)"
fi

# ══════════════════════════════════════════════════════════════════════════════
header "8. Playwright (E2E)"
# ══════════════════════════════════════════════════════════════════════════════
npx playwright install chromium 2>&1 | grep -E "Downloading|already installed|chromium" | head -3
ok "Playwright Chromium pronto"

# ══════════════════════════════════════════════════════════════════════════════
header "9. Testes unitários"
# ══════════════════════════════════════════════════════════════════════════════
npm test 2>&1 | tail -4

# ══════════════════════════════════════════════════════════════════════════════
header "✅ Setup concluído!"
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "  ${GREEN}${BOLD}Tudo configurado! Para iniciar:${RESET}"
echo ""
echo "  cd $REPO_DIR"
echo "  npm run dev"
echo ""
echo -e "  ${BOLD}Acesse no browser:${RESET}  http://localhost:3000"
echo ""
echo -e "  ${BOLD}Login admin:${RESET}"
echo "  → http://localhost:3000/login"
echo "  → admin@metalab.com.br / metalab@2026"
echo ""
echo -e "  ${BOLD}Comandos úteis:${RESET}"
echo "  npm run db:studio    → Prisma Studio (visualizar banco)"
echo "  npm run db:seed      → Recriar dados iniciais"
echo "  npm test             → Testes unitários"
echo "  npm run test:e2e     → Testes E2E (Playwright)"
echo "  npm run lint         → ESLint"
echo ""
