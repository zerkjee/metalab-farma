from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.listing import ListingStatus, ListingCondition


class CompetitorSummary(BaseModel):
    id: int
    title: str
    price: float
    seller_name: str
    sales_count: int

    class Config:
        from_attributes = True


class SeoSummary(BaseModel):
    score: int
    title_score: int
    description_score: int
    issues: List[str]
    opportunities: List[str]

    class Config:
        from_attributes = True


class AdsCampaignSummary(BaseModel):
    id: int
    campaign_name: str
    status: str
    daily_budget: float
    clicks: int
    ctr: float
    roas: float

    class Config:
        from_attributes = True


class ListingBase(BaseModel):
    title: str
    price: float
    status: ListingStatus
    condition: ListingCondition
    stock: int
    health_score: int
    thumbnail_url: Optional[str] = None
    permalink: Optional[str] = None


class ListingSummary(ListingBase):
    id: int
    ml_listing_id: str
    sold_quantity: int
    visits: int
    conversion_rate: float
    updated_at: datetime

    class Config:
        from_attributes = True


class ListingDetail(ListingSummary):
    product_id: int
    original_price: Optional[float] = None
    category_id: Optional[str] = None
    created_at: datetime
    competitors: List[CompetitorSummary] = []
    latest_seo: Optional[SeoSummary] = None
    ads_campaigns: List[AdsCampaignSummary] = []
    pending_approvals: int = 0

    class Config:
        from_attributes = True


class ListingListResponse(BaseModel):
    items: List[ListingSummary]
    total: int
    page: int
    page_size: int
