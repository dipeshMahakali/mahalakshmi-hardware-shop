import json
from decimal import Decimal

from sqlalchemy import func, select
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import (
    Customer, InventoryItem, LoyaltyAccount, LoyaltyReward, Product,
    ProductAlias, ProductCategory, Project, StorefrontContent, Supplier, User
)


def seed_data(drop_existing: bool = True):
    if drop_existing:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if not drop_existing:
            existing_count = db.scalar(select(func.count()).select_from(ProductCategory))
            if existing_count and existing_count > 0:
                print(f"Database already contains {existing_count} categories. Skipping seed.")
                return

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

        # 1. Seed Categories
        categories_seed = [
            {
                "id": "door-hardware",
                "name": "Door Hardware",
                "slug": "door-hardware",
                "icon": "door-open",
                "product_count_label": "1,200+ Products",
                "description": "Handles, pull bars, tower bolts, hinges & closers",
                "tagline": "Precision engineered hardware crafted for security, strength and architectural beauty.",
                "display_order": 1,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "handles",
                "name": "Handles",
                "slug": "handles",
                "icon": "hand-grab",
                "product_count_label": "850+ Products",
                "description": "Architectural mortise, lever, pulled & push handles",
                "tagline": "Timeless door & furniture handles designed with ergonomic comfort and metallic luster.",
                "display_order": 2,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "locks-security",
                "name": "Locks & Security",
                "slug": "locks-security",
                "icon": "lock",
                "product_count_label": "950+ Products",
                "description": "Biometric smart locks, deadbolts, padlocks & rims",
                "tagline": "Advanced biometric access control and hardened mechanical security systems.",
                "display_order": 3,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "hinges",
                "name": "Hinges",
                "slug": "hinges",
                "icon": "sliders",
                "product_count_label": "650+ Products",
                "description": "Hydraulic soft close, butt, pivot & continuous hinges",
                "tagline": "Whisper-quiet hydraulic dampers and heavy duty stainless steel hinge assemblies.",
                "display_order": 4,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "cabinet-hardware",
                "name": "Cabinet Hardware",
                "slug": "cabinet-hardware",
                "icon": "box",
                "product_count_label": "1,000+ Products",
                "description": "Drawer slides, knobs, profile pulls & gas struts",
                "tagline": "High load telescoping drawer slides, brass cabinet knobs, and sleek profile channels.",
                "display_order": 5,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "bathroom-fittings",
                "name": "Bathroom Fittings",
                "slug": "bathroom-fittings",
                "icon": "droplet",
                "product_count_label": "750+ Products",
                "description": "Faucets, towel rails, glass fittings & drainers",
                "tagline": "Durable brass faucets, frameless glass shower patches, and stainless steel organizers.",
                "display_order": 6,
                "is_active": True,
                "is_featured_landing": True
            },
            {
                "id": "tools-accessories",
                "name": "Tools & Accessories",
                "slug": "tools-accessories",
                "icon": "wrench",
                "product_count_label": "400+ Products",
                "description": "Drill bit kits, caulking guns, screws & installation tools",
                "tagline": "Professional grade installation tools, fasteners, drill kits and hardware accessories.",
                "display_order": 7,
                "is_active": True,
                "is_featured_landing": True
            }
        ]

        for cat in categories_seed:
            db.add(ProductCategory(**cat))
        db.flush()

        # 2. Seed Rich Showroom Products
        products_seed = [
            {
                "id": "smh-001",
                "name": "Verona Satin Brass Mortise Handle Set",
                "sku": "SMH-DH-1021",
                "barcode": "8901021",
                "category": "Door Hardware",
                "category_id": "door-hardware",
                "brand": "Mahalaxmi Heritage",
                "subtitle": "12 Inch Premium Finish • Solid Brass Core",
                "unit": "set",
                "purchase_price": Decimal("850.00"),
                "selling_price": Decimal("1250.00"),
                "original_price": Decimal("1600.00"),
                "discount_percentage": 22,
                "tax_rate": Decimal("18.00"),
                "badge": "BESTSELLER",
                "badge_type": "bestseller",
                "material": "Solid Forged Brass",
                "finish": "Satin Gold / Brushed Brass",
                "warranty": "10 Years Mechanical Warranty",
                "rating": Decimal("4.9"),
                "review_count": 48,
                "illustration_type": "handle_lever_gold",
                "is_bestseller": True,
                "is_recommended": False,
                "display_order": 1,
                "description": "Precision engineered architectural mortise handle crafted from high-density solid forged brass. Features double-action spring return and anti-corrosion clear PVD coating.",
                "aliases": ["verona handle", "brass mortise handle", "satin gold handle"]
            },
            {
                "id": "smh-002",
                "name": "Aegis Biometric Smart Door Lock Pro",
                "sku": "SMH-LK-2045",
                "barcode": "8901022",
                "category": "Locks & Security",
                "category_id": "locks-security",
                "brand": "Aegis Security",
                "subtitle": "Fingerprint • Touch PIN • RFID Card • BLE Key",
                "unit": "piece",
                "purchase_price": Decimal("3800.00"),
                "selling_price": Decimal("5499.00"),
                "original_price": Decimal("7200.00"),
                "discount_percentage": 24,
                "tax_rate": Decimal("18.00"),
                "badge": "HOT TECH",
                "badge_type": "hot",
                "material": "Aerospace Aluminium Alloy & Tempered Glass",
                "finish": "Obsidian Matte Black",
                "warranty": "3 Years On-Site Warranty",
                "rating": Decimal("4.9"),
                "review_count": 62,
                "illustration_type": "smart_lock",
                "is_bestseller": True,
                "is_recommended": True,
                "display_order": 2,
                "description": "Flagship 5-in-1 digital security lock with 0.3s semiconductor fingerprint recognition, emergency mechanical keyway, and anti-peep keypad.",
                "aliases": ["aegis lock", "smart door lock", "biometric lock", "digital lock"]
            },
            {
                "id": "smh-003",
                "name": "Godrej 3 Inch Stainless Steel Hinge (Pair)",
                "sku": "HINGE-3-SS-GODREJ",
                "barcode": "8901002",
                "category": "Hinges",
                "category_id": "hinges",
                "brand": "Godrej",
                "subtitle": "Pack of 4 • 3D Micro Adjustment • Clip-on Plate",
                "unit": "box",
                "purchase_price": Decimal("550.00"),
                "selling_price": Decimal("780.00"),
                "original_price": Decimal("950.00"),
                "discount_percentage": 18,
                "tax_rate": Decimal("18.00"),
                "badge": "VALUE PACK",
                "badge_type": "discount",
                "material": "Cold Rolled Steel with Nickel Plating",
                "finish": "Satin Nickel Plated",
                "warranty": "5 Years Silent Motion Warranty",
                "rating": Decimal("4.7"),
                "review_count": 89,
                "illustration_type": "hinge_hydraulic",
                "is_bestseller": True,
                "is_recommended": False,
                "display_order": 3,
                "description": "Silent closing 105-degree concealed cabinet hinges with built-in hydraulic brass piston damper. Tested to 100,000 opening cycles.",
                "aliases": ["3 inch hinge", "3\" hinge", "ss hinge 3", "hinge 3 inch", "godrej hinge", "krona hinge", "soft close hinge"]
            },
            {
                "id": "smh-004",
                "name": "Titan Heavy Duty Telescopic Drawer Slides 45mm",
                "sku": "SMH-CH-4008",
                "barcode": "8901024",
                "category": "Cabinet Hardware",
                "category_id": "cabinet-hardware",
                "brand": "Titan Rail",
                "subtitle": "Pair of 20 Inch • 45kg Load Capacity",
                "unit": "pair",
                "purchase_price": Decimal("240.00"),
                "selling_price": Decimal("380.00"),
                "original_price": Decimal("500.00"),
                "discount_percentage": 24,
                "tax_rate": Decimal("18.00"),
                "badge": "BESTSELLER",
                "badge_type": "bestseller",
                "material": "High-Yield Cold Rolled Steel",
                "finish": "Zinc Electro-Galvanized",
                "warranty": "5 Years Structural Warranty",
                "rating": Decimal("4.8"),
                "review_count": 115,
                "illustration_type": "drawer_slide",
                "is_bestseller": True,
                "is_recommended": False,
                "display_order": 4,
                "description": "Triple-extension ball bearing drawer slide rails with cushioned rubber bumpers and lever disconnect latch.",
                "aliases": ["telescopic slide", "drawer channel", "titan slide 20"]
            },
            {
                "id": "smh-005",
                "name": "Imperia Solid Forged Brass Main Door Lock",
                "sku": "SMH-LK-2089",
                "barcode": "8901025",
                "category": "Locks & Security",
                "category_id": "locks-security",
                "brand": "Imperia Lock",
                "subtitle": "Double Throw 70mm Backset • 4 Dimple Keys",
                "unit": "piece",
                "purchase_price": Decimal("1450.00"),
                "selling_price": Decimal("2150.00"),
                "original_price": Decimal("2800.00"),
                "discount_percentage": 23,
                "tax_rate": Decimal("18.00"),
                "badge": "HIGH SECURITY",
                "badge_type": "hot",
                "material": "Heavy Solid Forged Brass",
                "finish": "Antique Bronze / Brushed Brass",
                "warranty": "15 Years Mechanical Warranty",
                "rating": Decimal("4.9"),
                "review_count": 34,
                "illustration_type": "padlock_brass",
                "is_bestseller": True,
                "is_recommended": False,
                "display_order": 5,
                "description": "Heavy duty commercial grade entrance deadbolt lock with drill-resistant hardened steel core pins.",
                "aliases": ["imperia lock", "brass door lock", "double throw lock"]
            },
            {
                "id": "smh-006",
                "name": "Onyx Architectural T-Bar Pull Handle 600mm",
                "sku": "SMH-DH-1055",
                "barcode": "8901026",
                "category": "Handles",
                "category_id": "handles",
                "brand": "Onyx Studio",
                "subtitle": "Back-to-Back Pair • 25mm Round Profile",
                "unit": "pair",
                "purchase_price": Decimal("1200.00"),
                "selling_price": Decimal("1850.00"),
                "original_price": Decimal("2400.00"),
                "discount_percentage": 23,
                "tax_rate": Decimal("18.00"),
                "badge": "DESIGNER CHOICE",
                "badge_type": "new",
                "material": "Grade 304 Stainless Steel",
                "finish": "Electrophoretic Matte Black",
                "warranty": "10 Years Anti-Tarnish Warranty",
                "rating": Decimal("4.8"),
                "review_count": 29,
                "illustration_type": "door_hardware",
                "is_bestseller": True,
                "is_recommended": False,
                "display_order": 6,
                "description": "Minimalist architectural main door pull bar with concealed dual-sided fixing studs. Perfect for wooden, glass, and metal doors.",
                "aliases": ["t bar handle", "pull handle 600mm", "black pull handle"]
            },
            {
                "id": "smh-007",
                "name": "Stirling Heavy Duty Stainless Steel Tower Bolt",
                "sku": "SMH-DH-1082",
                "barcode": "8901027",
                "category": "Door Hardware",
                "category_id": "door-hardware",
                "brand": "Stirling Hardware",
                "subtitle": "8 Inch • 12mm Solid Throw Rod",
                "unit": "piece",
                "purchase_price": Decimal("180.00"),
                "selling_price": Decimal("295.00"),
                "original_price": Decimal("380.00"),
                "discount_percentage": 22,
                "tax_rate": Decimal("18.00"),
                "badge": "BEST VALUE",
                "badge_type": "discount",
                "material": "Solid AISI 304 Stainless Steel",
                "finish": "Brushed Satin Stainless",
                "warranty": "Lifetime Rust-Free Guarantee",
                "rating": Decimal("4.7"),
                "review_count": 76,
                "illustration_type": "tower_bolt",
                "is_bestseller": True,
                "is_recommended": True,
                "display_order": 7,
                "description": "Solid extruded barrel bolt with anti-rattle spring clip and heavy gauge flat backplate.",
                "aliases": ["tower bolt", "ss tower bolt 8 inch", "door bolt"]
            },
            {
                "id": "smh-008",
                "name": "Vortex Heavy-Duty Hydraulic Overhead Door Closer",
                "sku": "SMH-DH-1099",
                "barcode": "8901028",
                "category": "Door Hardware",
                "category_id": "door-hardware",
                "brand": "Vortex Mechanism",
                "subtitle": "Size 2-4 Adjustable • Up to 85kg Door Weight",
                "unit": "piece",
                "purchase_price": Decimal("950.00"),
                "selling_price": Decimal("1450.00"),
                "original_price": Decimal("1900.00"),
                "discount_percentage": 24,
                "tax_rate": Decimal("18.00"),
                "badge": "FIRE RATED",
                "badge_type": "bestseller",
                "material": "Die-Cast High Tensile Aluminium Body",
                "finish": "Silver Metallic Anodized",
                "warranty": "5 Years Commercial Warranty",
                "rating": Decimal("4.8"),
                "review_count": 52,
                "illustration_type": "door_closer",
                "is_bestseller": True,
                "is_recommended": True,
                "display_order": 8,
                "description": "Rack and pinion hydraulic door closer with dual independent closing and latching speed adjustment valves.",
                "aliases": ["door closer", "hydraulic closer", "overhead door closer"]
            },
            {
                "id": "smh-009",
                "name": "Solus Knurled Solid Brass Cabinet Knob",
                "sku": "SMH-CH-4033",
                "barcode": "8901029",
                "category": "Cabinet Hardware",
                "category_id": "cabinet-hardware",
                "brand": "Solus Studio",
                "subtitle": "32mm Diameter • Diamond Knurl Grip",
                "unit": "piece",
                "purchase_price": Decimal("120.00"),
                "selling_price": Decimal("195.00"),
                "original_price": Decimal("260.00"),
                "discount_percentage": 25,
                "tax_rate": Decimal("18.00"),
                "badge": "TRENDING",
                "badge_type": "new",
                "material": "Solid Turned Brass",
                "finish": "Champagne Gold PVD",
                "warranty": "10 Years Finish Warranty",
                "rating": Decimal("4.9"),
                "review_count": 41,
                "illustration_type": "cabinet_knob",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 9,
                "description": "Industrial diamond knurled furniture knob precision machined from solid brass rod.",
                "aliases": ["cabinet knob", "knurled brass knob", "drawer knob"]
            },
            {
                "id": "smh-010",
                "name": "Sentinel Magnetic Wall-Mounted Door Stopper",
                "sku": "SMH-DH-1110",
                "barcode": "8901030",
                "category": "Door Hardware",
                "category_id": "door-hardware",
                "brand": "Sentinel Stop",
                "subtitle": "Strong Neodymium Magnet • Dual Mount",
                "unit": "piece",
                "purchase_price": Decimal("90.00"),
                "selling_price": Decimal("150.00"),
                "original_price": Decimal("200.00"),
                "discount_percentage": 25,
                "tax_rate": Decimal("18.00"),
                "badge": "POPULAR",
                "badge_type": "bestseller",
                "material": "Zinc Die-Cast with Stainless Steel Housing",
                "finish": "Satin Chrome",
                "warranty": "3 Years Holding Warranty",
                "rating": Decimal("4.7"),
                "review_count": 63,
                "illustration_type": "door_stopper",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 10,
                "description": "Heavy-hold magnetic door stop that protects door handles from damaging adjacent walls.",
                "aliases": ["door stopper", "magnetic stopper", "door catcher"]
            },
            {
                "id": "smh-011",
                "name": "Apex Frameless Glass Patch Fitting Set",
                "sku": "SMH-GL-5011",
                "barcode": "8901031",
                "category": "Door Hardware",
                "category_id": "door-hardware",
                "brand": "Apex Glass",
                "subtitle": "Top & Bottom Pivot Patch • 10-12mm Glass",
                "unit": "set",
                "purchase_price": Decimal("750.00"),
                "selling_price": Decimal("1150.00"),
                "original_price": Decimal("1500.00"),
                "discount_percentage": 23,
                "tax_rate": Decimal("18.00"),
                "badge": "COMMERCIAL",
                "badge_type": "bestseller",
                "material": "Aluminium Alloy Core with SS 304 Cover Plate",
                "finish": "Brushed Stainless Steel",
                "warranty": "5 Years Structural Warranty",
                "rating": Decimal("4.8"),
                "review_count": 31,
                "illustration_type": "door_hardware",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 11,
                "description": "Commercial frameless glass door pivot patch assembly engineered for tempered 10mm to 12mm glass panels.",
                "aliases": ["patch fitting", "glass patch", "glass door pivot"]
            },
            {
                "id": "smh-012",
                "name": "Zenith Soft-Close Sliding Wardrobe Door System",
                "sku": "SMH-SL-6019",
                "barcode": "8901032",
                "category": "Cabinet Hardware",
                "category_id": "cabinet-hardware",
                "brand": "Zenith Motion",
                "subtitle": "Complete 2-Door Kit • 60kg Per Door",
                "unit": "kit",
                "purchase_price": Decimal("1600.00"),
                "selling_price": Decimal("2450.00"),
                "original_price": Decimal("3200.00"),
                "discount_percentage": 23,
                "tax_rate": Decimal("18.00"),
                "badge": "TOP RATED",
                "badge_type": "hot",
                "material": "Extruded Aircraft Grade Aluminium Track",
                "finish": "Natural Anodized Matte",
                "warranty": "10 Years Smooth Gliding Warranty",
                "rating": Decimal("4.9"),
                "review_count": 47,
                "illustration_type": "drawer_slide",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 12,
                "description": "Smooth gliding top-hung bottom-guided wardrobe sliding system with bidirectional hydraulic soft-close dampers.",
                "aliases": ["wardrobe sliding system", "sliding track kit", "soft close sliding"]
            },
            {
                "id": "smh-013",
                "name": "Fortress Hardened Steel Disc Padlock 70mm",
                "sku": "SMH-LK-2012",
                "barcode": "8901033",
                "category": "Locks & Security",
                "category_id": "locks-security",
                "brand": "Fortress Guard",
                "subtitle": "Shrouded Anti-Cut Shackle • 3 Brass Keys",
                "unit": "piece",
                "purchase_price": Decimal("320.00"),
                "selling_price": Decimal("495.00"),
                "original_price": Decimal("650.00"),
                "discount_percentage": 24,
                "tax_rate": Decimal("18.00"),
                "badge": "WEATHERPROOF",
                "badge_type": "discount",
                "material": "Stainless Steel 304 Outer Casing",
                "finish": "Mirror Polished Stainless",
                "warranty": "5 Years Rust-Proof Warranty",
                "rating": Decimal("4.8"),
                "review_count": 83,
                "illustration_type": "padlock_brass",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 13,
                "description": "Circular disc padlock with shielded shackle design preventing bolt cutters and sawing attempts.",
                "aliases": ["disc padlock", "shrouded padlock", "70mm lock"]
            },
            {
                "id": "smh-014",
                "name": "Linear Edge Profile Handle for Kitchen Drawers",
                "sku": "SMH-CH-4088",
                "barcode": "8901034",
                "category": "Cabinet Hardware",
                "category_id": "cabinet-hardware",
                "brand": "Linear Profile",
                "subtitle": "Length 200mm • Ultra Slim J-Pull Profile",
                "unit": "piece",
                "purchase_price": Decimal("75.00"),
                "selling_price": Decimal("125.00"),
                "original_price": Decimal("170.00"),
                "discount_percentage": 26,
                "tax_rate": Decimal("18.00"),
                "badge": "MODERN MINIMAL",
                "badge_type": "new",
                "material": "Extruded Solid Aluminium Alloy",
                "finish": "Brushed Brass Anodized",
                "warranty": "5 Years Finish Warranty",
                "rating": Decimal("4.7"),
                "review_count": 59,
                "illustration_type": "handle_lever_gold",
                "is_bestseller": False,
                "is_recommended": True,
                "display_order": 14,
                "description": "Seamless edge-mounted pull handle that gives kitchen cabinetry and vanity drawers a clean handle-less aesthetic.",
                "aliases": ["profile handle", "edge pull", "j pull handle"]
            },
            {
                "id": "smh-015",
                "name": "18mm Commercial Plywood (7x4 ft)",
                "sku": "PLY-18-C74",
                "barcode": "8901001",
                "category": "Tools & Accessories",
                "category_id": "tools-accessories",
                "brand": "Century Ply",
                "subtitle": "MR Grade • High Density Core",
                "unit": "sheet",
                "purchase_price": Decimal("1800.00"),
                "selling_price": Decimal("2450.00"),
                "original_price": Decimal("2800.00"),
                "discount_percentage": 12,
                "tax_rate": Decimal("18.00"),
                "badge": "CONTRACTOR CHOICE",
                "badge_type": "bestseller",
                "material": "Calibrated Hardwood Timber",
                "finish": "Smooth Sanded",
                "warranty": "10 Years Termite Guarantee",
                "rating": Decimal("4.8"),
                "review_count": 35,
                "illustration_type": "drawer_slide",
                "is_bestseller": False,
                "is_recommended": False,
                "display_order": 15,
                "description": "High-durability 18mm calibrated commercial plywood sheet designed for structural furniture and cabinetry.",
                "aliases": ["18mm ply", "18mm plywood", "commercial ply 18mm", "18 ply"]
            },
            {
                "id": "smh-016",
                "name": "Fevicol SH Synthetic Resin Adhesive (5 kg)",
                "sku": "GLUE-FEVICOL-5KG",
                "barcode": "8901006",
                "category": "Tools & Accessories",
                "category_id": "tools-accessories",
                "brand": "Pidilite",
                "subtitle": "All-Round Wood Adhesive • Quick Grab",
                "unit": "packet",
                "purchase_price": Decimal("750.00"),
                "selling_price": Decimal("980.00"),
                "original_price": Decimal("1100.00"),
                "discount_percentage": 11,
                "tax_rate": Decimal("18.00"),
                "badge": "GENUINE",
                "badge_type": "bestseller",
                "material": "Synthetic Resin",
                "finish": "White Emulsion",
                "warranty": "Standard Quality Seal",
                "rating": Decimal("4.9"),
                "review_count": 120,
                "illustration_type": "tower_bolt",
                "is_bestseller": False,
                "is_recommended": False,
                "display_order": 16,
                "description": "Industry standard synthetic resin adhesive for bonding plywood, laminate, veneer, and particleboard.",
                "aliases": ["fevicol", "5kg fevicol", "wood glue", "adhesive"]
            }
        ]

        for item in products_seed:
            aliases = item.pop("aliases", [])
            p = Product(**item)
            db.add(p)
            db.flush()

            for alias_str in aliases:
                db.add(ProductAlias(product_id=p.id, alias=alias_str))

            # Add inventory
            inv = InventoryItem(
                product_id=p.id,
                on_hand=Decimal("45.00"),
                reserved=Decimal("2.00"),
                reorder_level=Decimal("8.00"),
                reorder_quantity=Decimal("30.00")
            )
            db.add(inv)

        # 3. Seed Storefront CMS Content
        from app.api.v1.storefront import DEFAULT_SECTIONS
        for sec_key, content_dict in DEFAULT_SECTIONS.items():
            db.add(StorefrontContent(section_key=sec_key, content_json=json.dumps(content_dict)))

        # 4. Loyalty Account for Ramesh
        loyalty = LoyaltyAccount(customer_id=ramesh.id, tier="SILVER", points=1450, total_earned=3200)
        db.add(loyalty)

        # 5. Loyalty Rewards
        r1 = LoyaltyReward(title="10% Discount Voucher", points_required=500, description="10% off next purchase up to ₹1,000")
        r2 = LoyaltyReward(title="Free Masonry Drill Bit Set", points_required=800, description="5-piece professional carbide tip drill set")
        r3 = LoyaltyReward(title="Leather Carpenter Tool Belt", points_required=1500, description="Heavy duty genuine leather tool belt with metal tape holder")
        db.add_all([r1, r2, r3])

        db.commit()
        print("Seed data successfully populated with dynamic categories, products, and CMS content!")
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    force_drop = "--reset" in sys.argv or "--force" in sys.argv
    seed_data(drop_existing=force_drop)


