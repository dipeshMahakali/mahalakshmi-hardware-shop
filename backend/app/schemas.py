from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str | None = None
    role: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    phone: str | None = None
    role: str
    is_active: bool


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=30)
    whatsapp_number: str | None = None
    email: str | None = None
    customer_type: Literal["CARPENTER", "CONTRACTOR", "HOMEOWNER", "RETAIL", "OTHER"] = "RETAIL"
    address: str | None = None
    notes: str | None = None
    credit_limit: Decimal = Field(default=Decimal("0"), ge=0)
    opening_balance: Decimal = Field(default=Decimal("0"), ge=0)


class CustomerResponse(CustomerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_active: bool
    created_at: datetime | None = None


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    homeowner_name: str | None = None
    site_address: str | None = None
    phone: str | None = None
    notes: str | None = None


class ProjectResponse(ProjectCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    customer_id: str
    status: str
    created_at: datetime | None = None


class ProductAliasCreate(BaseModel):
    alias: str = Field(min_length=2, max_length=180)


class ProductAliasResponse(ProductAliasCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    sku: str = Field(min_length=2, max_length=80)
    barcode: str | None = None
    category: str | None = "Hardware"
    brand: str | None = "Generic"
    unit: str = "piece"
    purchase_price: Decimal = Field(default=Decimal("0"), ge=0)
    selling_price: Decimal = Field(gt=0)
    min_selling_price: Decimal | None = None
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    hsn_sac: str | None = None
    description: str | None = None
    image_url: str | None = None
    aliases: list[str] = []


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    sku: str
    barcode: str | None = None
    category: str | None = None
    brand: str | None = None
    unit: str
    purchase_price: Decimal
    selling_price: Decimal
    tax_rate: Decimal
    description: str | None = None
    image_url: str | None = None
    is_active: bool


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: str | None = None
    on_hand: Decimal
    reserved: Decimal
    available: Decimal
    reorder_level: Decimal
    reorder_quantity: Decimal


class StockAdjustmentCreate(BaseModel):
    product_id: str
    quantity_delta: Decimal
    movement_type: Literal["PURCHASE", "SALE", "ADJUSTMENT", "DAMAGE", "RETURN"] = "ADJUSTMENT"
    notes: str | None = None


class EstimateItemCreate(BaseModel):
    product_id: str
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal | None = Field(default=None, gt=0)


class EstimateCreate(BaseModel):
    customer_id: str
    project_id: str | None = None
    discount: Decimal = Field(default=Decimal("0"), ge=0)
    items: list[EstimateItemCreate] = Field(min_length=1)


class EstimateItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: str
    unit: str
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    line_total: Decimal


class EstimateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    estimate_number: str
    customer_id: str
    project_id: str | None
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    status: str
    items: list[EstimateItemResponse]
    created_at: datetime | None = None


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: Decimal = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: str
    project_id: str | None = None
    source: str = "MANUAL"
    notes: str | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: str
    unit: str
    quantity: Decimal
    unit_price: Decimal
    line_total: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_number: str
    customer_id: str
    project_id: str | None
    source: str
    status: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    notes: str | None = None
    items: list[OrderItemResponse]
    created_at: datetime | None = None


class InvoiceItemCreate(BaseModel):
    product_id: str
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal | None = Field(default=None, gt=0)


class InvoiceCreate(BaseModel):
    customer_id: str
    project_id: str | None = None
    discount: Decimal = Field(default=Decimal("0"), ge=0)
    items: list[InvoiceItemCreate] = Field(min_length=1)


class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: str
    product_name: str
    unit: str
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    line_total: Decimal


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    invoice_number: str
    customer_id: str
    project_id: str | None
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    paid: Decimal
    outstanding: Decimal
    status: str
    items: list[InvoiceItemResponse]
    created_at: datetime | None = None


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: Decimal = Field(gt=0)
    method: Literal["CASH", "UPI", "BANK_TRANSFER", "CARD", "CREDIT", "OTHER"]
    reference: str | None = None
    notes: str | None = None


class LedgerTransactionResponse(BaseModel):
    type: str
    debit: Decimal
    credit: Decimal
    description: str
    created_at: object | None


class LedgerResponse(BaseModel):
    customer_id: str
    opening_balance: Decimal
    debit: Decimal
    credit: Decimal
    outstanding: Decimal
    transactions: list[LedgerTransactionResponse]


class SupplierCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    company: str | None = None
    phone: str = Field(min_length=7, max_length=30)
    whatsapp: str | None = None
    email: str | None = None
    address: str | None = None
    gst_number: str | None = None
    notes: str | None = None


class SupplierResponse(SupplierCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime | None = None


class PurchaseOrderItemCreate(BaseModel):
    product_id: str
    quantity_ordered: Decimal = Field(gt=0)
    unit_cost: Decimal = Field(gt=0)


class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    notes: str | None = None
    items: list[PurchaseOrderItemCreate] = Field(min_length=1)


class PurchaseOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: str
    quantity_ordered: Decimal
    quantity_received: Decimal
    unit_cost: Decimal
    line_total: Decimal


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    po_number: str
    supplier_id: str
    status: str
    total: Decimal
    items: list[PurchaseOrderItemResponse]
    created_at: datetime | None = None


class PurchaseReceiveItem(BaseModel):
    item_id: str
    quantity_received: Decimal = Field(ge=0)


class PurchaseReceiveRequest(BaseModel):
    po_id: str
    items: list[PurchaseReceiveItem]


class LoyaltyAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    customer_id: str
    tier: str
    points: int
    total_earned: int


class LoyaltyRewardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    points_required: int
    description: str | None = None


class LoyaltyRedeemRequest(BaseModel):
    customer_id: str
    reward_id: str


class AIProcessRequest(BaseModel):
    source_type: Literal["TEXT", "VOICE", "PHOTO"]
    input_text: str | None = None
    customer_id: str | None = None
    detected_project: str | None = None


class AIJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    source_type: str
    status: str
    input_text: str | None = None
    detected_project: str | None = None
    extracted_data: str | None = None
    confidence_score: Decimal
    draft_order_id: str | None = None
    error_message: str | None = None
    created_at: datetime | None = None


class AIApprovalRequest(BaseModel):
    job_id: str
    action: Literal["APPROVE", "REJECT"]
    edited_items: list[dict] | None = None
