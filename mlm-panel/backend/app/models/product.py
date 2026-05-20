from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    sku = Column(String(100), unique=True, index=True)
    brand = Column(String(200))
    category = Column(String(200))
    description = Column(Text)
    images = Column(JSON, default=list)
    weight_kg = Column(Float)
    dimensions_cm = Column(JSON)
    cost_price = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    listings = relationship("Listing", back_populates="product")
