from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.approval_queue import ChangeType


class ChangeHistory(Base):
    __tablename__ = "change_history"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    approval_id = Column(Integer, ForeignKey("approval_queue.id"))
    change_type = Column(Enum(ChangeType), nullable=False)
    old_value = Column(JSON)
    new_value = Column(JSON)
    applied_by = Column(String(100), default="system")
    notes = Column(Text)
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="change_history")
