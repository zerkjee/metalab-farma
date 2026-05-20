from app.services.mercadolivre.base_client import MercadoLivreBaseClient
from app.services.mercadolivre.mock_client import MercadoLivreMockClient
from app.config import settings


def get_ml_client() -> MercadoLivreBaseClient:
    if settings.use_mock:
        return MercadoLivreMockClient()
    from app.services.mercadolivre.real_client import MercadoLivreRealClient  # noqa
    return MercadoLivreRealClient()
