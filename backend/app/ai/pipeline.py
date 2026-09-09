import json
import re
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import AIProcessingJob, Customer, Order, OrderItem, Project
from app.ai.matcher import match_product


def parse_raw_order_text(text: str) -> dict:
    """
    Parses unstructured Hindi/English/Hinglish order text such as:
    'Sharma site ke liye 5 18mm ply aur 2 box 3 inch hinge bhej dena'
    Extracts project name and line items (quantity, unit, item_text).
    """
    project = None
    project_match = re.search(r'([A-Za-z0-9\s]+?)\s+(site|residence|villa|office|project)', text, re.IGNORECASE)
    if project_match:
        project = f"{project_match.group(1).strip()} {project_match.group(2).strip()}"

    # Split lines or clauses by comma, and, newline, etc.
    cleaned = re.sub(r'bhej\s+dena|bhejo|chahiye|aur|and|\n', ',', text, flags=re.IGNORECASE)
    parts = [p.strip() for p in cleaned.split(',') if p.strip()]

    extracted_items = []
    for part in parts:
        # Ignore project phrase if captured in part
        if project and project.lower() in part.lower():
            part = re.sub(re.escape(project), '', part, flags=re.IGNORECASE).strip()
            part = re.sub(r'ke\s+liye', '', part, flags=re.IGNORECASE).strip()
        if not part:
            continue

        # Extract quantity and unit
        # Pattern: (number) (optional unit: sheet/box/pkt/piece) (item description)
        qty_match = re.search(r'^(\d+(?:\.\d+)?)\s*(sheet|box|packet|pkt|pair|set|piece|sheets|boxes|pkts)?\s*(.*)$', part, re.IGNORECASE)
        if qty_match:
            qty = Decimal(qty_match.group(1))
            unit = qty_match.group(2) or "piece"
            raw_item = qty_match.group(3).strip()
            if raw_item:
                extracted_items.append({
                    "raw_text": raw_item,
                    "quantity": float(qty),
                    "unit": unit.lower()
                })
        else:
            extracted_items.append({
                "raw_text": part,
                "quantity": 1.0,
                "unit": "piece"
            })

    return {
        "detected_project": project,
        "items": extracted_items
    }


def process_ai_order(db: Session, source_type: str, input_text: str, customer_id: str | None = None) -> AIProcessingJob:
    """
    Executes complete AI Order Pipeline:
    Raw Input -> Parse -> Match Products -> Draft Order -> Save AIProcessingJob (REVIEW_REQUIRED)
    """
    # If source is Voice or Photo, simulate speech transcription or OCR text extraction
    if source_type == "VOICE":
        processed_text = input_text or "Sharma site ke liye 5 18mm ply aur 2 box 3 inch hinge"
    elif source_type == "PHOTO":
        processed_text = input_text or "Patel Villa: 10 18mm ply, 4 box 3 inch hinge, 12 handle"
    else:
        processed_text = input_text or ""

    parsed = parse_raw_order_text(processed_text)
    detected_project_name = parsed.get("detected_project")
    raw_items = parsed.get("items", [])

    matched_items = []
    total_confidence = Decimal("0")
    order_subtotal = Decimal("0")
    order_items_to_create = []

    # Find customer or fallback to first carpenter/customer
    if not customer_id:
        c = db.scalar(select(Customer).where(Customer.customer_type == "CARPENTER")) or db.scalar(select(Customer))
        customer_id = c.id if c else None

    # Find project if detected
    project_id = None
    if customer_id and detected_project_name:
        proj = db.scalar(select(Project).where(Project.customer_id == customer_id, Project.name.ilike(f"%{detected_project_name}%")))
        if proj:
            project_id = proj.id

    for item in raw_items:
        match_result = match_product(db, item["raw_text"])
        product = match_result["product"]
        conf = match_result["confidence"]

        item_summary = {
            "raw_text": item["raw_text"],
            "quantity": item["quantity"],
            "unit": item["unit"],
            "confidence": float(conf),
            "match_type": match_result["match_type"],
            "product_id": product.id if product else None,
            "product_name": product.name if product else item["raw_text"],
            "unit_price": float(product.selling_price) if product else 0.0
        }
        matched_items.append(item_summary)
        total_confidence += conf

        if product:
            line_tot = product.selling_price * Decimal(str(item["quantity"]))
            order_subtotal += line_tot
            order_items_to_create.append(OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit=product.unit,
                quantity=Decimal(str(item["quantity"])),
                unit_price=product.selling_price,
                line_total=line_tot
            ))

    avg_confidence = Decimal("0")
    if matched_items:
        avg_confidence = Decimal(str(round(float(total_confidence) / len(matched_items), 2)))

    # Create Draft Order if items were matched
    draft_order = None
    if order_items_to_create and customer_id:
        count = db.scalar(select(Order.id)).count() if hasattr(select(Order.id), "count") else 1
        order_num = f"ORD-AI-{int(datetime.now().timestamp())}"
        draft_order = Order(
            order_number=order_num,
            customer_id=customer_id,
            project_id=project_id,
            source=source_type,
            status="PENDING_REVIEW",
            subtotal=order_subtotal,
            tax=Decimal("0"),
            total=order_subtotal,
            notes=f"AI Draft Order from {source_type} input: '{processed_text}'",
            items=order_items_to_create
        )
        db.add(draft_order)
        db.flush()

    job = AIProcessingJob(
        source_type=source_type,
        status="REVIEW_REQUIRED",
        provider="internal_ai",
        input_text=processed_text,
        detected_project=detected_project_name,
        extracted_data=json.dumps(matched_items),
        confidence_score=avg_confidence,
        draft_order_id=draft_order.id if draft_order else None,
        customer_id=customer_id
    )
    db.add(job)
    db.flush()
    return job

