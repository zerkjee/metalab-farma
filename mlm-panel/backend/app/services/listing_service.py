from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.models.listing import Listing
from app.models.seo_analysis import SeoAnalysis
from app.models.approval_queue import ApprovalQueue, ApprovalStatus, ChangeType
from app.models.change_history import ChangeHistory
from datetime import datetime, timezone


def get_listings(db: Session, skip: int = 0, limit: int = 50, status: Optional[str] = None):
    query = db.query(Listing)
    if status:
        query = query.filter(Listing.status == status)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total


def get_listing(db: Session, listing_id: int) -> Optional[Listing]:
    return (
        db.query(Listing)
        .options(
            joinedload(Listing.competitors),
            joinedload(Listing.ads_campaigns),
            joinedload(Listing.approval_queue),
            joinedload(Listing.seo_analyses),
        )
        .filter(Listing.id == listing_id)
        .first()
    )


def analyze_listing(db: Session, listing_id: int) -> Optional[SeoAnalysis]:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None

    title_score = min(100, len(listing.title) * 2)
    score = (title_score + 60) // 2

    issues = []
    opportunities = []

    if len(listing.title) < 40:
        issues.append("Título muito curto (menos de 40 caracteres)")
    if listing.visits > 0 and listing.conversion_rate < 2.0:
        opportunities.append("Taxa de conversão abaixo da média — revisar preço e fotos")
    if listing.health_score < 70:
        issues.append("Health score abaixo de 70 — verificar atributos obrigatórios")
    if listing.stock < 5:
        opportunities.append("Estoque baixo pode prejudicar ranking")

    opportunities.append("Adicionar vídeo ao anúncio pode aumentar conversão em até 20%")

    analysis = SeoAnalysis(
        listing_id=listing_id,
        score=score,
        title_score=title_score,
        description_score=60,
        images_score=70,
        attributes_score=65,
        keyword_suggestions=["whey protein", "suplemento", "proteína", "massa muscular"],
        issues=issues,
        opportunities=opportunities,
        suggested_title=f"{listing.title} | Entrega Rápida",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def approve_change(db: Session, approval_id: int, reviewed_by: str, notes: Optional[str] = None) -> Optional[ApprovalQueue]:
    item = db.query(ApprovalQueue).filter(ApprovalQueue.id == approval_id, ApprovalQueue.status == ApprovalStatus.pending).first()
    if not item:
        return None

    item.status = ApprovalStatus.approved
    item.reviewed_by = reviewed_by
    item.reviewed_at = datetime.now(timezone.utc)

    history = ChangeHistory(
        listing_id=item.listing_id,
        approval_id=item.id,
        change_type=item.change_type,
        old_value=item.current_value,
        new_value=item.proposed_value,
        applied_by=reviewed_by,
        notes=notes,
    )
    db.add(history)
    db.commit()
    db.refresh(item)
    return item


def reject_change(db: Session, approval_id: int, reviewed_by: str, rejection_reason: str) -> Optional[ApprovalQueue]:
    item = db.query(ApprovalQueue).filter(ApprovalQueue.id == approval_id, ApprovalQueue.status == ApprovalStatus.pending).first()
    if not item:
        return None

    item.status = ApprovalStatus.rejected
    item.reviewed_by = reviewed_by
    item.reviewed_at = datetime.now(timezone.utc)
    item.rejection_reason = rejection_reason
    db.commit()
    db.refresh(item)
    return item
