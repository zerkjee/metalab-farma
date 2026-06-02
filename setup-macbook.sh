#!/bin/bash
# setup-macbook.sh — Setup completo para o novo MacBook de Pedro
# Execute: chmod +x setup-macbook.sh && ./setup-macbook.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
step()    { echo -e "\n${YELLOW}==>${NC} $1"; }

# ─────────────────────────────────────────────
step "1. Homebrew"
# ─────────────────────────────────────────────
if ! command -v brew &>/dev/null; then
  info "Instalando Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Adiciona brew ao PATH (Apple Silicon)
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
else
  success "Homebrew já instalado: $(brew --version | head -1)"
fi

# ─────────────────────────────────────────────
step "2. CLI essenciais"
# ─────────────────────────────────────────────
BREWS=(git curl wget jq unzip tree htop ffmpeg)
for pkg in "${BREWS[@]}"; do
  if brew list "$pkg" &>/dev/null; then
    success "$pkg já instalado"
  else
    info "Instalando $pkg..."
    brew install "$pkg"
  fi
done

# ─────────────────────────────────────────────
step "3. Python 3.12"
# ─────────────────────────────────────────────
if ! command -v python3.12 &>/dev/null; then
  info "Instalando Python 3.12..."
  brew install python@3.12
  echo 'export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"' >> ~/.zprofile
  export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"
else
  success "Python 3.12 já instalado: $(python3.12 --version)"
fi

# pip atualizado
python3.12 -m pip install --upgrade pip --quiet

# ─────────────────────────────────────────────
step "4. Node.js (via nvm)"
# ─────────────────────────────────────────────
if ! command -v nvm &>/dev/null 2>&1; then
  info "Instalando nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  success "nvm já instalado"
fi

info "Instalando Node.js LTS (v22)..."
nvm install 22
nvm alias default 22
nvm use 22
success "Node: $(node --version) | npm: $(npm --version)"

# ─────────────────────────────────────────────
step "5. pnpm (gerenciador usado nos projetos Next.js)"
# ─────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  info "Instalando pnpm..."
  npm install -g pnpm
else
  success "pnpm já instalado: $(pnpm --version)"
fi

# ─────────────────────────────────────────────
step "6. Java (JDK 21)"
# ─────────────────────────────────────────────
if ! command -v java &>/dev/null; then
  info "Instalando JDK 21..."
  brew install openjdk@21
  echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zprofile
  export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
  sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk \
    /Library/Java/JavaVirtualMachines/openjdk-21.jdk 2>/dev/null || true
else
  success "Java já instalado: $(java --version 2>&1 | head -1)"
fi

# ─────────────────────────────────────────────
step "7. g++ / compilador C++"
# ─────────────────────────────────────────────
if ! command -v g++ &>/dev/null; then
  info "Instalando GCC..."
  brew install gcc
else
  success "g++ já instalado: $(g++ --version | head -1)"
fi

# ─────────────────────────────────────────────
step "8. PostgreSQL (Metalab Store / Farma)"
# ─────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  info "Instalando PostgreSQL 16..."
  brew install postgresql@16
  echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zprofile
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
  brew services start postgresql@16
else
  success "PostgreSQL já instalado: $(psql --version)"
fi

# ─────────────────────────────────────────────
step "9. Redis (Upstash local para dev)"
# ─────────────────────────────────────────────
if ! command -v redis-cli &>/dev/null; then
  info "Instalando Redis..."
  brew install redis
  brew services start redis
else
  success "Redis já instalado: $(redis-cli --version)"
fi

# ─────────────────────────────────────────────
step "10. Claude Code (CLI)"
# ─────────────────────────────────────────────
if ! command -v claude &>/dev/null; then
  info "Instalando Claude Code..."
  npm install -g @anthropic-ai/claude-code
else
  success "Claude Code já instalado: $(claude --version 2>/dev/null || echo 'ok')"
fi

# ─────────────────────────────────────────────
step "11. Python global — pacotes usados em todos os projetos"
# ─────────────────────────────────────────────
info "Instalando pacotes Python globais..."
python3.12 -m pip install --quiet \
  requests \
  pandas \
  openpyxl \
  anthropic \
  pydantic \
  python-dotenv \
  Pillow \
  reportlab \
  python-barcode \
  fastapi \
  "uvicorn[standard]" \
  sqlalchemy \
  apscheduler \
  jinja2
success "Pacotes Python instalados"

# ─────────────────────────────────────────────
step "12. Apps desktop (via Homebrew Cask)"
# ─────────────────────────────────────────────
CASKS=(visual-studio-code iterm2)
for app in "${CASKS[@]}"; do
  if brew list --cask "$app" &>/dev/null; then
    success "$app já instalado"
  else
    info "Instalando $app..."
    brew install --cask "$app" || info "Pulando $app (pode já estar instalado via outro método)"
  fi
done

# ─────────────────────────────────────────────
step "13. Variáveis de ambiente — crie o arquivo .env"
# ─────────────────────────────────────────────
ENV_FILE="$HOME/.env.metalab"
if [ ! -f "$ENV_FILE" ]; then
cat > "$ENV_FILE" <<'ENVEOF'
# ─── Metalab Store / Farma ───────────────────
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/metalab_store"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/metalab_store"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"

# ─── Redis (Upstash) ─────────────────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ─── Cloudinary ──────────────────────────────
CLOUDINARY_URL=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# ─── MercadoPago ─────────────────────────────
MP_ACCESS_TOKEN=""
MP_PUBLIC_KEY=""

# ─── Anthropic / Claude ──────────────────────
ANTHROPIC_API_KEY=""

# ─── Sentry ──────────────────────────────────
SENTRY_DSN=""
ENVEOF
  info "Arquivo $ENV_FILE criado. Preencha as chaves antes de rodar os projetos."
else
  success "$ENV_FILE já existe"
fi

# ─────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} Setup concluído!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Próximos passos:"
echo "  1. Abra um novo terminal para recarregar o PATH"
echo "  2. Preencha as chaves em ~/.env.metalab"
echo "  3. Clone os projetos do GitHub"
echo ""
echo "  Comandos por projeto:"
echo ""
echo "  [metalab-store / metalab-farma]"
echo "    cd metalab-store/frontend && pnpm install && pnpm dev"
echo "    cd metalab-farma         && pnpm install && pnpm dev"
echo ""
echo "  [ml-automation (FastAPI)]"
echo "    cd ml-automation && python3.12 -m venv venv && source venv/bin/activate"
echo "    pip install -r requirements.txt && uvicorn main:app --reload"
echo ""
echo "  [ZPL to PDF]"
echo "    cd zpl-to-pdf && python3.12 zpl_to_pdf.py input.zpl output.pdf"
echo ""
echo "  [Java (estudo)]"
echo "    javac Main.java && java Main"
echo ""
echo "  [C++]"
echo "    g++ -o calculadora Calculadora.cpp && ./calculadora"
echo ""
