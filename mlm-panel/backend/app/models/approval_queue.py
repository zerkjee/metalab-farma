from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class ChangeType(str, enum.Enum):
    title = "title"
    price = "price"
    description = "description"
    stock = "stock"
    images = "images"
    attributes = "attributes"
    ads_budget = "ads_budget"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ApprovalQueue(Base):
    __tablename__ = "approval_queue"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    change_type = Column(Enum(ChangeType), nullable=False)
    current_value = Column(JSON)
    proposed_value = Column(JSON)
    reason = Column(Text)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending)
    priority = Column(Integer, default=0)
    created_by = Column(String(100), default="system")
    reviewed_at = Column(DateTime)
    reviewed_by = Column(String(100))
    rejection_reason = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="approval_queue")
