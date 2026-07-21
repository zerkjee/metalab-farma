from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    competitor_ml_id = Column(String(50), index=True)
    title = Column(String(500))
    price = Column(Float)
    seller_id = Column(String(50))
    seller_name = Column(String(200))
    sales_count = Column(Integer, default=0)
    rating = Column(Float)
    thumbnail_url = Column(String(500))
    permalink = Column(String(500))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="competitors")
