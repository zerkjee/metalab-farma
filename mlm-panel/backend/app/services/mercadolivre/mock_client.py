from typing import List, Dict, Any
from app.services.mercadolivre.base_client import MercadoLivreBaseClient


class MercadoLivreMockClient(MercadoLivreBaseClient):
    """Cliente mock que retorna dados simulados para desenvolvimento."""

    async def get_listings(self, seller_id: str, offset: int = 0, limit: int = 50) -> Dict[str, Any]:
        return {"results": [], "paging": {"total": 0, "offset": offset, "limit": limit}}

    async def get_listing(self, listing_id: str) -> Dict[str, Any]:
        return {"id": listing_id, "title": "Produto Mock", "price": 99.90}

    async def update_listing(self, listing_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"id": listing_id, **payload, "updated": True}

    async def get_competitors(self, category_id: str, price: float) -> List[Dict[str, Any]]:
        return []

    async def get_listing_visits(self, listing_id: str, date_from: str, date_to: str) -> Dict[str, Any]:
        return {"total_visits": 0, "date_from": date_from, "date_to": date_to}

    async def get_ads_campaigns(self, seller_id: str) -> List[Dict[str, Any]]:
        return []

    async def create_ads_campaign(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"id": "mock_campaign_001", **payload, "status": "active"}
