from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class ListingStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    closed = "closed"
    under_review = "under_review"


class ListingCondition(str, enum.Enum):
    new = "new"
    used = "used"
    refurbished = "refurbished"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ml_listing_id = Column(String(50), unique=True, index=True)
    title = Column(String(500), nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float)
    status = Column(Enum(ListingStatus), default=ListingStatus.active)
    condition = Column(Enum(ListingCondition), default=ListingCondition.new)
    stock = Column(Integer, default=0)
    sold_quantity = Column(Integer, default=0)
    visits = Column(Integer, default=0)
    conversion_rate = Column(Float, default=0.0)
    health_score = Column(Integer, default=0)
    thumbnail_url = Column(String(500))
    permalink = Column(String(500))
    category_id = Column(String(50))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="listings")
    competitors = relationship("Competitor", back_populates="listing", cascade="all, delete-orphan")
    seo_analyses = relationship("SeoAnalysis", back_populates="listing", cascade="all, delete-orphan")
    approval_queue = relationship("ApprovalQueue", back_populates="listing", cascade="all, delete-orphan")
    change_history = relationship("ChangeHistory", back_populates="listing", cascade="all, delete-orphan")
    ads_campaigns = relationship("AdsCampaign", back_populates="listing", cascade="all, delete-orphan")
