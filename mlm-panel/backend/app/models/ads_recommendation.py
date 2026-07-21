from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class RecommendationType(str, enum.Enum):
    increase_budget = "increase_budget"
    decrease_budget = "decrease_budget"
    pause_campaign = "pause_campaign"
    new_campaign = "new_campaign"
    adjust_targeting = "adjust_targeting"


class RecommendationStatus(str, enum.Enum):
    pending = "pending"
    applied = "applied"
    dismissed = "dismissed"


class AdsRecommendation(Base):
    __tablename__ = "ads_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("ads_campaigns.id"), nullable=True)
    recommendation_type = Column(Enum(RecommendationType), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    expected_improvement = Column(String(100))
    suggested_budget = Column(Float)
    status = Column(Enum(RecommendationStatus), default=RecommendationStatus.pending)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    campaign = relationship("AdsCampaign", back_populates="recommendations")
