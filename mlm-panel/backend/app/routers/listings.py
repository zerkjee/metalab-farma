from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.listing import ListingListResponse, ListingDetail, ListingSummary
from app.schemas.common import SuccessResponse
from app.services import listing_service

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=ListingListResponse)
def list_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    items, total = listing_service.get_listings(db, skip=skip, limit=page_size, status=status)
    return ListingListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = listing_service.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Anúncio não encontrado")

    result = ListingDetail.model_validate(listing)
    result.pending_approvals = sum(1 for a in listing.approval_queue if a.status == "pending")
    if listing.seo_analyses:
        latest = sorted(listing.seo_analyses, key=lambda x: x.created_at, reverse=True)[0]
        from app.schemas.listing import SeoSummary
        result.latest_seo = SeoSummary.model_validate(latest)
    return result


@router.post("/{listing_id}/analyze", response_model=SuccessResponse)
def analyze_listing(listing_id: int, db: Session = Depends(get_db)):
    analysis = listing_service.analyze_listing(db, listing_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Anúncio não encontrado")
    return SuccessResponse(message="Análise SEO concluída", data={"analysis_id": analysis.id, "score": analysis.score})
