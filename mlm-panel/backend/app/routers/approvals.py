from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.database import get_db
from app.models.approval_queue import ApprovalQueue, ApprovalStatus
from app.models.change_history import ChangeHistory
from app.models.listing import Listing
from app.schemas.approval import (
    ApprovalQueueListResponse,
    ApprovalQueueItem,
    ApproveRequest,
    RejectRequest,
    ChangeHistoryListResponse,
    ChangeHistoryItem,
)
from app.schemas.common import SuccessResponse
from app.services import listing_service

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("", response_model=ApprovalQueueListResponse)
def list_approvals(
    status: Optional[str] = Query("pending"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ApprovalQueue).options(joinedload(ApprovalQueue.listing))
    if status:
        query = query.filter(ApprovalQueue.status == status)
    total = query.count()
    pending_count = db.query(ApprovalQueue).filter(ApprovalQueue.status == ApprovalStatus.pending).count()
    items = query.order_by(ApprovalQueue.priority.desc(), ApprovalQueue.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for item in items:
        result.append(ApprovalQueueItem(
            **{k: v for k, v in item.__dict__.items() if not k.startswith("_")},
            listing_title=item.listing.title,
            listing_ml_id=item.listing.ml_listing_id,
        ))

    return ApprovalQueueListResponse(items=result, total=total, pending_count=pending_count)


@router.post("/{approval_id}/approve", response_model=SuccessResponse)
def approve(approval_id: int, body: ApproveRequest, db: Session = Depends(get_db)):
    item = listing_service.approve_change(db, approval_id, body.reviewed_by, body.notes)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado ou já processado")
    return SuccessResponse(message="Alteração aprovada com sucesso")


@router.post("/{approval_id}/reject", response_model=SuccessResponse)
def reject(approval_id: int, body: RejectRequest, db: Session = Depends(get_db)):
    item = listing_service.reject_change(db, approval_id, body.reviewed_by, body.rejection_reason)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado ou já processado")
    return SuccessResponse(message="Alteração rejeitada")


@router.get("/history", response_model=ChangeHistoryListResponse)
def list_history(
    listing_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ChangeHistory).options(joinedload(ChangeHistory.listing))
    if listing_id:
        query = query.filter(ChangeHistory.listing_id == listing_id)
    total = query.count()
    items = query.order_by(ChangeHistory.applied_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for item in items:
        result.append(ChangeHistoryItem(
            **{k: v for k, v in item.__dict__.items() if not k.startswith("_")},
            listing_title=item.listing.title,
        ))

    return ChangeHistoryListResponse(items=result, total=total)
