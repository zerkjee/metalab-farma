"""Popula o banco com dados mockados realistas para MTL_NUTRITION."""
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.listing import Listing, ListingStatus, ListingCondition
from app.models.competitor import Competitor
from app.models.seo_analysis import SeoAnalysis
from app.models.approval_queue import ApprovalQueue, ChangeType, ApprovalStatus
from app.models.change_history import ChangeHistory
from app.models.ads_campaign import AdsCampaign, CampaignStatus
from app.models.ads_recommendation import AdsRecommendation, RecommendationType, RecommendationStatus
from datetime import datetime, timezone, timedelta


def seed(db: Session):
    if db.query(Product).count() > 0:
        return

    products_data = [
        {"title": "Whey Protein Concentrado 900g Baunilha", "sku": "WPC-900-BN", "brand": "MTL Nutrition", "category": "Suplementos", "cost_price": 45.00},
        {"title": "Creatina Monohidratada 300g", "sku": "CRE-300", "brand": "MTL Nutrition", "category": "Suplementos", "cost_price": 28.00},
        {"title": "Pré-Treino Explosivo 300g Frutas Vermelhas", "sku": "PRE-300-FV", "brand": "MTL Nutrition", "category": "Suplementos", "cost_price": 38.00},
        {"title": "BCAA 2:1:1 Powder 300g Limão", "sku": "BCAA-300-LM", "brand": "MTL Nutrition", "category": "Suplementos", "cost_price": 22.00},
        {"title": "Colágeno Hidrolisado + Vitamina C 300g", "sku": "COL-300-VC", "brand": "MTL Nutrition", "category": "Vitaminas", "cost_price": 30.00},
    ]

    products = [Product(**p) for p in products_data]
    db.add_all(products)
    db.flush()

    listings_data = [
        {
            "product_id": products[0].id,
            "ml_listing_id": "MLB3456789012",
            "title": "Whey Protein Concentrado 900g Baunilha MTL Nutrition",
            "price": 119.90,
            "original_price": 149.90,
            "status": ListingStatus.active,
            "stock": 48,
            "sold_quantity": 312,
            "visits": 4820,
            "conversion_rate": 6.47,
            "health_score": 82,
            "thumbnail_url": "https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg",
            "permalink": "https://www.mercadolivre.com.br/whey-protein-concentrado-900g",
        },
        {
            "product_id": products[1].id,
            "ml_listing_id": "MLB3456789013",
            "title": "Creatina Monohidratada 300g MTL Nutrition",
            "price": 59.90,
            "original_price": 79.90,
            "status": ListingStatus.active,
            "stock": 95,
            "sold_quantity": 528,
            "visits": 6210,
            "conversion_rate": 8.50,
            "health_score": 91,
            "thumbnail_url": "https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg",
            "permalink": "https://www.mercadolivre.com.br/creatina-monohidratada-300g",
        },
        {
            "product_id": products[2].id,
            "ml_listing_id": "MLB3456789014",
            "title": "Pré-Treino Explosivo 300g Frutas Vermelhas MTL Nutrition",
            "price": 89.90,
            "original_price": None,
            "status": ListingStatus.paused,
            "stock": 12,
            "sold_quantity": 87,
            "visits": 1430,
            "conversion_rate": 6.08,
            "health_score": 58,
            "thumbnail_url": "https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg",
            "permalink": "https://www.mercadolivre.com.br/pre-treino-explosivo",
        },
        {
            "product_id": products[3].id,
            "ml_listing_id": "MLB3456789015",
            "title": "BCAA 2:1:1 Powder 300g Limão",
            "price": 49.90,
            "original_price": 64.90,
            "status": ListingStatus.active,
            "stock": 67,
            "sold_quantity": 203,
            "visits": 3100,
            "conversion_rate": 6.55,
            "health_score": 74,
            "thumbnail_url": "https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg",
            "permalink": "https://www.mercadolivre.com.br/bcaa-powder-300g",
        },
        {
            "product_id": products[4].id,
            "ml_listing_id": "MLB3456789016",
            "title": "Colágeno Hidrolisado + Vitamina C 300g MTL Nutrition",
            "price": 79.90,
            "original_price": 99.90,
            "status": ListingStatus.active,
            "stock": 3,
            "sold_quantity": 145,
            "visits": 2200,
            "conversion_rate": 6.59,
            "health_score": 69,
            "thumbnail_url": "https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg",
            "permalink": "https://www.mercadolivre.com.br/colageno-hidrolisado",
        },
    ]

    listings = [Listing(**l) for l in listings_data]
    db.add_all(listings)
    db.flush()

    competitors = [
        Competitor(listing_id=listings[0].id, competitor_ml_id="MLB9001", title="Whey Protein 900g Baunilha PowerSupp", price=109.90, seller_name="PowerSupp", sales_count=890, rating=4.7),
        Competitor(listing_id=listings[0].id, competitor_ml_id="MLB9002", title="Whey Concentrado 900g Baunilha MaxMuscle", price=124.90, seller_name="MaxMuscle", sales_count=420, rating=4.5),
        Competitor(listing_id=listings[1].id, competitor_ml_id="MLB9003", title="Creatina 300g GNC", price=54.90, seller_name="GNCBrasil", sales_count=1200, rating=4.8),
        Competitor(listing_id=listings[1].id, competitor_ml_id="MLB9004", title="Creatina Monohidratada 300g Integral", price=62.00, seller_name="Integral Medica", sales_count=680, rating=4.6),
        Competitor(listing_id=listings[2].id, competitor_ml_id="MLB9005", title="Pré-Treino 300g Optimum", price=84.90, seller_name="Optimum Nutrition BR", sales_count=340, rating=4.4),
    ]
    db.add_all(competitors)

    now = datetime.now(timezone.utc)
    seo_analyses = [
        SeoAnalysis(
            listing_id=listings[0].id,
            score=78,
            title_score=85,
            description_score=72,
            images_score=80,
            attributes_score=75,
            keyword_suggestions=["whey protein", "proteína", "ganho de massa", "suplemento"],
            issues=["Descrição não menciona tabela nutricional", "Faltam 2 atributos obrigatórios"],
            opportunities=["Adicionar vídeo pode aumentar conversão 18%", "Título pode incluir 'sem lactose'"],
            suggested_title="Whey Protein Concentrado 900g Baunilha MTL Nutrition | Sem Glúten",
            created_at=now - timedelta(hours=2),
        ),
        SeoAnalysis(
            listing_id=listings[2].id,
            score=42,
            title_score=55,
            description_score=30,
            images_score=45,
            attributes_score=38,
            keyword_suggestions=["pré-treino", "energia", "foco", "pump"],
            issues=["Título abaixo de 60 caracteres", "Descrição muito curta", "Apenas 2 fotos"],
            opportunities=["Aumentar descrição com benefícios pode melhorar score 25pts", "Adicionar mais variações"],
            suggested_title="Pré-Treino Explosivo 300g Frutas Vermelhas MTL Nutrition | Energia + Foco",
            created_at=now - timedelta(hours=5),
        ),
    ]
    db.add_all(seo_analyses)

    approvals = [
        ApprovalQueue(
            listing_id=listings[0].id,
            change_type=ChangeType.title,
            current_value="Whey Protein Concentrado 900g Baunilha MTL Nutrition",
            proposed_value="Whey Protein Concentrado 900g Baunilha MTL Nutrition | Sem Glúten",
            reason="SEO: adicionar diferencial 'Sem Glúten' aumenta impressões estimadas em 12%",
            status=ApprovalStatus.pending,
            priority=2,
            created_by="seo_bot",
            created_at=now - timedelta(hours=1),
        ),
        ApprovalQueue(
            listing_id=listings[0].id,
            change_type=ChangeType.price,
            current_value=119.90,
            proposed_value=114.90,
            reason="Concorrente PowerSupp está vendendo a R$109,90. Reduzir R$5 mantém margem e melhora posição.",
            status=ApprovalStatus.pending,
            priority=3,
            created_by="pricing_bot",
            created_at=now - timedelta(minutes=30),
        ),
        ApprovalQueue(
            listing_id=listings[2].id,
            change_type=ChangeType.title,
            current_value="Pré-Treino Explosivo 300g Frutas Vermelhas MTL Nutrition",
            proposed_value="Pré-Treino Explosivo 300g Frutas Vermelhas MTL Nutrition | Energia + Foco",
            reason="Health score 58 — título curto prejudica ranking",
            status=ApprovalStatus.pending,
            priority=1,
            created_by="seo_bot",
            created_at=now - timedelta(hours=4),
        ),
        ApprovalQueue(
            listing_id=listings[4].id,
            change_type=ChangeType.stock,
            current_value=3,
            proposed_value=50,
            reason="Estoque crítico (3 unidades) — repor para evitar queda de ranking",
            status=ApprovalStatus.pending,
            priority=3,
            created_by="stock_bot",
            created_at=now - timedelta(minutes=15),
        ),
        ApprovalQueue(
            listing_id=listings[1].id,
            change_type=ChangeType.price,
            current_value=59.90,
            proposed_value=57.90,
            reason="GNC vendendo a R$54,90 — ajuste competitivo mínimo",
            status=ApprovalStatus.approved,
            priority=2,
            created_by="pricing_bot",
            reviewed_by="admin",
            reviewed_at=now - timedelta(days=1),
            created_at=now - timedelta(days=1, hours=2),
        ),
    ]
    db.add_all(approvals)
    db.flush()

    history = [
        ChangeHistory(
            listing_id=listings[1].id,
            approval_id=approvals[4].id,
            change_type=ChangeType.price,
            old_value=62.90,
            new_value=59.90,
            applied_by="admin",
            notes="Ajuste para competir com GNC",
            applied_at=now - timedelta(days=1),
        ),
        ChangeHistory(
            listing_id=listings[0].id,
            change_type=ChangeType.description,
            old_value="Descrição antiga do whey",
            new_value="Whey Protein de alta qualidade com 24g de proteína por dose...",
            applied_by="admin",
            applied_at=now - timedelta(days=3),
        ),
    ]
    db.add_all(history)

    campaigns = [
        AdsCampaign(
            listing_id=listings[0].id,
            ml_campaign_id="CAMP_ML_001",
            campaign_name="Whey Protein - Performance",
            daily_budget=50.0,
            total_spent=1240.0,
            impressions=48200,
            clicks=1928,
            ctr=4.0,
            cost_per_click=0.64,
            sales_from_ads=87,
            roas=8.4,
            status=CampaignStatus.active,
        ),
        AdsCampaign(
            listing_id=listings[1].id,
            ml_campaign_id="CAMP_ML_002",
            campaign_name="Creatina - Awareness",
            daily_budget=30.0,
            total_spent=620.0,
            impressions=31000,
            clicks=930,
            ctr=3.0,
            cost_per_click=0.67,
            sales_from_ads=52,
            roas=5.0,
            status=CampaignStatus.active,
        ),
        AdsCampaign(
            listing_id=listings[3].id,
            campaign_name="BCAA - Draft",
            daily_budget=20.0,
            total_spent=0.0,
            impressions=0,
            clicks=0,
            ctr=0.0,
            cost_per_click=0.0,
            sales_from_ads=0,
            roas=0.0,
            status=CampaignStatus.draft,
        ),
    ]
    db.add_all(campaigns)
    db.flush()

    ads_recs = [
        AdsRecommendation(
            listing_id=listings[0].id,
            campaign_id=campaigns[0].id,
            recommendation_type=RecommendationType.increase_budget,
            title="Aumentar orçamento da campanha de Whey",
            description="ROAS de 8.4x está acima da média da categoria (5x). Aumentar orçamento para R$80/dia pode gerar +35 vendas/mês.",
            expected_improvement="+35 vendas/mês estimadas",
            suggested_budget=80.0,
            status=RecommendationStatus.pending,
        ),
        AdsRecommendation(
            listing_id=listings[2].id,
            recommendation_type=RecommendationType.new_campaign,
            title="Criar campanha para Pré-Treino",
            description="Anúncio pausado sem Ads. Reativar com campanha pode recuperar visibilidade.",
            expected_improvement="Recuperar posição no ranking",
            suggested_budget=25.0,
            status=RecommendationStatus.pending,
        ),
    ]
    db.add_all(ads_recs)
    db.commit()
    print("[seed] Dados mockados inseridos com sucesso.")
