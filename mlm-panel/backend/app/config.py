from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "dev-secret-key"

    ML_CLIENT_ID: str = ""
    ML_CLIENT_SECRET: str = ""
    ML_REDIRECT_URI: str = "http://localhost:8000/auth/callback"
    ML_ACCESS_TOKEN: str = ""
    ML_REFRESH_TOKEN: str = ""
    ML_SELLER_ID: str = ""

    DATABASE_URL: str = "sqlite:///./mlm_panel.db"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def use_mock(self) -> bool:
        return not self.ML_ACCESS_TOKEN

    class Config:
        env_file = ".env"


settings = Settings()
