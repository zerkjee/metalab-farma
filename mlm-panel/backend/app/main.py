from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.routers import health, listings, approvals
from app.seed import seed

app = FastAPI(
    title="MTL Nutrition — Painel ML",
    description="Backend para automação e gestão de anúncios no Mercado Livre",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(listings.router)
app.include_router(approvals.router)


@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
