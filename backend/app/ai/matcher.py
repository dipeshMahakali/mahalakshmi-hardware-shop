import re
from decimal import Decimal
from difflib import SequenceMatcher
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product, ProductAlias


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[\"\']', ' inch ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def match_product(db: Session, raw_text: str) -> dict:
    normalized = normalize_text(raw_text)
    products = list(db.scalars(select(Product).where(Product.is_active.is_(True))).all())

    best_match = None
    highest_score = 0.0

    for product in products:
        # Check exact SKU match
        if product.sku.lower() == normalized:
            return {"product": product, "confidence": Decimal("100.00"), "match_type": "EXACT_SKU"}

        # Check exact product name match
        prod_name_norm = normalize_text(product.name)
        if prod_name_norm == normalized:
            return {"product": product, "confidence": Decimal("98.00"), "match_type": "EXACT_NAME"}

        # Check aliases
        aliases = list(db.scalars(select(ProductAlias.alias).where(ProductAlias.product_id == product.id)).all())
        for alias in aliases:
            alias_norm = normalize_text(alias)
            if alias_norm == normalized:
                return {"product": product, "confidence": Decimal("95.00"), "match_type": "EXACT_ALIAS"}
            ratio = SequenceMatcher(None, alias_norm, normalized).ratio()
            if ratio > highest_score:
                highest_score = ratio
                best_match = (product, ratio, "FUZZY_ALIAS")

        # Fuzzy compare product name
        ratio = SequenceMatcher(None, prod_name_norm, normalized).ratio()
        if ratio > highest_score:
            highest_score = ratio
            best_match = (product, ratio, "FUZZY_NAME")

        # Partial substring containment
        if normalized in prod_name_norm or prod_name_norm in normalized:
            sub_score = 0.75 + (0.15 * (len(normalized) / max(len(prod_name_norm), 1)))
            if sub_score > highest_score:
                highest_score = sub_score
                best_match = (product, sub_score, "SUBSTRING")

    if best_match and highest_score >= 0.4:
        confidence = min(Decimal("92.00"), Decimal(str(round(highest_score * 100, 2))))
        return {"product": best_match[0], "confidence": confidence, "match_type": best_match[2]}

    return {"product": None, "confidence": Decimal("0.00"), "match_type": "NONE"}

