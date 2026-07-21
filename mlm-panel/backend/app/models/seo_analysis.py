from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class SeoAnalysis(Base):
    __tablename__ = "seo_analyses"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    score = Column(Integer, default=0)
    title_score = Column(Integer, default=0)
    description_score = Column(Integer, default=0)
    images_score = Column(Integer, default=0)
    attributes_score = Column(Integer, default=0)
    keyword_suggestions = Column(JSON, default=list)
    issues = Column(JSON, default=list)
    opportunities = Column(JSON, default=list)
    suggested_title = Column(String(500))
    suggested_description = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="seo_analyses")
