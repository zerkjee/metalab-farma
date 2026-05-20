from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class MercadoLivreBaseClient(ABC):
    """Interface para a API do Mercado Livre. Implementações: mock e real."""

    @abstractmethod
    async def get_listings(self, seller_id: str, offset: int = 0, limit: int = 50) -> Dict[str, Any]:
        ...

    @abstractmethod
    async def get_listing(self, listing_id: str) -> Dict[str, Any]:
        ...

    @abstractmethod
    async def update_listing(self, listing_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        ...

    @abstractmethod
    async def get_competitors(self, category_id: str, price: float) -> List[Dict[str, Any]]:
        ...

    @abstractmethod
    async def get_listing_visits(self, listing_id: str, date_from: str, date_to: str) -> Dict[str, Any]:
        ...

    @abstractmethod
    async def get_ads_campaigns(self, seller_id: str) -> List[Dict[str, Any]]:
        ...

    @abstractmethod
    async def create_ads_campaign(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        ...
