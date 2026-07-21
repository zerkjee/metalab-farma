from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "env": settings.APP_ENV,
        "mode": "mock" if settings.use_mock else "live",
        "version": "1.0.0",
    }
