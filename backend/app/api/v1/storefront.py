import json
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import require_owner_or_staff
from app.models import CartSession, CartSessionItem, Product, StorefrontContent, User, WishlistItem
from app.schemas import (
    CartSyncRequest, EngagementOverviewResponse, StorefrontContentResponse,
    StorefrontContentUpdate, WishlistSyncRequest
)

router = APIRouter()


# Default showroom content fallbacks
DEFAULT_SECTIONS = {
    "header_utility": {
        "delivery_message": "Fast & Reliable Doorstep Delivery",
        "quality_message": "100% Genuine Quality Hardware",
        "trust_message": "Trusted by 5,000+ Architects & Builders",
        "support_message": "Expert Hardware Consultation",
        "phone": "+91 98765 43210",
        "whatsapp": "+91 98765 43210",
        "announcement_text": "Special Trade Discounts for Registered Architects & Carpenters!",
        "announcement_active": True
    },
    "hero": {
        "badge": "PREMIUM ARCHITECTURAL HARDWARE SHOWROOM",
        "title": "Stronger",
        "highlight": "Spaces.",
        "description": "Discover premium hardware designed for modern homes, offices and professional projects. Engineered for durability, security, and timeless elegance.",
        "primary_cta_text": "Shop Door Hardware",
        "primary_cta_link": "#door-hardware",
        "secondary_cta_text": "Explore All Products",
        "secondary_cta_link": "#bestsellers"
    },
    "promo_banner": {
        "badge": "ARCHITECTURAL EXCELLENCE",
        "title": "The Matte Black",
        "highlight": "Heritage Collection",
        "description": "Transform residential and commercial doors with precision-milled solid zinc handles, anti-corrosion finishes, and Japanese magnetic latch technology.",
        "features": [
            "10-Year Mechanical Warranty",
            "Grade 304 Stainless Steel Core",
            "Zero-Fingerprint PVD Coating"
        ],
        "limited_tag": "Trade Pricing Available",
        "cta_text": "Explore Collection",
        "cta_category": "door-hardware"
    },
    "trust_features": {
        "features": [
            {"title": "Genuine Products", "description": "100% authentic & quality assured", "icon": "shield-check"},
            {"title": "Fast Delivery", "description": "Safe & reliable doorstep delivery", "icon": "truck"},
            {"title": "Secure Payments", "description": "Safe 256-bit encrypted checkout", "icon": "lock"},
            {"title": "Expert Support", "description": "Help choosing the right hardware", "icon": "headphones"}
        ]
    },
    "shop_by_need": {
        "badge": "Project Guidance",
        "title": "What Are You Working On?",
        "subtitle": "Find the right hardware tailored for your exact project type.",
        "items": [
            {"id": "main-doors", "title": "Main Entrance", "subtitle": "High-Security & Grandeur", "description": "Biometric locks, forged brass pull handles, heavy security deadbolts.", "icon": "door-closed"},
            {"id": "kitchen-cabinets", "title": "Kitchen Cabinets", "subtitle": "Ergonomics & Soft-Close", "description": "Hydraulic soft-close hinges, heavy-duty drawer slides, sleek profile pulls.", "icon": "box"},
            {"id": "wardrobes", "title": "Luxury Wardrobes", "subtitle": "Smooth Motion & Concealed", "description": "Sliding door systems, soft-close dampers, gold profile handles.", "icon": "home"},
            {"id": "gates", "title": "Gates & Outdoor", "subtitle": "Weatherproof & Robust", "description": "Heavy forged tower bolts, stainless security hasps, brass padlocks.", "icon": "shield-check"},
            {"id": "commercial-doors", "title": "Offices & Commercial", "subtitle": "High Traffic Performance", "description": "Concealed door closers, panic exit devices, electromagnetic locks.", "icon": "building-2"}
        ]
    },
    "business_services": {
        "items": [
            {"id": "quote", "title": "Request a Quote", "description": "Get better custom pricing for bulk requirements & project estimates.", "icon": "file-text"},
            {"id": "dealer", "title": "Become a Dealer", "description": "Join our authorized dealer network and grow your hardware business.", "icon": "users"},
            {"id": "bulk", "title": "Bulk Orders", "description": "Dedicated commercial project solutions with wholesale trade terms.", "icon": "layers"},
            {"id": "support", "title": "Expert Support", "description": "We're here to help you choose the exact hardware specifications.", "icon": "headphones"}
        ]
    },
    "why_choose_us": {
        "items": [
            {"title": "Direct Showroom Pricing", "description": "Guaranteed wholesale pricing without middlemen markups.", "icon": "badge-percent"},
            {"title": "25+ Years of Trust", "description": "Serving Gujarat & Maharashtra's master craftsmen and homeowners.", "icon": "award"},
            {"title": "Contractor Credit Facility", "description": "Digital Khata with flexible credit terms for verified carpenters.", "icon": "wallet"},
            {"title": "Ready Stock Availability", "description": "Over 10,000+ SKUs stocked in our central warehouse for same-day dispatch.", "icon": "package"}
        ]
    },
    "footer": {
        "about": "Shree Mahalaxmi Hardware is your premier destination for high-precision architectural hardware, locks, designer handles, and carpenter fittings.",
        "phone": "+91 98765 43210",
        "email": "contact@mahalaxmihardware.com",
        "address": "Shop No. 4-6, Laxmi Hardware Market, Ring Road, Surat, Gujarat 395002",
        "gstin": "24ABCDE1234F1Z5",
        "hours": "Mon - Sat: 9:00 AM - 8:30 PM (Sunday Closed)",
        "copyright": "© 2026 Shree Mahalaxmi Hardware. All Rights Reserved. Precision Engineered."
    }
}


