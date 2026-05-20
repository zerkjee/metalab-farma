from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from app.models.approval_queue import ChangeType, ApprovalStatus


class ApprovalQueueItem(BaseModel):
    id: int
    listing_id: int
    listing_title: str
    listing_ml_id: str
    change_type: ChangeType
    current_value: Any
    proposed_value: Any
    reason: Optional[str] = None
    priority: int
    status: ApprovalStatus
    created_by: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

    class Config:
        from_attributes = True


class ApprovalQueueListResponse(BaseModel):
    items: List[ApprovalQueueItem]
    total: int
    pending_count: int


class ApproveRequest(BaseModel):
    reviewed_by: str = "admin"
    notes: Optional[str] = None


class RejectRequest(BaseModel):
    reviewed_by: str = "admin"
    rejection_reason: str


class ChangeHistoryItem(BaseModel):
    id: int
    listing_id: int
    listing_title: str
    change_type: ChangeType
    old_value: Any
    new_value: Any
    applied_by: str
    notes: Optional[str] = None
    applied_at: datetime

    class Config:
        from_attributes = True


class ChangeHistoryListResponse(BaseModel):
    items: List[ChangeHistoryItem]
    total: int
