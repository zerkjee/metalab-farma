# MTL Nutrition — Painel Mercado Livre

Painel web interno para analisar, otimizar e automatizar anúncios da loja **MTL_NUTRITION** no Mercado Livre.

> Escopo: anúncios, SEO, preço, concorrentes, Ads e aprovações. Pedidos e entregas fora do escopo.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Python 3.11+ + FastAPI |
| Banco | SQLite (dev) → PostgreSQL/Supabase (prod) |
| API externa | Mercado Livre (mockada por padrão) |

## Pré-requisitos

- Node.js 20+
- Python 3.11+
- pip ou uv

---

## Como rodar

### 1. Backend

```bash
cd mlm-panel/backend

# Criar ambiente virtual
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar servidor (porta 8000)
uvicorn app.main:app --reload
```

Acesse: http://localhost:8000/docs (Swagger UI automático)

### 2. Frontend

```bash
cd mlm-panel/frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar servidor de desenvolvimento (porta 3000)
npm run dev
```

Acesse: http://localhost:3000

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/listings` | Lista anúncios |
| GET | `/listings/{id}` | Detalhe do anúncio |
| POST | `/listings/{id}/analyze` | Roda análise SEO |
| GET | `/approvals` | Fila de aprovações |
| POST | `/approvals/{id}/approve` | Aprovar alteração |
| POST | `/approvals/{id}/reject` | Rejeitar alteração |
| GET | `/approvals/history` | Histórico de alterações |

---

## Páginas do painel

| Rota | Página |
|------|--------|
| `/` | Dashboard geral |
| `/listings` | Lista de anúncios |
| `/listings/:id` | Detalhe + SEO + concorrentes |
| `/approvals` | Fila de aprovações |
| `/history` | Histórico de alterações |
| `/ads` | Campanhas de Ads (em breve) |

---

## Conectar ao Mercado Livre real

No `backend/.env`, preencha:

```env
ML_CLIENT_ID=seu_client_id
ML_CLIENT_SECRET=seu_client_secret
ML_ACCESS_TOKEN=seu_access_token
ML_SELLER_ID=seu_seller_id
```

Quando `ML_ACCESS_TOKEN` estiver preenchido, o sistema usa o cliente real. Caso contrário, usa o cliente mock automaticamente.

Para implementar o cliente real, crie `app/services/mercadolivre/real_client.py` herdando de `MercadoLivreBaseClient`.

---

## Estrutura de pastas

```
mlm-panel/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy (8 modelos)
│   │   ├── schemas/        # Pydantic
│   │   ├── routers/        # Endpoints FastAPI
│   │   ├── services/
│   │   │   └── mercadolivre/  # Interface + mock + real (a fazer)
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── seed.py         # Dados mockados realistas
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/            # Next.js App Router
        ├── components/
        │   ├── layout/     # Sidebar, Header
        │   ├── dashboard/  # StatsCard
        │   └── ui/         # Badge, ScoreRing
        └── lib/
            ├── api.ts      # Cliente HTTP
            └── types.ts    # Tipos TypeScript
```

---

## Próximos passos recomendados

1. **Cliente real ML** — Implementar `real_client.py` com OAuth2 e chamadas reais
2. **Autenticação** — JWT + tela de login
3. **Alembic** — Migrations versionadas
4. **Módulo de Ads** — Página `/ads` completa com gráficos
5. **Notificações** — Alertas de estoque crítico, saúde baixa
6. **Relatórios** — Export CSV/PDF de performance
7. **Migração PostgreSQL** — Trocar `DATABASE_URL` e ajustar driver
