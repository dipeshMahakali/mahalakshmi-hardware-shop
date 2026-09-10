from decimal import Decimal

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import (
    Customer, InventoryItem, LoyaltyAccount, LoyaltyReward, Product,
    ProductAlias, Project, Supplier, User
)


def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create Users
        owner = User(name="Mahalakshmi Owner", email="owner@hardware.com", password_hash=hash_password("admin123"), role="OWNER")
        carpenter_user = User(name="Ramesh Carpenter", email="ramesh@carpenter.com", phone="9876543210", password_hash=hash_password("carpenter123"), role="CARPENTER")
        db.add_all([owner, carpenter_user])
        db.flush()

        # Create Customers
        ramesh = Customer(
            user_id=carpenter_user.id,
            name="Ramesh Carpenter",
            phone="9876543210",
            whatsapp_number="9876543210",
            customer_type="CARPENTER",
            credit_limit=Decimal("50000"),
            opening_balance=Decimal("5000")
        )
        sharma_homeowner = Customer(
            name="Suresh Sharma",
            phone="9812345678",
            customer_type="HOMEOWNER",
            credit_limit=Decimal("0"),
            opening_balance=Decimal("0")
        )
        db.add_all([ramesh, sharma_homeowner])
        db.flush()

        # Create Projects for Carpenter Ramesh
        p1 = Project(customer_id=ramesh.id, name="Sharma Residence", homeowner_name="Suresh Sharma", site_address="B-402, Green Park Apartments")
        p2 = Project(customer_id=ramesh.id, name="Patel Villa", homeowner_name="Jitesh Patel", site_address="Plot 12, Royal Palms Colony")
        p3 = Project(customer_id=ramesh.id, name="Mehta Office", homeowner_name="Rajesh Mehta", site_address="Suite 101, Business Hub")
        db.add_all([p1, p2, p3])
        db.flush()

        # Suppliers
        s1 = Supplier(name="Godrej Hardware Ltd", company="Godrej & Boyce", phone="9988776655", email="sales@godrej.com")
        s2 = Supplier(name="Century Plywood Corp", company="Century Ply", phone="9877665544", email="orders@centuryply.com")
        db.add_all([s1, s2])
        db.flush()

        # Hardware Products with Aliases & Inventory
        hardware_catalog = [
            {
                "name": "18mm Commercial Plywood (7x4 ft)",
                "sku": "PLY-18-C74",
                "barcode": "8901001",
                "category": "Plywood",
                "brand": "Century Ply",
                "unit": "sheet",
                "purchase_price": Decimal("1800.00"),
                "selling_price": Decimal("2450.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=400&q=80",
                "aliases": ["18mm ply", "18mm plywood", "commercial ply 18mm", "18 ply"]
            },
            {
                "name": "Godrej 3 Inch Stainless Steel Hinge (Pair)",
                "sku": "HINGE-3-SS-GODREJ",
                "barcode": "8901002",
                "category": "Hinges",
                "brand": "Godrej",
                "unit": "box",
                "purchase_price": Decimal("550.00"),
                "selling_price": Decimal("780.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=80",
                "aliases": ["3 inch hinge", "3\" hinge", "ss hinge 3", "hinge 3 inch", "godrej hinge"]
            },
            {
                "name": "Dorset Matt Black Concealed Mortise Door Handle",
                "sku": "HDL-DORSET-BLK",
                "barcode": "8901003",
                "category": "Handles",
                "brand": "Dorset",
                "unit": "piece",
                "purchase_price": Decimal("850.00"),
                "selling_price": Decimal("1250.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80",
                "aliases": ["black handle", "matt black handle", "dorset handle", "handle 10"]
            },
            {
                "name": "Godrej 6-Pin Brass Cylinder Door Lock",
                "sku": "LOCK-GODREJ-CYL",
                "barcode": "8901004",
                "category": "Locks",
                "brand": "Godrej",
                "unit": "piece",
                "purchase_price": Decimal("1400.00"),
                "selling_price": Decimal("1950.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80",
                "aliases": ["godrej lock", "door lock", "cylinder lock", "mortise lock"]
            },
            {
                "name": "Royal Oak Wood Laminate Sheet 1mm (8x4 ft)",
                "sku": "LAM-OAK-1MM",
                "barcode": "8901005",
                "category": "Laminates",
                "brand": "Merino",
                "unit": "sheet",
                "purchase_price": Decimal("900.00"),
                "selling_price": Decimal("1450.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
                "aliases": ["oak laminate", "wood laminate", "1mm laminate", "sunmica sheet"]
            },
            {
                "name": "Fevicol SH Synthetic Resin Adhesive (5 kg)",
                "sku": "GLUE-FEVICOL-5KG",
                "barcode": "8901006",
                "category": "Accessories",
                "brand": "Pidilite",
                "unit": "packet",
                "purchase_price": Decimal("750.00"),
                "selling_price": Decimal("980.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
                "aliases": ["fevicol", "5kg fevicol", "wood glue", "adhesive"]
            },
            {
                "name": "SS 304 Kitchen Sink Single Bowl (24x18 in)",
                "sku": "SINK-SS-2418",
                "barcode": "8901007",
                "category": "Kitchen Sinks",
                "brand": "Nirali",
                "unit": "piece",
                "purchase_price": Decimal("2400.00"),
                "selling_price": Decimal("3600.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
                "aliases": ["kitchen sink", "ss sink", "single bowl sink", "nirali sink"]
            },
            {
                "name": "Soft Close Hydraulic Cabinet Hinge (Pair)",
                "sku": "HINGE-HYD-CAB",
                "barcode": "8901008",
                "category": "Hinges",
                "brand": "Ebco",
                "unit": "pair",
                "purchase_price": Decimal("180.00"),
                "selling_price": Decimal("280.00"),
                "tax_rate": Decimal("18.00"),
                "image_url": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=80",
                "aliases": ["soft close hinge", "cabinet hinge", "hydraulic hinge", "ebco hinge"]
            }
        ]

        for item in hardware_catalog:
            aliases = item.pop("aliases")
            p = Product(**item)
            db.add(p)
            db.flush()

            # Add aliases
            for alias_str in aliases:
                db.add(ProductAlias(product_id=p.id, alias=alias_str))

            # Add stock
            inv = InventoryItem(product_id=p.id, on_hand=Decimal("45.00"), reserved=Decimal("2.00"), reorder_level=Decimal("8.00"), reorder_quantity=Decimal("30.00"))
            db.add(inv)

        # Loyalty Account for Ramesh
        loyalty = LoyaltyAccount(customer_id=ramesh.id, tier="SILVER", points=1450, total_earned=3200)
        db.add(loyalty)

        # Loyalty Rewards
        r1 = LoyaltyReward(title="10% Discount Voucher", points_required=500, description="10% off next purchase up to ₹1,000")
        r2 = LoyaltyReward(title="Free Masonry Drill Bit Set", points_required=800, description="5-piece professional carbide tip drill set")
        r3 = LoyaltyReward(title="Leather Carpenter Tool Belt", points_required=1500, description="Heavy duty genuine leather tool belt with metal tape holder")
        db.add_all([r1, r2, r3])

        db.commit()
        print("Seed data successfully populated!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()