@router.get("/content", response_model=dict[str, dict])
def get_all_storefront_content(db: Session = Depends(get_db)):
    rows = db.scalars(select(StorefrontContent)).all()
    db_sections = {}
    for r in rows:
        try:
            db_sections[r.section_key] = json.loads(r.content_json)
        except Exception:
            pass

    # Merge with defaults so every section is always complete
    result = dict(DEFAULT_SECTIONS)
    result.update(db_sections)
    return result


@router.get("/content/{section_key}", response_model=dict)
def get_section_content(section_key: str, db: Session = Depends(get_db)):
    row = db.get(StorefrontContent, section_key)
    if row:
        try:
            return json.loads(row.content_json)
        except Exception:
            pass
    if section_key in DEFAULT_SECTIONS:
        return DEFAULT_SECTIONS[section_key]
    raise HTTPException(status_code=404, detail="Section content not found")


@router.put("/content/{section_key}")
def update_section_content(
    section_key: str,
    payload: StorefrontContentUpdate,
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    row = db.get(StorefrontContent, section_key)
    json_str = json.dumps(payload.content)
    if not row:
        row = StorefrontContent(section_key=section_key, content_json=json_str)
        db.add(row)
    else:
        row.content_json = json_str

    db.commit()
    return {"message": f"Section '{section_key}' updated successfully", "section_key": section_key}


@router.post("/cart/sync")
def sync_cart(payload: CartSyncRequest, db: Session = Depends(get_db)):
    if not payload.session_token:
        raise HTTPException(status_code=400, detail="session_token is required")

    session = db.execute(
        select(CartSession).where(CartSession.session_token == payload.session_token)
    ).scalar_one_or_none()

    if not session:
        session = CartSession(
            session_token=payload.session_token,
            customer_name=payload.customer_name,
            customer_phone=payload.customer_phone
        )
        db.add(session)
        db.flush()
    else:
        if payload.customer_name:
            session.customer_name = payload.customer_name
        if payload.customer_phone:
            session.customer_phone = payload.customer_phone

    # Clear existing items and insert refreshed items
    session.items.clear()
    for it in payload.items:
        session.items.append(
            CartSessionItem(
                session_id=session.id,
                product_id=it.product_id,
                product_name=it.product_name,
                sku=it.sku,
                unit_price=it.unit_price,
                quantity=it.quantity,
                image_url=it.image_url
            )
        )

    db.commit()
    return {"success": True, "cart_id": session.id, "total_items": len(session.items)}


@router.post("/wishlist/sync")
def sync_wishlist(payload: WishlistSyncRequest, db: Session = Depends(get_db)):
    if not payload.session_token:
        raise HTTPException(status_code=400, detail="session_token is required")

    # Delete existing entries for this token
    existing_rows = db.scalars(
        select(WishlistItem).where(WishlistItem.session_token == payload.session_token)
    ).all()
    for r in existing_rows:
        db.delete(r)

    # Insert new wishlist entries
    for p_id in payload.product_ids:
        if p_id:
            db.add(WishlistItem(session_token=payload.session_token, product_id=p_id))

    db.commit()
    return {"success": True, "total_wishlist": len(payload.product_ids)}


@router.get("/engagement", response_model=EngagementOverviewResponse)
def get_engagement_overview(
    _: User = Depends(require_owner_or_staff),
    db: Session = Depends(get_db)
):
    # Active carts
    cart_sessions = list(db.scalars(
        select(CartSession).order_by(desc(CartSession.updated_at)).limit(30)
    ).all())

    active_carts_data = []
    total_pipeline_val = Decimal("0.00")

    for c in cart_sessions:
        cart_total = sum(Decimal(str(item.unit_price)) * item.quantity for item in c.items)
        if len(c.items) > 0:
            total_pipeline_val += cart_total
            active_carts_data.append({
                "session_id": c.id,
                "session_token": c.session_token,
                "customer_name": c.customer_name or "Guest Visitor",
                "customer_phone": c.customer_phone or "Unregistered",
                "item_count": sum(item.quantity for item in c.items),
                "total_value": float(cart_total),
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                "items": [
                    {
                        "product_id": it.product_id,
                        "product_name": it.product_name,
                        "sku": it.sku,
                        "quantity": it.quantity,
                        "unit_price": float(it.unit_price)
                    } for it in c.items
                ]
            })

    # Total wishlist saves
    total_wishlist = db.scalar(select(func.count(WishlistItem.id))) or 0

    # Top wishlisted products
    top_wishes_query = (
        select(WishlistItem.product_id, func.count(WishlistItem.id).label("save_count"))
        .group_by(WishlistItem.product_id)
        .order_by(desc("save_count"))
        .limit(10)
    )
    top_wishes_res = db.execute(top_wishes_query).all()

    top_wishlisted_products = []
    for p_id, save_count in top_wishes_res:
        prod = db.get(Product, p_id)
        top_wishlisted_products.append({
            "product_id": p_id,
            "product_name": prod.name if prod else "Custom Hardware Item",
            "sku": prod.sku if prod else "N/A",
            "category": prod.category if prod else "Hardware",
            "price": float(prod.selling_price) if prod else 0.0,
            "save_count": save_count
        })

    return EngagementOverviewResponse(
        total_active_carts=len(active_carts_data),
        total_cart_pipeline_value=total_pipeline_val,
        total_wishlisted_items=total_wishlist,
        active_carts=active_carts_data,
        top_wishlisted_products=top_wishlisted_products
    )

