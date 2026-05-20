from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class CampaignStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    ended = "ended"
    draft = "draft"


class AdsCampaign(Base):
    __tablename__ = "ads_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    ml_campaign_id = Column(String(50), unique=True, index=True, nullable=True)
    campaign_name = Column(String(200), nullable=False)
    daily_budget = Column(Float, default=0.0)
    total_spent = Column(Float, default=0.0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    ctr = Column(Float, default=0.0)
    cost_per_click = Column(Float, default=0.0)
    sales_from_ads = Column(Integer, default=0)
    roas = Column(Float, default=0.0)
    status = Column(Enum(CampaignStatus), default=CampaignStatus.draft)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="ads_campaigns")
    recommendations = relationship("AdsRecommendation", back_populates="campaign", cascade="all, delete-orphan")
