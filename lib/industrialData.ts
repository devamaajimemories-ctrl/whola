// abcd/lib/industrialData.ts

// ---------------------------------------------------------------------------
// THE KEYWORD ENGINE
// Strategy: Use a structured Master Database -> Explode into Long-tail Keywords
// ---------------------------------------------------------------------------

// 1. MASTER DATABASE (Categorized for UI/Navigation potential)
export const industrialProducts = [
    // ==================================================================
    // 1. AGRICULTURE & FARMING
    // ==================================================================
    {
        category: "Agriculture: Pulses (Dals)",
        products: [
            "Toor Dal (Pigeon Peas)", "Moong Dal (Green Gram)", "Urad Dal (Black Gram)", "Chana Dal (Chickpeas)", "Masoor Dal (Red Lentils)",
            "Kabuli Chana (White Chickpeas)", "Rajma (Kidney Beans)", "Moth Beans", "Lobia (Black Eyed Peas)", "Horse Gram (Kulthi)",
            "Green Peas (Matar)", "Soybean Seeds", "Chickpeas (Desi Chana)", "Split Peas", "Organic Pulses", "Polished Dal", "Unpolished Dal"
        ]
    },
    {
        category: "Agriculture: Food Grains & Cereals",
        products: [
            "Basmati Rice", "Non-Basmati Rice", "Sona Masoori Rice", "Brown Rice", "Parboiled Rice", "Broken Rice", "Jasmine Rice",
            "Wheat (Lokwan, Sharbati, MP)", "Wheat Flour (Atta)", "Maida (Refined Flour)", "Semolina (Sooji)",
            "Maize (Corn)", "Corn Flour", "Millet (Bajra)", "Sorghum (Jowar)", "Finger Millet (Ragi)", "Barley (Jau)", "Oats", "Quinoa",
            "Poha (Flattened Rice)", "Murmura (Puffed Rice)"
        ]
    },
    {
        category: "Agriculture: Spices & Seasonings",
        products: [
            "Red Chilli Powder", "Whole Red Chillies", "Turmeric Finger", "Turmeric Powder", "Coriander Seeds", "Coriander Powder",
            "Cumin Seeds (Jeera)", "Mustard Seeds (Rai)", "Fenugreek Seeds (Methi)", "Fennel Seeds (Saunf)", "Black Pepper", "White Pepper",
            "Cardamom (Green/Black)", "Cloves", "Cinnamon", "Nutmeg", "Mace", "Star Anise", "Asafoetida (Hing)", "Tamarind",
            "Ginger (Fresh/Dry)", "Garlic", "Saffron", "Vanilla Beans", "Poppy Seeds (Khas Khas)", "Sesame Seeds", "Ajwain",
            "Garam Masala", "Chaat Masala", "Chicken Masala", "Meat Masala", "Biryani Masala"
        ]
    },
    {
        category: "Agriculture: Fresh Fruits",
        products: [
            "Mangoes (Alphonso, Kesar, Dasheri)", "Bananas", "Apples", "Grapes", "Pomegranates", "Oranges", "Papaya", "Pineapple",
            "Watermelon", "Muskmelon", "Guava", "Kiwi", "Strawberries", "Dragon Fruit", "Avocado", "Lychee", "Custard Apple",
            "Imported Fruits", "Organic Fruits"
        ]
    },
    {
        category: "Agriculture: Fresh Vegetables",
        products: [
            "Onions (Red/White)", "Potatoes", "Tomatoes", "Green Chillies", "Lemon", "Ginger", "Garlic", "Cauliflower", "Cabbage",
            "Okra (Lady Finger)", "Brinjal (Eggplant)", "Spinach", "Carrots", "Cucumber", "Capsicum", "Beans", "Peas", "Pumpkin",
            "Bottle Gourd", "Bitter Gourd", "Drumsticks", "Broccoli", "Lettuce", "Zucchini", "Mushrooms", "Sweet Corn"
        ]
    },
    {
        category: "Agriculture: Dry Fruits & Nuts",
        products: [
            "Almonds (Badam)", "Cashew Nuts (Kaju)", "Walnuts (Akhrot)", "Pistachios (Pista)", "Raisins (Kishmish)", "Dates (Khajoor)",
            "Figs (Anjeer)", "Apricots", "Fox Nuts (Makhana)", "Dry Coconut (Copra)", "Betel Nuts (Supari)", "Pine Nuts",
            "Hazelnuts", "Prunes", "Cranberries", "Blueberries"
        ]
    },
    {
        category: "Agriculture: Oil Seeds & Edible Oils",
        products: [
            "Groundnut Seeds", "Sesame Seeds", "Sunflower Seeds", "Castor Seeds", "Flax Seeds", "Mustard Seeds", "Soybean Seeds",
            "Mustard Oil", "Refined Soybean Oil", "Sunflower Oil", "Groundnut Oil", "Rice Bran Oil", "Palm Oil", "Coconut Oil",
            "Olive Oil", "Castor Oil", "Cottonseed Oil", "Desi Ghee", "Vanaspati Ghee", "Almond Oil"
        ]
    },
    {
        category: "Agriculture: Animal Feed & Poultry",
        products: [
            "Cattle Feed", "Poultry Feed", "Fish Feed", "Soybean Meal", "Rapeseed Meal", "Cottonseed Cake", "Maize Gluten",
            "Rice Bran", "Wheat Bran", "Molasses", "Fodder Seeds", "Mineral Mixtures", "Dog Food", "Cat Food"
        ]
    },

    // ==================================================================
    // 2. FOOD & BEVERAGE
    // ==================================================================
    {
        category: "Food: Processed & Packaged",
        products: [
            "Instant Noodles", "Pasta", "Macaroni", "Vermicelli", "Biscuits", "Cookies", "Rusk", "Bread", "Buns",
            "Namkeen", "Bhujia", "Potato Chips", "Nachos", "Popcorn", "Roasted Nuts",
            "Pickles (Mango, Lime, Mix)", "Chutneys", "Sauces (Tomato, Chilli, Soya)", "Vinegar", "Mayonnaise",
            "Jams", "Jellies", "Marmalade", "Honey", "Peanut Butter", "Chocolate Spread",
            "Papad", "Ready to Eat Meals", "Frozen Snacks (Samosa, Fries, Nuggets)", "Canned Food"
        ]
    },
    {
        category: "Food: Dairy Products",
        products: [
            "Milk (Toned, Full Cream)", "Milk Powder (Skimmed/Whole)", "Butter (Table/White)", "Ghee (Cow/Buffalo)",
            "Cheese (Mozzarella, Cheddar, Processed)", "Paneer (Cottage Cheese)", "Curd (Dahi)", "Yogurt", "Lassi", "Buttermilk",
            "Condensed Milk", "Khoya", "Cream", "Ice Cream", "Dairy Whitener", "Flavored Milk"
        ]
    },
    {
        category: "Food: Beverages",
        products: [
            "Tea (CTC, Orthodox, Green, Herbal)", "Coffee Beans (Arabica, Robusta)", "Instant Coffee", "Filter Coffee",
            "Fruit Juices (Mango, Apple, Orange)", "Nectars", "Carbonated Soft Drinks", "Soda Water", "Energy Drinks",
            "Mineral Water", "Packaged Drinking Water", "Squashes", "Syrups (Rose, Khus)", "Malt Drinks", "Health Drinks"
        ]
    },
    {
        category: "Food: Sweeteners & Ingredients",
        products: [
            "Sugar (White, Brown)", "Jaggery (Gur)", "Sugar Cubes", "Liquid Glucose", "Corn Syrup",
            "Baking Powder", "Baking Soda", "Yeast", "Cocoa Powder", "Custard Powder", "Corn Starch", "Food Colors", "Food Flavors",
            "Monosodium Glutamate (MSG)", "Preservatives"
        ]
    },

    // ==================================================================
    // 3. APPAREL, TEXTILES & FASHION
    // ==================================================================
    {
        category: "Apparel: Men's Wear",
        products: [
            "Men's T-Shirts (Round Neck, Polo)", "Men's Formal Shirts", "Men's Casual Shirts", "Men's Jeans", "Men's Trousers",
            "Men's Suits", "Blazers", "Waistcoats", "Sherwanis", "Kurta Pajama", "Dhotis",
            "Men's Shorts", "Track Pants", "Tracksuits", "Gym Wear", "Men's Innerwear (Briefs, Vests)", "Socks", "Swimwear", "Raincoats"
        ]
    },
    {
        category: "Apparel: Women's Wear",
        products: [
            "Sarees (Silk, Cotton, Georgette, Chiffon)", "Kurtis", "Salwar Kameez", "Lehenga Choli", "Gowns",
            "Women's Tops", "Tunics", "Women's Shirts", "Women's Jeans", "Jeggings", "Leggings", "Palazzo Pants", "Skirts",
            "Women's Dresses", "Nightwear", "Lingerie", "Bras", "Panties", "Shapewear", "Dupattas", "Stoles", "Abayas", "Burqas"
        ]
    },
    {
        category: "Apparel: Kids' Wear",
        products: [
            "Boys T-Shirts", "Boys Shirts", "Boys Jeans", "Boys Shorts", "Boys Ethnic Wear",
            "Girls Frocks", "Girls Dresses", "Girls Tops", "Girls Jeans", "Girls Skirts", "Girls Ethnic Wear",
            "Infant Wear", "Rompers", "Baby Suits", "Bibs", "School Uniforms"
        ]
    },
    {
        category: "Textiles: Fabrics",
        products: [
            "Cotton Fabric", "Polyester Fabric", "Silk Fabric", "Rayon Fabric", "Denim Fabric", "Linen Fabric",
            "Georgette Fabric", "Chiffon Fabric", "Velvet Fabric", "Satin Fabric", "Lycra Fabric", "Knitted Fabric",
            "Printed Fabric", "Embroidered Fabric", "Grey Fabric", "Canvas Fabric", "Jute Fabric", "Upholstery Fabric",
            "Non-Woven Fabric", "Curtain Fabric", "Sofa Fabric"
        ]
    },
    {
        category: "Textiles: Yarns & Threads",
        products: [
            "Cotton Yarn", "Polyester Yarn", "Viscose Yarn", "Nylon Yarn", "Acrylic Yarn", "Blended Yarn", "Silk Yarn",
            "Sewing Thread", "Embroidery Thread", "Zari Thread", "Woolen Yarn", "Filament Yarn"
        ]
    },
    {
        category: "Fashion Accessories",
        products: [
            "Belts (Leather, PU)", "Wallets", "Handbags", "Clutches", "Backpacks", "School Bags", "Laptop Bags",
            "Sunglasses", "Watches", "Caps", "Hats", "Scarves", "Ties", "Cufflinks", "Handkerchiefs", "Hair Bands", "Clips"
        ]
    },
    {
        category: "Footwear",
        products: [
            "Men's Formal Shoes", "Men's Casual Shoes", "Sports Shoes", "Sneakers", "Loafers", "Sandals", "Slippers", "Flip Flops",
            "Women's Heels", "Women's Flats", "Wedges", "Boots", "Kids' Shoes", "School Shoes", "Safety Shoes", "Canvas Shoes",
            "Leather Shoes", "Orthopedic Footwear"
        ]
    },

    // ==================================================================
    // 4. INDUSTRIAL MACHINERY & EQUIPMENT
    // ==================================================================
    {
        category: "Machinery: Metal Working",
        products: [
            "CNC Machines (VMC, HMC)", "Lathe Machines", "Milling Machines", "Drilling Machines", "Grinding Machines",
            "Shaper Machines", "Bandsaw Machines", "Power Press", "Hydraulic Press", "Shearing Machines", "Press Brakes",
            "Laser Cutting Machines", "Plasma Cutting Machines", "Water Jet Cutting Machines", "Welding Machines",
            "Sheet Metal Machinery", "Wire Nail Making Machines"
        ]
    },
    {
        category: "Machinery: Construction & Heavy Earthmoving",
        products: [
            "Excavators", "Backhoe Loaders (JCB)", "Bulldozers", "Cranes (Mobile, Tower, EOT)", "Forklifts",
            "Road Rollers", "Concrete Mixers", "Concrete Pumps", "Asphalt Pavers", "Dump Trucks", "Wheel Loaders",
            "Brick Making Machines", "Block Making Machines", "Stone Crushers", "Vibratory Compactors", "Piling Rigs",
            "Bar Bending Machines", "Bar Cutting Machines"
        ]
    },
    {
        category: "Machinery: Food Processing",
        products: [
            "Flour Mills (Atta Chakki)", "Rice Mill Machinery", "Oil Expellers", "Spice Grinding Machines",
            "Bakery Machinery (Ovens, Mixers)", "Dairy Machinery", "Snacks Making Machines", "Noodle Making Machines",
            "Vegetable Cutting Machines", "Juice Extractors", "Pulverizers", "Roasters", "Popcorn Machines",
            "Sugar Cane Juice Machines", "Chapati Making Machines"
        ]
    },
    {
        category: "Machinery: Packaging",
        products: [
            "Pouch Packing Machines", "Filling Machines (Liquid, Powder, Paste)", "Sealing Machines", "Wrapping Machines",
            "Strapping Machines", "Capping Machines", "Labeling Machines", "Vacuum Packing Machines", "Shrink Wrapping Machines",
            "Carton Sealing Machines", "Batch Coding Machines", "Blister Packing Machines"
        ]
    },
    {
        category: "Machinery: Textile & Garment",
        products: [
            "Sewing Machines (Industrial)", "Embroidery Machines", "Knitting Machines", "Weaving Looms", "Spinning Machines",
            "Dyeing Machines", "Printing Machines (Textile)", "Cutting Machines (Fabric)", "Fusing Machines", "Ironing Tables",
            "Steam Irons", "Button Stitching Machines"
        ]
    },
    {
        category: "Machinery: Plastic & Rubber",
        products: [
            "Injection Moulding Machines", "Blow Moulding Machines", "Extrusion Machines", "Thermoforming Machines",
            "Plastic Recycling Machines", "Granulators", "Rubber Moulding Machines", "Tyre Making Machinery", "Pet Blow Moulding Machines"
        ]
    },
    {
        category: "Machinery: Pharmaceutical & Chemical",
        products: [
            "Tablet Press Machines", "Capsule Filling Machines", "Blister Packing Machines", "Ampoule Filling Machines",
            "Chemical Reactors", "Mixers & Blenders", "Centrifuges", "Dryers (Tray, Fluid Bed)", "Coating Pans",
            "Granulators"
        ]
    },
    {
        category: "Machinery: General Industrial",
        products: [
            "Air Compressors (Screw, Reciprocating)", "Diesel Generators (DG Sets)", "Industrial Pumps", "Industrial Valves",
            "Boilers", "Heat Exchangers", "Cooling Towers", "Chillers", "Conveyor Systems", "Material Handling Equipment",
            "Pollution Control Equipment", "Water Treatment Plants (RO Plants)", "Dust Collectors"
        ]
    },

    // ==================================================================
    // 5. ELECTRICAL & ELECTRONICS
    // ==================================================================
    {
        category: "Electrical: Power & Distribution",
        products: [
            "Transformers (Power, Distribution)", "Stabilizers (Servo, Automatic)", "UPS Systems (Online, Offline)", "Inverters",
            "Batteries (Lead Acid, SMF, Lithium-ion)", "Solar Panels", "Solar Inverters", "Solar Water Heaters",
            "Diesel Generators", "Alternators", "Power Factors", "Control Transformers"
        ]
    },
    {
        category: "Electrical: Cables & Wires",
        products: [
            "Power Cables (HT/LT)", "Control Cables", "House Wires", "Flexible Cables", "Armoured Cables", "Unarmoured Cables",
            "Coaxial Cables", "LAN Cables (CAT6)", "Fiber Optic Cables", "Submersible Cables", "Telephone Cables",
            "Welding Cables", "CCTV Cables"
        ]
    },
    {
        category: "Electrical: Switchgear & Protection",
        products: [
            "MCB (Miniature Circuit Breakers)", "MCCB (Moulded Case Circuit Breakers)", "ACB (Air Circuit Breakers)",
            "RCCB (Residual Current Circuit Breakers)", "Isolators", "Distribution Boards (DB)", "Switch Fuse Units",
            "Contactors", "Relays", "Capacitors", "Control Panels", "Busbars", "Changeover Switches"
        ]
    },
    {
        category: "Electrical: Lighting & Accessories",
        products: [
            "LED Bulbs", "LED Tubelights", "LED Panel Lights", "LED Flood Lights", "LED Street Lights", "High Bay Lights",
            "Downlights", "Strip Lights", "Decorative Lights", "Chandeliers", "Switches & Sockets", "Plugs & Tops", "Holders",
            "Track Lights", "Garden Lights", "Emergency Lights"
        ]
    },
    {
        category: "Electronics: Consumer & IT",
        products: [
            "Mobile Phones", "Smartphones", "Tablets", "Laptops", "Desktops", "Monitors", "Printers", "Scanners",
            "Projectors", "Televisions (LED, Smart TV)", "Home Theatre Systems", "Speakers", "Headphones", "Earphones",
            "Smart Watches", "Power Banks", "Chargers", "Data Cables", "Computer Accessories (Mouse, Keyboard)",
            "Routers", "Hard Drives", "SSD", "Pendrives"
        ]
    },
    {
        category: "Electronics: Components",
        products: [
            "Resistors", "Capacitors", "Diodes", "Transistors", "ICs (Integrated Circuits)", "PCBs (Printed Circuit Boards)",
            "LEDs", "Sensors", "Microcontrollers", "Connectors", "Switches (Tactile, Rocker)", "Relays", "Potentiometers",
            "Breadboards", "Soldering Irons"
        ]
    },

    // ==================================================================
    // 6. INDUSTRIAL SUPPLIES, TOOLS & HARDWARE
    // ==================================================================
    {
        category: "Tools: Hand Tools",
        products: [
            "Spanners (Double Open, Ring)", "Wrenches (Pipe, Adjustable)", "Pliers (Combination, Nose)", "Screwdrivers",
            "Hammers (Claw, Ball Pein)", "Chisels", "Files", "Saws (Hand, Hacksaw)", "Vices", "Clamps", "Tool Kits", "Allen Keys",
            "Cutters", "Measuring Tapes", "Spirit Levels"
        ]
    },
    {
        category: "Tools: Power Tools",
        products: [
            "Drill Machines", "Angle Grinders", "Cut-off Machines", "Marble Cutters", "Circular Saws", "Jigsaws",
            "Sanders", "Polishers", "Blowers", "Heat Guns", "Impact Wrenches", "Rotary Hammers", "Demolition Hammers",
            "Cordless Drills", "Planers"
        ]
    },
    {
        category: "Tools: Cutting & Abrasives",
        products: [
            "Drill Bits (HSS, Masonry)", "End Mills", "Taps & Dies", "Reamers", "Carbide Inserts", "Saw Blades",
            "Grinding Wheels", "Cutting Wheels", "Flap Discs", "Sanding Discs", "Sandpaper", "Diamond Blades",
            "Holesaws", "Tool Bits"
        ]
    },
    {
        category: "Hardware: Fasteners",
        products: [
            "Bolts (Hex, Allen, Carriage)", "Nuts (Hex, Lock, Wing)", "Screws (Wood, Machine, Self-Tapping)", "Washers (Plain, Spring)",
            "Studs", "Rivets", "Anchors (Rawl Plugs, Anchor Bolts)", "Threaded Rods", "Circlips", "Cotter Pins",
            "Clamps", "Hooks"
        ]
    },
    {
        category: "Hardware: General",
        products: [
            "Door Handles", "Door Locks", "Hinges", "Latches", "Door Closers", "Drawer Slides", "Cabinet Handles",
            "Castor Wheels", "Curtain Fittings", "Glass Fittings", "Aluminium Profiles", "Wire Mesh", "Chain Link Fencing",
            "Mosquito Nets", "Trolley Wheels"
        ]
    },
    {
        category: "Industrial Safety Equipment",
        products: [
            "Safety Shoes", "Safety Helmets", "Safety Gloves (Cotton, Leather, Nitrile)", "Safety Goggles", "Ear Plugs", "Face Masks",
            "Safety Harnesses", "Reflective Jackets", "Safety Nets", "Road Safety Cones", "Fire Extinguishers", "Fire Hydrants",
            "Safety Showers", "Breathing Apparatus"
        ]
    },

    // ==================================================================
    // 7. CHEMICALS, PHARMA & PLASTICS
    // ==================================================================
    {
        category: "Chemicals: Industrial",
        products: [
            "Sulphuric Acid", "Hydrochloric Acid", "Nitric Acid", "Acetic Acid", "Phosphoric Acid",
            "Caustic Soda (Flakes/Lye)", "Soda Ash", "Bleaching Powder", "Alum", "Lime Powder",
            "Methanol", "Ethanol", "Toluene", "Acetone", "Benzene", "Xylene", "IPA (Isopropyl Alcohol)",
            "Formaldehyde", "Glycerine", "Hydrogen Peroxide", "Ammonia", "Chlorine", "Activated Carbon"
        ]
    },
    {
        category: "Chemicals: Dyes & Pigments",
        products: [
            "Reactive Dyes", "Acid Dyes", "Direct Dyes", "Basic Dyes", "Vat Dyes", "Disperse Dyes", "Sulphur Dyes",
            "Organic Pigments", "Inorganic Pigments", "Titanium Dioxide", "Carbon Black", "Iron Oxide", "Masterbatches",
            "Food Colors", "Textile Auxiliaries"
        ]
    },
    {
        category: "Chemicals: Agro & Fertilizers",
        products: [
            "Urea", "DAP (Di-ammonium Phosphate)", "MOP (Muriate of Potash)", "NPK Fertilizers", "Zinc Sulphate",
            "Pesticides", "Insecticides", "Herbicides", "Fungicides", "Plant Growth Regulators", "Bio Fertilizers",
            "Organic Manure", "Neem Oil"
        ]
    },
    {
        category: "Polymers & Plastics",
        products: [
            "PP Granules (Polypropylene)", "HDPE Granules", "LDPE Granules", "LLDPE Granules", "PVC Resin", "PET Resin",
            "ABS Granules", "Nylon Granules", "Polycarbonate Granules", "Polystyrene (GPPS/HIPS)", "EVA", "Plastic Scrap",
            "Recycled Plastic Granules", "Acrylic Sheets", "Teflon Rods"
        ]
    },

    // ==================================================================
    // 8. CONSTRUCTION & REAL ESTATE
    // ==================================================================
    {
        category: "Construction Materials",
        products: [
            "Cement (OPC, PPC, White)", "Steel Rebars (TMT Bars)", "Bricks (Red, Fly Ash)", "AAC Blocks", "Sand (River, M-Sand)",
            "Aggregates (Gitti)", "Ready Mix Concrete (RMC)", "Stone Chips", "Lime", "Bitumen", "Wall Putty", "Plaster of Paris (POP)",
            "Construction Chemicals", "Waterproofing Compounds"
        ]
    },
    {
        category: "Building Materials: Stones & Tiles",
        products: [
            "Ceramic Tiles", "Vitrified Tiles", "Wall Tiles", "Floor Tiles", "Parking Tiles", "Mosaic Tiles",
            "Granite Slabs", "Marble Slabs", "Sandstone", "Limestone", "Kota Stone", "Slate Stone", "Quartz",
            "Italian Marble", "Travertine"
        ]
    },
    {
        category: "Building Materials: Wood & Plywood",
        products: [
            "Plywood (Commercial, Marine)", "Block Boards", "Flush Doors", "Laminates (Sunmica)", "Veneers",
            "MDF Boards", "Particle Boards", "Teak Wood", "Sal Wood", "Pine Wood", "Wooden Beading", "WPC Boards",
            "PVC Sheets", "Wooden Flooring"
        ]
    },
    {
        category: "Building Materials: Plumbing & Sanitary",
        products: [
            "PVC Pipes", "UPVC Pipes", "CPVC Pipes", "GI Pipes", "HDPE Pipes", "Pipe Fittings (Elbows, Tees)",
            "Water Tanks", "Taps & Faucets", "Showers", "Wash Basins", "Water Closets (Toilets)", "Kitchen Sinks", "Bath Tubs",
            "Cisterns", "Bathroom Accessories", "Solvent Cement"
        ]
    },
    {
        category: "Building Materials: Glass & Paints",
        products: [
            "Float Glass", "Toughened Glass", "Laminated Glass", "Reflective Glass", "Mirrors",
            "Wall Paints (Emulsion, Distemper)", "Enamel Paints", "Primers", "Putty", "Texture Paints", "Waterproofing Chemicals",
            "Wood Polish", "Thinners", "Spray Paints"
        ]
    },

    // ==================================================================
    // 9. PACKAGING & PAPER
    // ==================================================================
    {
        category: "Packaging Materials",
        products: [
            "Corrugated Boxes", "Cardboard Boxes", "Cartons", "Paper Bags", "Plastic Bags", "Carry Bags", "Garbage Bags",
            "BOPP Tapes", "Adhesive Tapes", "Stretch Film", "Shrink Film", "Bubble Wrap", "Foam Sheets",
            "Plastic Crates", "Wooden Pallets", "Plastic Pallets", "Jute Bags", "Woven Sacks (PP/HDPE)", "Strapping Rolls",
            "Packaging Clips", "Edge Guards"
        ]
    },
    {
        category: "Packaging: Containers & Bottles",
        products: [
            "PET Bottles", "Plastic Jars", "Glass Bottles", "Glass Jars", "Tin Cans", "Aluminium Containers",
            "Plastic Caps & Closures", "Dispenser Pumps", "Trigger Sprayers", "Cosmetic Containers", "Pharmaceutical Bottles"
        ]
    },
    {
        category: "Paper & Stationery",
        products: [
            "A4 Copier Paper", "Writing Paper", "Printing Paper", "Kraft Paper", "Duplex Board", "Tissue Paper", "Toilet Paper",
            "Notebooks", "Diaries", "Files & Folders", "Pens", "Pencils", "Markers", "Staplers", "Calculators",
            "Thermal Paper Rolls", "Carbon Paper", "Art Paper"
        ]
    },

    // ==================================================================
    // 10. AUTOMOTIVE & TRANSPORT
    // ==================================================================
    {
        category: "Automotive Parts",
        products: [
            "Engine Parts (Pistons, Rings, Valves)", "Clutch Plates", "Brake Pads", "Brake Shoes", "Filters (Oil, Air, Fuel)",
            "Bearings", "Gears", "Shafts", "Axles", "Suspension Parts (Shock Absorbers)", "Steering Parts", "Radiators", "Silencers",
            "Spark Plugs", "Headlights", "Tail Lights", "Mirrors", "Wipers", "Bumpers"
        ]
    },
    {
        category: "Automotive Accessories",
        products: [
            "Car Seat Covers", "Car Mats", "Car Covers", "Steering Covers", "Car Perfumes", "Car Audio Systems", "GPS Trackers",
            "Helmets", "Bike Accessories", "Tyres (Car, Bike, Truck)", "Tubes", "Alloy Wheels", "Batteries",
            "Bike Seat Covers", "Car Care Products (Polish, Wax)"
        ]
    },
    {
        category: "Automotive Oils & Lubricants",
        products: [
            "Engine Oil", "Gear Oil", "Brake Fluid", "Coolant", "Grease", "Hydraulic Oil", "Transmission Fluid", "Fork Oil"
        ]
    },
    {
        category: "Vehicles",
        products: [
            "Bicycles", "Electric Scooters", "E-Rickshaws", "Tractors", "Trucks", "Tempos", "Trailers", "Cars", "Motorcycles",
            "Buses", "Ambulances", "Food Trucks"
        ]
    },

    // ==================================================================
    // 11. HOME SUPPLIES & FURNITURE
    // ==================================================================
    {
        category: "Furniture: Home & Office",
        products: [
            "Sofas", "Sofa Cum Beds", "Chairs (Office, Dining, Plastic)", "Tables (Dining, Coffee, Study)", "Beds (Double, Single)",
            "Wardrobes", "Almirahs", "Cabinets", "Shoe Racks", "TV Units", "Office Desks", "Workstations", "Bean Bags",
            "Computer Tables", "Dressing Tables", "Bookshelves", "Recliners"
        ]
    },
    {
        category: "Home Furnishings",
        products: [
            "Bed Sheets", "Pillow Covers", "Blankets", "Quilts", "Comforters", "Curtains", "Blinds",
            "Carpets", "Rugs", "Door Mats", "Towels", "Cushions", "Pillows", "Mattresses", "Mosquito Nets", "Table Cloths"
        ]
    },
    {
        category: "Kitchenware & Dining",
        products: [
            "Cookware Sets", "Pressure Cookers", "Pans (Tawa, Fry Pan)", "Kadai", "Utensils (Steel, Aluminium)",
            "Dinner Sets", "Cutlery (Spoons, Forks)", "Glassware", "Mugs", "Bottles", "Tiffin Boxes", "Casseroles",
            "Kitchen Tools (Knives, Peelers)", "Gas Stoves", "Mixer Grinders", "Toasters", "Kettles", "Water Purifiers"
        ]
    },
    {
        category: "Home Decor & Handicrafts",
        products: [
            "Wall Clocks", "Wall Art", "Paintings", "Photo Frames", "Vases", "Artificial Flowers", "Showpieces",
            "Candles", "Candle Holders", "Idols & Figurines", "Pottery", "Brass Handicrafts", "Wooden Handicrafts",
            "Lamps", "Wall Stickers", "Fountains"
        ]
    },
    {
        category: "Housekeeping & Cleaning",
        products: [
            "Brooms", "Mops", "Wipers", "Dustbins", "Buckets", "Mugs", "Cleaning Cloths", "Sponges", "Scrubbers",
            "Floor Cleaners", "Toilet Cleaners", "Glass Cleaners", "Dishwash Liquid", "Detergent Powder", "Laundry Soaps",
            "Air Fresheners", "Napkins", "Toilet Brushes"
        ]
    },

    // ==================================================================
    // 12. MEDICAL, PHARMA & HEALTHCARE
    // ==================================================================
    {
        category: "Medical Equipment & Instruments",
        products: [
            "Hospital Beds (ICU, Fowlers)", "Wheelchairs (Manual, Electric)", "Stretchers", "Operation Theater Lights", "OT Tables",
            "Patient Monitors", "ECG Machines", "Ultrasound Machines", "X-Ray Machines", "Ventilators", "Nebulizers",
            "Oxygen Concentrators", "BP Monitors (Sphygmomanometers)", "Stethoscopes", "Thermometers (Digital, Infrared)",
            "Pulse Oximeters", "Glucometers", "Weighing Scales (Medical)", "Suction Machines", "Dental Chairs"
        ]
    },
    {
        category: "Medical Consumables & Disposables",
        products: [
            "Surgical Masks (3 Ply, N95)", "Surgical Gloves (Latex, Nitrile)", "PPE Kits", "Disposable Syringes", "Hypodermic Needles",
            "IV Sets", "Cannulas", "Catheters", "Bandages", "Cotton Rolls", "Gauze Swabs", "Surgical Tapes", "Face Shields",
            "Shoe Covers", "Head Caps", "Adult Diapers", "Sanitary Pads", "Test Kits (Pregnancy, Dengue)"
        ]
    },
    {
        category: "Pharmaceutical Drugs & Medicines",
        products: [
            "Tablets", "Capsules", "Syrups", "Injections", "Ointments", "Creams", "Gels", "Eye Drops", "Ear Drops",
            "Antibiotics", "Analgesics (Pain Killers)", "Vitamins & Supplements", "Ayurvedic Medicines", "Homeopathic Medicines",
            "Herbal Extracts", "Nutraceuticals", "Vaccines", "Generic Medicines"
        ]
    },
    {
        category: "Personal Care & Cosmetics",
        products: [
            "Soaps", "Shampoos", "Conditioners", "Hair Oils", "Body Lotions", "Face Creams", "Face Wash", "Sunscreen",
            "Perfumes", "Deodorants", "Makeup Kits", "Lipsticks", "Nail Polish", "Hair Color", "Shaving Creams", "Razors",
            "Toothpaste", "Toothbrushes", "Hand Wash", "Sanitizers", "Baby Care Products"
        ]
    },

    // ==================================================================
    // 13. SCIENTIFIC & LAB INSTRUMENTS
    // ==================================================================
    {
        category: "Laboratory Glassware",
        products: [
            "Beakers", "Flasks (Conical, Volumetric)", "Test Tubes", "Pipettes", "Burettes", "Measuring Cylinders",
            "Petri Dishes", "Funnels", "Glass Rods", "Reagent Bottles", "Desiccators", "Condensers", "Slides"
        ]
    },
    {
        category: "Lab Equipment & Instruments",
        products: [
            "Microscopes (Compound, Stereo)", "Centrifuges", "Autoclaves", "Incubators", "Ovens (Lab)", "Water Baths",
            "Magnetic Stirrers", "PH Meters", "Conductivity Meters", "Refractometers", "Spectrophotometers",
            "Balances (Analytical, Precision)", "Fume Hoods", "Laminar Air Flow", "Distillation Units", "Viscometers"
        ]
    },
    {
        category: "Educational Lab Equipment",
        products: [
            "Physics Lab Equipment (Prisms, Lenses, Magnets)", "Chemistry Lab Kits", "Biology Models (Skeleton, Torso)",
            "Charts & Maps", "Globes", "Telescopes", "Maths Lab Kits", "Engineering Lab Equipment"
        ]
    },

    // ==================================================================
    // 14. SPORTS, FITNESS & ENTERTAINMENT
    // ==================================================================
    {
        category: "Sports Goods",
        products: [
            "Cricket Bats", "Cricket Balls", "Cricket Kits", "Footballs", "Volleyballs", "Basketballs", "Badminton Rackets",
            "Shuttlecocks", "Tennis Rackets", "Table Tennis Tables", "Hockey Sticks", "Carrom Boards", "Chess Boards",
            "Skating Shoes", "Swimming Goggles", "Yoga Mats", "Jerseys", "Trophies"
        ]
    },
    {
        category: "Fitness & Gym Equipment",
        products: [
            "Treadmills", "Exercise Bikes", "Elliptical Cross Trainers", "Dumbbells", "Barbells", "Weight Plates",
            "Gym Benches", "Multi Gym Machines", "Resistance Bands", "Gym Balls", "Rowing Machines", "Smith Machines"
        ]
    },
    {
        category: "Toys & Games",
        products: [
            "Soft Toys", "Educational Toys", "Electronic Toys", "Remote Control Cars", "Dolls", "Action Figures",
            "Board Games", "Puzzles", "Building Blocks", "Ride-on Cars", "Tricycles", "Playground Equipment (Slides, Swings)",
            "Video Games", "Drones (Toy)"
        ]
    },

    // ==================================================================
    // 15. GEMS, JEWELRY & ASTROLOGY
    // ==================================================================
    {
        category: "Jewelry",
        products: [
            "Gold Jewelry (Rings, Necklaces, Earrings)", "Silver Jewelry", "Diamond Jewelry", "Platinum Jewelry",
            "Imitation Jewelry (Artificial)", "Kundan Jewelry", "Polki Jewelry", "Temple Jewelry", "Bridal Jewelry Sets",
            "Bangles", "Bracelets", "Anklets", "Pendants", "Mangalsutras", "Nose Pins", "Toe Rings"
        ]
    },
    {
        category: "Gemstones",
        products: [
            "Precious Stones (Ruby, Sapphire, Emerald)", "Semi-Precious Stones (Amethyst, Topaz, Garnet)",
            "Diamonds (Loose)", "Pearls (Freshwater, South Sea)", "Coral (Moonga)", "Rudraksha Beads", "Crystal Stones",
            "Birthstones"
        ]
    },

    // ==================================================================
    // 16. GIFTS, CRAFTS & DECOR
    // ==================================================================
    {
        category: "Corporate Gifts",
        products: [
            "Promotional T-Shirts", "Promotional Caps", "Customized Mugs", "Keychains", "Pens (Branded)", "Diaries & Planners",
            "Desktop Organizers", "Trophies & Medals", "Awards", "Gift Sets", "USB Drives", "Power Banks (Customized)",
            "Leather Wallets", "Business Card Holders"
        ]
    },
    {
        category: "Handicrafts & Decor",
        products: [
            "Brass Statues", "Wooden Carvings", "Marble Handicrafts", "Terracotta Items", "Wall Hangings", "Paintings",
            "Flower Vases", "Candle Stands", "Photo Frames", "Clocks", "Artificial Flowers", "Pottery", "Bamboo Crafts",
            "Jute Crafts", "Shell Crafts"
        ]
    },
    {
        category: "Festive Decor",
        products: [
            "Diwali Lights", "Rangoli Colors", "Torans", "Christmas Trees", "Ornaments", "Rakhi", "Holi Colors (Gulal)",
            "Party Supplies (Balloons, Banners)", "Gift Wrapping Paper", "Ribbons"
        ]
    },

    // ==================================================================
    // 17. OFFICE SUPPLIES & STATIONERY
    // ==================================================================
    {
        category: "Office Equipment",
        products: [
            "Photocopiers (Xerox Machines)", "Printers (Laser, Inkjet)", "Scanners", "Laminating Machines", "Paper Shredders",
            "Binding Machines", "Projectors", "Biometric Attendance Systems", "CCTV Cameras", "Currency Counting Machines",
            "EPABX Systems", "Video Conferencing Systems"
        ]
    },
    {
        category: "Office Stationery",
        products: [
            "A4 Paper", "Files & Folders", "Pens & Pencils", "Markers & Highlighters", "Staplers & Pins", "Punching Machines",
            "Calculators", "Sticky Notes", "Whiteboards", "Notice Boards", "Inks & Toners", "Envelopes", "Letterheads",
            "Visiting Cards", "ID Card Holders", "Rubber Stamps"
        ]
    },

    // ==================================================================
    // 18. MINERALS & METALS
    // ==================================================================
    {
        category: "Minerals & Ores",
        products: [
            "Coal (Steam, Coking)", "Iron Ore", "Bauxite", "Limestone", "Gypsum", "Quartz", "Mica", "Dolomite",
            "Silica Sand", "Feldspar", "Bentonite", "Kaolin (China Clay)", "Fly Ash", "Graphite", "Manganese Ore",
            "Rock Phosphate", "Talc Powder"
        ]
    },
    {
        category: "Metal Scraps",
        products: [
            "Copper Scrap", "Aluminium Scrap", "HMS Scrap (Heavy Melting Steel)", "Brass Scrap", "Lead Scrap",
            "Battery Scrap", "Zinc Scrap", "Stainless Steel Scrap", "Iron Scrap", "Cast Iron Scrap"
        ]
    },
    {
        category: "Non-Ferrous Metals",
        products: [
            "Aluminium Ingots", "Copper Cathodes", "Zinc Ingots", "Lead Ingots", "Tin Ingots", "Nickel",
            "Brass Ingots", "Bronze Ingots", "Gun Metal"
        ]
    },

    // ==================================================================
    // 19. TELECOM & NETWORKING
    // ==================================================================
    {
        category: "Telecom Equipment",
        products: [
            "Mobile Signal Boosters", "Optical Fiber Cables (OFC)", "Splicing Machines", "OTDR Machine",
            "Telecom Towers", "Walkie Talkies", "EPABX Systems", "VoIP Gateways", "Telephone Instruments",
            "GSM Gateways"
        ]
    },
    {
        category: "Networking Devices",
        products: [
            "WiFi Routers", "Network Switches", "Server Racks", "LAN Cables (CAT6, CAT5)", "Patch Cords",
            "Modems", "Access Points", "Firewall Devices", "Networking Tools (Crimping Tool, Tester)",
            "Patch Panels", "Servers"
        ]
    },

    // ==================================================================
    // 20. PRINTING & GRAPHICS
    // ==================================================================
    {
        category: "Printing Machinery",
        products: [
            "Offset Printing Machines", "Digital Printers", "Flex Printing Machines", "Screen Printing Machines",
            "Rotogravure Printing Machines", "Sublimation Machines", "Plotters", "Laser Engraving Machines",
            "Paper Cutting Machines", "Binding Machines"
        ]
    },
    {
        category: "Printing Consumables",
        products: [
            "Printing Inks", "Offset Plates", "Flex Banners", "Vinyl Sheets", "Lamination Films", "Sublimation Papers",
            "Printer Cartridges", "Screen Printing Materials", "Heat Transfer Papers"
        ]
    },
    {
        category: "Signage & Display",
        products: [
            "LED Sign Boards", "Neon Signs", "Glow Sign Boards", "Acrylic Letters", "Roll Up Standees", "Canopies",
            "Promo Tables", "Demo Tents", "Digital Signage", "Name Plates", "Safety Signs"
        ]
    },

    // ==================================================================
    // 21. EVENT & EXHIBITION SUPPLIES
    // ==================================================================
    {
        category: "Event Equipment",
        products: [
            "Wedding Tents", "German Hangars", "Stage Truss", "DJ Sound Systems", "Stage Lighting (Par Lights, Sharpy)",
            "LED Video Walls", "Podiums", "Banquet Chairs", "Mist Fans", "Generators for Rent", "Portable Toilets",
            "Carpets for Events"
        ]
    },

    // ==================================================================
    // 22. HOTEL, RESTAURANT & CAFE (HoReCa)
    // ==================================================================
    {
        category: "Commercial Kitchen Equipment",
        products: [
            "Commercial Ovens", "Deep Fryers", "Dough Mixers", "Tandoors (Clay, SS)", "Pizza Ovens", "Grillers",
            "Shawarma Machines", "Idli Steamers", "Chapati Making Machines", "Vegetable Cutters", "Wet Grinders",
            "Tilting Boiling Pans", "Cooking Ranges"
        ]
    },
    {
        category: "Display & Refrigeration",
        products: [
            "Sweet Display Counters", "Cake Display Counters", "Visi Coolers", "Deep Freezers", "Water Coolers",
            "Ice Cream Machines", "Softy Machines", "Slush Machines", "Bain Marie", "Under Counter Fridges",
            "Cold Rooms"
        ]
    },
    {
        category: "Hotel Housekeeping & Supplies",
        products: [
            "Housekeeping Trolleys", "Luggage Trolleys", "Hotel Linens (Bedsheets, Towels)", "Hotel Toiletries",
            "Guest Amenities", "Menu Cards", "Table Mats", "Hotel Uniforms", "Room Dustbins"
        ]
    },

    // ==================================================================
    // 23. RUBBER & RUBBER PRODUCTS
    // ==================================================================
    {
        category: "Industrial Rubber Products",
        products: [
            "Rubber Sheets", "Rubber Mats", "Rubber Hoses", "Conveyor Belts", "V Belts", "Rubber Seals", "O Rings",
            "Rubber Gaskets", "Rubber Bushes", "Rubber Moulded Parts", "Silicone Rubber Products", "Foam Rubber",
            "Rubber Flooring", "Anti Vibration Mounts"
        ]
    },

    // ==================================================================
    // 24. INDUSTRIAL AUTOMATION
    // ==================================================================
    {
        category: "Automation & Control",
        products: [
            "PLC (Programmable Logic Controllers)", "HMI (Human Machine Interface)", "SCADA Systems", "VFD (Variable Frequency Drives)",
            "Servo Motors", "Servo Drives", "Industrial Sensors (Proximity, Photoelectric)", "Encoders", "Industrial PC",
            "Control Panels", "Automation Software", "Robotic Arms", "Linear Actuators"
        ]
    },

    // ==================================================================
    // 25. TESTING & MEASURING INSTRUMENTS
    // ==================================================================
    {
        category: "Electrical Testing Instruments",
        products: [
            "Multimeters", "Clamp Meters", "Insulation Testers (Megger)", "Earth Testers", "Voltage Detectors",
            "Power Analyzers", "Oscilloscopes", "LCR Meters", "Function Generators", "Relay Test Kits"
        ]
    },
    {
        category: "Physical Measuring Instruments",
        products: [
            "Vernier Calipers", "Micrometers", "Dial Indicators", "Height Gauges", "Thickness Gauges", "Hardness Testers",
            "Roughness Testers", "Laser Distance Meters", "Spirit Levels", "Measuring Tapes", "Weighbridges",
            "Flow Meters", "Level Transmitters"
        ]
    },
    {
        category: "Process Measuring Instruments",
        products: [
            "Pressure Gauges", "Temperature Gauges", "Flow Meters", "Level Transmitters", "Thermocouples", "RTD Sensors",
            "Data Loggers", "Anemometers", "Sound Level Meters", "Lux Meters", "Moisture Meters", "Tachometers"
        ]
    },

    // ==================================================================
    // 26. SECURITY & SURVEILLANCE
    // ==================================================================
    {
        category: "CCTV & Surveillance",
        products: [
            "CCTV Cameras (Dome, Bullet, PTZ)", "DVR (Digital Video Recorders)", "NVR (Network Video Recorders)",
            "IP Cameras", "Spy Cameras", "CCTV Cables", "CCTV Power Supply", "Video Door Phones"
        ]
    },
    {
        category: "Access Control & Security",
        products: [
            "Biometric Attendance Machines", "Access Control Systems", "Smart Locks", "Video Door Phones",
            "Boom Barriers", "Turnstiles", "Metal Detectors (Handheld, Door Frame)", "X-Ray Baggage Scanners",
            "Intruder Alarms", "Fire Alarm Systems", "Smoke Detectors", "Security Guard Services"
        ]
    },

    // ==================================================================
    // 27. PIPES, TUBES & FITTINGS
    // ==================================================================
    {
        category: "Industrial Pipes & Tubes",
        products: [
            "SS Pipes (Stainless Steel)", "MS Pipes (Mild Steel)", "GI Pipes (Galvanized Iron)", "Seamless Pipes",
            "Hydraulic Pipes", "Boiler Tubes", "Copper Tubes", "Brass Pipes", "Aluminium Pipes", "Ductile Iron Pipes",
            "Cast Iron Pipes"
        ]
    },
    {
        category: "Pipe Fittings & Flanges",
        products: [
            "Elbows", "Tees", "Reducers", "Couplings", "Unions", "Flanges (Slip-on, Blind, Weld Neck)",
            "Valves (Ball, Gate, Globe, Butterfly, Check)", "Strainers", "Expansion Joints", "Gaskets",
            "Nut Bolts", "Pipe Clamps"
        ]
    },

    // ==================================================================
    // 28. RENEWABLE ENERGY & ENVIRONMENT
    // ==================================================================
    {
        category: "Solar & Renewable Energy",
        products: [
            "Solar Street Lights", "Solar Water Pumps", "Solar Fencing Systems", "Solar Cookers", "Solar Charge Controllers",
            "Wind Turbines", "Bio Gas Plants", "Solar Mounting Structures", "Solar Batteries", "Solar Lanterns",
            "Solar Water Heaters"
        ]
    },
    {
        category: "Pollution Control & Environment",
        products: [
            "Sewage Treatment Plants (STP)", "Effluent Treatment Plants (ETP)", "Industrial RO Plants", "Water Softeners",
            "Air Pollution Control Systems", "Dust Collectors", "Waste Incinerators", "Oil Skimmers", "Noise Barriers",
            "Garbage Converters"
        ]
    },

    // ==================================================================
    // 29. LEATHER & LEATHER PRODUCTS
    // ==================================================================
    {
        category: "Leather & Footwear Components",
        products: [
            "Finished Leather", "Synthetic Leather (Rexine)", "Leather Soles", "Shoe Uppers", "Shoe Lasts",
            "Leather Chemicals", "Tanning Machinery", "Shoe Adhesives"
        ]
    },
    {
        category: "Leather Goods",
        products: [
            "Leather Bags (Laptop, Travel)", "Leather Belts", "Leather Wallets", "Leather Gloves (Industrial, Fashion)",
            "Leather Jackets", "Saddlery & Harness", "Leather Furniture", "Leather Accessories"
        ]
    },

    // ==================================================================
    // 30. HYDRAULIC & PNEUMATIC
    // ==================================================================
    {
        category: "Hydraulic Equipment",
        products: [
            "Hydraulic Cylinders", "Hydraulic Pumps (Gear, Vane, Piston)", "Hydraulic Jacks", "Hydraulic Power Packs",
            "Hydraulic Hoses", "Hydraulic Fittings", "Hydraulic Presses", "Hydraulic Motors", "Hydraulic Filters",
            "Hydraulic Seals"
        ]
    },
    {
        category: "Pneumatic Equipment",
        products: [
            "Pneumatic Cylinders", "Pneumatic Valves (Solenoid, Manual)", "Air Preparation Units (FRL)",
            "Pneumatic Fittings (Push-to-Connect)", "Air Tubing (PU, Nylon)", "Pneumatic Actuators", "Air Guns",
            "Pneumatic Tools"
        ]
    },

    // ==================================================================
    // 31. MARINE, AVIATION & RAILWAY
    // ==================================================================
    {
        category: "Marine & Shipping Supplies",
        products: [
            "Marine Anchors", "Marine Chains", "Marine Ropes", "Ship Deck Equipment", "Life Jackets", "Life Rafts",
            "Marine Engines", "Boat Fenders", "Navigation Lights", "Marine Paints", "Outboard Motors"
        ]
    },
    {
        category: "Aviation & Railway Supplies",
        products: [
            "Aircraft Parts", "Ground Support Equipment", "Railway Track Materials", "Railway Signaling Equipment",
            "Railway Coaches Parts", "Aerospace Components", "Drones (Commercial)"
        ]
    },

    // ==================================================================
    // 32. PREFABRICATED STRUCTURES
    // ==================================================================
    {
        category: "Prefab & Portable Structures",
        products: [
            "Porta Cabins", "Prefabricated Sheds", "Security Cabins", "Mobile Toilets", "Pre-Engineered Buildings (PEB)",
            "Container Houses", "Tensile Structures", "Gazebos", "FRP Cabins", "Clean Rooms", "Cold Storages"
        ]
    },

    // ==================================================================
    // 33. HORTICULTURE & GARDENING
    // ==================================================================
    {
        category: "Plants & Gardening",
        products: [
            "Live Plants (Indoor, Outdoor)", "Vegetable Seeds", "Flower Seeds", "Fruit Plants", "Bonsai Plants",
            "Planters & Pots (Plastic, Ceramic, Clay)", "Garden Tools (Pruners, Trowels)", "Lawn Mowers", "Brush Cutters",
            "Greenhouse Structures", "Coco Peat", "Vermicompost", "Sprinklers", "Drip Irrigation Systems"
        ]
    },

    // ==================================================================
    // 34. LIVESTOCK & ANIMAL HUSBANDRY
    // ==================================================================
    {
        category: "Livestock & Poultry",
        products: [
            "Dairy Cows (HF, Jersey)", "Buffaloes (Murrah)", "Goats (Boer, Sirohi)", "Sheep", "Poultry Chicks (Broiler, Layer)",
            "Fish Seeds (Fingerlings)", "Bee Keeping Boxes", "Incubators (Egg)", "Veterinary Instruments", "Milking Machines"
        ]
    },

    // ==================================================================
    // 35. SCAFFOLDING & SHUTTERING
    // ==================================================================
    {
        category: "Scaffolding Materials",
        products: [
            "Scaffolding Pipes", "Cuplock Systems", "Scaffolding Couplers", "Adjustable Props", "U Jacks", "Base Jacks",
            "Walkway Planks", "Ladder Beams", "Scaffolding Jali"
        ]
    },
    {
        category: "Shuttering Materials",
        products: [
            "Shuttering Plates", "Shuttering Plywood", "Formwork Systems", "Tie Rods", "Wing Nuts", "Water Stoppers",
            "Shuttering Oil"
        ]
    },

    // ==================================================================
    // 36. UNIFORMS & WORKWEAR
    // ==================================================================
    {
        category: "Uniforms",
        products: [
            "School Uniforms", "Corporate Uniforms", "Hospital Uniforms (Scrubs, Lab Coats)", "Hotel Uniforms (Chef Coats, Aprons)",
            "Security Guard Uniforms", "Industrial Uniforms (Boiler Suits, Coveralls)", "Housekeeping Uniforms",
            "Sports Uniforms", "Blazers & Waistcoats"
        ]
    },

    // ==================================================================
    // 37. HVAC & VENTILATION
    // ==================================================================
    {
        category: "HVAC Systems",
        products: [
            "Air Handling Units (AHU)", "Fan Coil Units (FCU)", "Ventilation Fans (Industrial Exhaust)", "Air Curtains",
            "Cooling Towers", "Ducting (GI, Fabric)", "Air Grilles & Diffusers", "Dampers", "HVAC Filters", "Cooling Pads",
            "Central AC Plants", "VRV/VRF Systems"
        ]
    },

    // ==================================================================
    // 38. LOCAL SERVICES (Competitors)
    // ==================================================================
    {
        category: "Daily Services",
        products: [
            "Housekeeping Services", "Pest Control", "Carpenters", "Plumbers", "Electricians",
            "Painters", "Laundry Services", "Tiffin Services", "Catering Services", "Event Organizers",
            "Maid Services", "Cooks", "Drivers on Call", "Water Tank Cleaning", "Sofa Cleaning"
        ]
    },
    {
        category: "Health & Wellness Services",
        products: [
            "General Physicians", "Dentists", "Dermatologists", "Gyms", "Yoga Classes",
            "Diagnostic Centres", "Hospitals", "Nursing Homes", "Ayurvedic Clinics",
            "Physiotherapists", "Homeopathy Doctors", "Dietitians", "Meditation Centres"
        ]
    },
    {
        category: "Transport & Logistics Services",
        products: [
            "Packers and Movers", "Transporters", "Courier Services", "Taxi Services",
            "Tempo Services", "Car Rental", "Warehouse Services", "Bus Rental", "Cold Chain Logistics",
            "International Courier", "Custom Clearing Agents"
        ]
    },
    {
        category: "Repairs & Maintenance Services",
        products: [
            "AC Repair", "Mobile Phone Repair", "Laptop Repair", "Car Repair Garages",
            "Bike Service Centers", "Washing Machine Repair", "TV Repair", "Refrigerator Repair",
            "Microwave Repair", "RO Water Purifier Repair", "Inverter Battery Repair"
        ]
    },
    {
        category: "Contractors & Consultants",
        products: [
            "Civil Contractors", "Interior Designers", "Architects", "CA & Tax Consultants",
            "Legal Consultants", "Security Guards", "Manpower Supply", "Electrical Contractors",
            "Plumbing Contractors", "Painting Contractors", "Fabrication Contractors"
        ]
    },

    // ==================================================================
    // 39. TRAVEL & TOURISM (NEW)
    // ==================================================================
    {
        category: "Travel Agents & Tour Operators",
        products: [
            "Travel Agents", "Tour Operators", "International Tour Packages", "Domestic Tour Packages",
            "Honeymoon Packages", "Pilgrimage Tours", "Adventure Tours", "Educational Tours",
            "Visa Consultants", "Passport Agents", "Forex Agents", "Travel Insurance"
        ]
    },
    {
        category: "Ticketing & Rentals",
        products: [
            "Air Ticketing Agents", "Train Ticketing Agents", "Bus Ticketing Agents", "Car Rental Services",
            "Bus Rental Services", "Tempo Traveller on Rent", "Luxury Car Rental", "Self Drive Car Rental"
        ]
    },
    {
        category: "Accommodation",
        products: [
            "Hotels", "Resorts", "Guest Houses", "Homestays", "Service Apartments", "Budget Hotels",
            "Luxury Hotels", "Dharamshalas", "Hostels"
        ]
    },

    // ==================================================================
    // 40. EDUCATION & TRAINING (NEW)
    // ==================================================================
    {
        category: "Schools & Colleges",
        products: [
            "Play Schools", "Nursery Schools", "CBSE Schools", "ICSE Schools", "International Schools",
            "Engineering Colleges", "Medical Colleges", "Management Colleges (MBA)", "Arts & Science Colleges",
            "Pharmacy Colleges", "Law Colleges"
        ]
    },
    {
        category: "Coaching & Training",
        products: [
            "Coaching Classes (School)", "IIT JEE Coaching", "NEET Coaching", "UPSC Coaching", "Bank Exam Coaching",
            "Computer Training Institutes", "Spoken English Classes", "Foreign Language Classes",
            "Digital Marketing Courses", "Software Training (Java, Python)", "Vocational Training Centers",
            "Fashion Designing Institutes", "Interior Designing Institutes"
        ]
    },
    {
        category: "Hobbies & Arts",
        products: [
            "Dance Classes", "Music Classes", "Painting Classes", "Cooking Classes", "Acting Schools",
            "Martial Arts Classes", "Swimming Classes", "Driving Schools"
        ]
    },

    // ==================================================================
    // 41. REAL ESTATE & RENTALS (NEW)
    // ==================================================================
    {
        category: "Real Estate Agents",
        products: [
            "Real Estate Agents (Residential)", "Real Estate Agents (Commercial)", "Property Dealers",
            "Real Estate Developers", "Builders", "Housing Projects", "Industrial Land Agents",
            "Agricultural Land Agents"
        ]
    },
    {
        category: "Properties for Rent/Sale",
        products: [
            "Flats for Rent", "Flats for Sale", "Houses for Rent", "Houses for Sale",
            "Office Space for Rent", "Shops for Rent", "Warehouses for Rent", "Paying Guest (PG)",
            "Hostels for Men", "Hostels for Women"
        ]
    },

    // ==================================================================
    // 42. FINANCIAL & LEGAL SERVICES (NEW)
    // ==================================================================
    {
        category: "Financial Services",
        products: [
            "Chartered Accountants (CA)", "Tax Consultants", "GST Consultants", "Company Registration Consultants",
            "Personal Loans", "Home Loans", "Business Loans", "Car Loans", "Mortgage Loans",
            "Insurance Agents (Life)", "Insurance Agents (Health)", "Insurance Agents (Car)",
            "Investment Consultants", "Stock Brokers", "Mutual Fund Agents"
        ]
    },
    {
        category: "Legal Services",
        products: [
            "Lawyers", "Advocates", "Notary Public", "Property Lawyers", "Divorce Lawyers",
            "Criminal Lawyers", "Corporate Lawyers", "Labor Law Consultants", "Visa Consultants"
        ]
    },

    // ==================================================================
    // 43. IT & DIGITAL SERVICES (NEW)
    // ==================================================================
    {
        category: "IT Services",
        products: [
            "Web Design Services", "Web Development", "Software Development", "Mobile App Development",
            "SEO Services (Search Engine Optimization)", "Digital Marketing Services", "Social Media Marketing",
            "Bulk SMS Services", "Graphic Designers", "Logo Designers", "Content Writers"
        ]
    },
    {
        category: "Computer Hardware & Support",
        products: [
            "Computer Repair Services", "Laptop Repair Services", "Printer Repair", "Data Recovery Services",
            "AMC Services (Computer)", "Networking Services", "CCTV Installation Services"
        ]
    },

    // ==================================================================
    // 44. EVENTS & WEDDINGS (NEW)
    // ==================================================================
    {
        category: "Wedding Services",
        products: [
            "Wedding Planners", "Banquet Halls", "Marriage Halls", "Party Lawns", "Tent Houses",
            "Wedding Decorators", "Florists", "Wedding Photographers", "Videographers",
            "Bridal Makeup Artists", "Mehendi Artists", "Wedding Bands", "DJ Services"
        ]
    },
    {
        category: "Corporate Events",
        products: [
            "Event Organizers", "Conference Venues", "Exhibition Stall Designers", "Corporate Gift Suppliers",
            "AV Equipment Rental", "Projector Rental"
        ]
    },

    // ==================================================================
    // 45. BEAUTY, SPA & WELLNESS (NEW)
    // ==================================================================
    {
        category: "Beauty Services",
        products: [
            "Beauty Parlours", "Salons (Unisex)", "Men's Salons", "Makeup Artists", "Hair Stylists",
            "Nail Art Studios", "Mehendi Artists", "Tattoo Artists"
        ]
    },
    // 46. PET & ANIMAL CARE (NEW)
    // ==================================================================
    {
        category: "Pet Shops & Supplies",
        products: [
            "Pet Shops", "Dog Food", "Cat Food", "Bird Food", "Fish Food (Aquarium)",
            "Pet Accessories (Collars, Leashes)", "Dog Cages", "Bird Cages", "Aquariums", "Aquarium Accessories"
        ]
    },
    {
        category: "Pet Services",
        products: [
            "Veterinary Doctors", "Pet Grooming Services", "Pet Boarding (Hostels)", "Dog Trainers",
            "Pet Clinics", "Dog Walkers", "Pet Adoption Centres"
        ]
    },

    // ==================================================================
    // 47. RENTAL & HIRING SERVICES (NEW)
    // ==================================================================
    {
        category: "Equipment Rental",
        products: [
            "Generators on Rent", "Construction Equipment on Rent (JCB, Cranes)", "Scaffolding on Rent",
            "Audio Visual Equipment on Rent", "Projectors on Rent", "Laptops on Rent", "Printers on Rent",
            "Medical Equipment on Rent (Hospital Beds, Oxygen)", "AC on Rent", "Coolers on Rent"
        ]
    },
    {
        category: "Costume & Furniture Rental",
        products: [
            "Fancy Dress Costumes on Rent", "Wedding Sherwanis on Rent", "Bridal Lehengas on Rent",
            "Furniture on Rent (Sofas, Beds)", "Office Furniture on Rent", "Tent House Services"
        ]
    },

    // ==================================================================
    // 48. MEDIA, ADVERTISING & MARKETING (NEW)
    // ==================================================================
    {
        category: "Advertising Agencies",
        products: [
            "Newspaper Ad Agencies", "Outdoor Advertising Agencies", "Digital Marketing Agencies",
            "Social Media Marketing", "TV Channel Advertising", "Radio Advertising Agencies",
            "Hoardings & Billboards", "Auto Rickshaw Branding"
        ]
    },
    {
        category: "Media & PR Services",
        products: [
            "Public Relations (PR) Agencies", "News Channels", "Production Houses", "Video Editing Services",
            "Voice Over Artists", "Model Coordinators", "Casting Agencies"
        ]
    },

    // ==================================================================
    // 49. DETECTIVE & SPECIALIZED SECURITY (NEW)
    // ==================================================================
    {
        category: "Detective Agencies",
        products: [
            "Private Detectives", "Corporate Investigators", "Matrimonial Detectives",
            "Forensic Experts", "Background Check Services"
        ]
    },
    {
        category: "Specialized Security",
        products: [
            "Bouncers", "Bodyguards", "Armed Security Guards", "Event Security",
            "Dog Squads", "Cash Van Services"
        ]
    },

    // ==================================================================
    // 50. WASTE MANAGEMENT & SCRAP (NEW)
    // ==================================================================
    {
        category: "Scrap Buyers",
        products: [
            "Kabadiwala (Scrap Dealers)", "Old Car Buyers", "Office Scrap Buyers", "Computer Scrap Buyers",
            "Battery Scrap Buyers", "Industrial Scrap Buyers", "Copper Scrap Buyers", "Iron Scrap Buyers",
            "E-Waste Recyclers"
        ]
    },

    // ==================================================================
    // 51. LABORATORIES & DIAGNOSTIC CENTERS (NEW)
    // ==================================================================
    {
        category: "Diagnostic Centers",
        products: [
            "Pathology Labs", "X-Ray Centres", "MRI Scan Centres", "CT Scan Centres",
            "Ultrasound Centres", "Blood Tests", "Urine Tests", "ECG Centres"
        ]
    },
    {
        category: "Industrial Testing Labs",
        products: [
            "Water Testing Labs", "Soil Testing Labs", "Food Testing Labs", "Material Testing Labs",
            "Gold Testing Centres", "Calibration Services"
        ]
    },

    // ==================================================================
    // 52. VOCATIONAL TRAINING INSTITUTES (NEW)
    // ==================================================================
    {
        category: "Technical Courses",
        products: [
            "Mobile Repairing Course", "Laptop Repairing Course", "AC Repairing Course",
            "Electrician Training", "Plumbing Training", "Welding Training", "CNC Machine Training"
        ]
    },
    {
        category: "Creative & Lifestyle Courses",
        products: [
            "Beautician Courses", "Makeup Artist Courses", "Tailoring Classes", "Fashion Designing Courses",
            "Jewelry Designing Courses", "Photography Courses", "Acting Schools", "Air Hostess Training"
        ]
    },

    // ==================================================================
    // 53. IMPORTERS & EXPORTERS (NEW)
    // ==================================================================
    {
        category: "Import Export",
        products: [
            "Export Consultants", "Import Consultants", "Custom House Agents (CHA)",
            "Freight Forwarders", "Shipping Companies", "Air Cargo Agents"
        ]
    },
    {
        category: "General Merchants",
        products: [
            "General Stores", "Departmental Stores", "Supermarkets", "Wholesale General Merchants",
            "Provision Stores"
        ]
    },

    // ==================================================================
    // 54. ENTERTAINMENT & RECREATION (NEW)
    // ==================================================================
    {
        category: "Entertainment Zones",
        products: [
            "Cinema Halls", "Multiplexes", "Gaming Zones", "Bowling Alleys", "Water Parks",
            "Amusement Parks", "Go Karting", "Escape Rooms", "Paintball"
        ]
    },
    {
        category: "Clubs & Recreation",
        products: [
            "Sports Clubs", "Swimming Pools", "Golf Courses", "Recreation Clubs",
            "Farm Houses for Party", "Night Clubs", "Pubs & Bars"
        ]
    },
    // 56. INDUSTRIAL FABRICATION & JOB WORK (NEW)
    // ==================================================================
    {
        category: "Fabrication Services",
        products: [
            "Steel Fabrication", "Aluminium Fabrication", "Sheet Metal Fabrication",
            "Shed Construction", "Gate & Grille Fabrication", "Laser Cutting Services",
            "CNC Machining Job Work", "Welding Job Work", "Turning & Lathe Work"
        ]
    },
    {
        category: "Industrial Job Work",
        products: [
            "Powder Coating Services", "Electroplating Services", "Galvanizing Services",
            "Heat Treatment Services", "Anodizing Services", "Buffing & Polishing Services",
            "Injection Moulding Job Work", "Casting Services"
        ]
    },

    // ==================================================================
    // 57. PRINTING & DESIGNING SERVICES (NEW)
    // ==================================================================
    {
        category: "Printing Services",
        products: [
            "Offset Printing", "Digital Printing", "Flex Printing", "Screen Printing",
            "Brochure Printing", "Visiting Card Printing", "Calendar Printing",
            "T-Shirt Printing", "Mug Printing", "3D Printing Services",
            "Book Printing", "Letterhead Printing"
        ]
    },
    {
        category: "Designing Services",
        products: [
            "Graphic Design", "Logo Design", "Packaging Design", "Catalog Design",
            "Website Design", "CAD Designing (2D/3D)", "Interior Designing"
        ]
    },

    // ==================================================================
    // 58. INDUSTRIAL REPAIR & MAINTENANCE (NEW)
    // ==================================================================
    {
        category: "Industrial Repair Services",
        products: [
            "Motor Rewinding Services", "Pump Repair Services", "Transformer Repair",
            "Generator Repair (DG Set)", "Hydraulic Cylinder Repair", "Compressor Repair",
            "Boiler Maintenance", "Chiller Repair", "PCB Repair Services"
        ]
    },
    {
        category: "Facility Management",
        products: [
            "Lift Maintenance", "Fire Safety Maintenance", "Building Maintenance",
            "Garden Maintenance", "Swimming Pool Maintenance", "Solar Panel Cleaning"
        ]
    },

    // ==================================================================
    // 59. SPECIALIZED CLEANING SERVICES (NEW)
    // ==================================================================
    {
        category: "Deep Cleaning Services",
        products: [
            "Water Tank Cleaning", "Sofa Cleaning", "Carpet Cleaning", "Facade Cleaning (Glass)",
            "Kitchen Duct Cleaning", "Chimney Cleaning", "Septic Tank Cleaning",
            "Post Construction Cleaning", "Sanitization Services"
        ]
    },

    // ==================================================================
    // 60. CIVIL & CONSTRUCTION SERVICES (NEW)
    // ==================================================================
    {
        category: "Civil Contractors",
        products: [
            "Civil Works", "Waterproofing Contractors", "Borewell Drilling",
            "Flooring Contractors", "False Ceiling Contractors", "Painting Contractors",
            "Road Construction", "Rainwater Harvesting", "Demolition Services"
        ]
    },

    // ==================================================================
    // 61. CERTIFICATION & LEGAL CONSULTANTS (NEW)
    // ==================================================================
    {
        category: "Business Consultants",
        products: [
            "ISO Certification Consultants", "Trademark Registration", "Copyright Consultants",
            "FSSAI Registration (Food License)", "GST Registration", "Company Incorporation",
            "Import Export Code (IEC) Consultants", "Pollution Control Board Consultants"
        ]
    },

    // ==================================================================
    // 62. PLACEMENT & HR SERVICES (NEW)
    // ==================================================================
    {
        category: "Recruitment Agencies",
        products: [
            "Placement Consultants", "Manpower Supply", "Security Guard Services",
            "Housekeeping Staff Supply", "Driver Supply", "Labor Contractors",
            "Overseas Placement", "HR Consultancy"
        ]
    },

    // ==================================================================
    // 63. INTERNET & CONNECTIVITY (NEW)
    // ==================================================================
    {
        category: "Internet Services",
        products: [
            "Broadband Services", "Leased Line Internet", "Wifi Installation",
            "Optical Fiber Splicing Services", "Network Cabling Services",
            "Cyber Security Services", "Cloud Hosting Services"
        ]
    },

    // ==================================================================
    // 64. ASTROLOGY & VASTU (NEW)
    // ==================================================================
    {
        category: "Spiritual Services",
        products: [
            "Astrologers", "Numerologists", "Vastu Consultants", "Palmists",
            "Tarot Card Readers", "Pandits for Puja", "Horoscope Matching"
        ]
    },

    // ==================================================================
    // 65. PACKERS & MOVERS (LOGISTICS) (NEW)
    // ==================================================================
    {
        category: "Logistics Services",
        products: [
            "Packers and Movers (Domestic)", "Packers and Movers (International)",
            "Car Carrier Services", "Bike Transport Services", "Warehouse Storage",
            "Office Relocation Services", "Pet Relocation Services"
        ]
    },
    // ... paste after the closing brace of Category 65 ...

    // ==================================================================
    // 66. SECOND HAND & USED GOODS (NEW)
    // ==================================================================
    {
        category: "Used Industrial Machinery",
        products: [
            "Used Lathe Machines", "Used CNC Machines", "Second Hand Generators",
            "Used Injection Moulding Machines", "Used Textile Machinery",
            "Used Printing Machines", "Used Air Compressors", "Used Excavators"
        ]
    },
    {
        category: "Second Hand Vehicles & Electronics",
        products: [
            "Used Cars", "Second Hand Bikes", "Used Laptops", "Refurbished Mobiles",
            "Used Office Furniture", "Second Hand ACs", "Scrap Vehicles",
            "Second Hand Restaurant Equipment"
        ]
    },

    // ==================================================================
    // 67. MODULAR KITCHEN & INTERIORS (NEW)
    // ==================================================================
    {
        category: "Interior Products",
        products: [
            "Modular Kitchens", "Modular Wardrobes", "TV Units", "Shoe Racks",
            "PVC Wall Panels", "3D Wallpapers", "False Ceiling Materials (Gypsum/POP)",
            "Wooden Flooring", "Vinyl Flooring", "Artificial Grass", "Window Blinds"
        ]
    },
    {
        category: "Interior Services",
        products: [
            "False Ceiling Contractors", "Kitchen Renovation Services",
            "Bathroom Renovation Services", "Furniture Polishing Services",
            "Sofa Repair & Re-upholstery", "Tile Laying Contractors"
        ]
    },

    // ==================================================================
    // 68. WATERPROOFING & ROOFING (NEW)
    // ==================================================================
    {
        category: "Waterproofing",
        products: [
            "Waterproofing Chemicals", "Roof Waterproofing Services",
            "Basement Waterproofing", "Water Tank Waterproofing",
            "Bitumen Sheets", "Dr. Fixit Products", "Epoxy Grouting"
        ]
    },
    {
        category: "Roofing Systems",
        products: [
            "Polycarbonate Sheets", "Fiber Sheets", "Metal Roofing Sheets (Color Coated)",
            "Mangalore Tiles", "Ceramic Roof Tiles", "Shed Construction Services",
            "Turbo Ventilators"
        ]
    },

    // ==================================================================
    // 69. PUMPS, MOTORS & VALVES (NEW)
    // ==================================================================
    {
        category: "Industrial Pumps",
        products: [
            "Submersible Pumps", "Centrifugal Pumps", "Monoblock Pumps",
            "Sewage Pumps", "Slurry Pumps", "Chemical Pumps", "Dosing Pumps",
            "High Pressure Pumps", "Fire Fighting Pumps", "Borewell Pumps"
        ]
    },
    {
        category: "Motors & Valves",
        products: [
            "Induction Motors", "Single Phase Motors", "Three Phase Motors",
            "Butterfly Valves", "Ball Valves", "Gate Valves", "Check Valves",
            "Solenoid Valves", "Safety Valves", "Control Valves"
        ]
    },

    // ==================================================================
    // 70. CRANES & MATERIAL HANDLING (NEW)
    // ==================================================================
    {
        category: "Lifting Equipment",
        products: [
            "EOT Cranes", "Hydraulic Cranes", "Chain Pulley Blocks",
            "Electric Hoists", "Wire Rope Hoists", "Goods Lifts",
            "Hydraulic Pallet Trucks", "Stackers", "Winches", "Hydraulic Tables"
        ]
    },

    // ==================================================================
    // 71. WEIGHING & MEASURING SYSTEMS (NEW)
    // ==================================================================
    {
        category: "Weighing Scales",
        products: [
            "Electronic Weighing Scales", "Platform Scales", "Jewellery Scales",
            "Kitchen Scales", "Crane Scales", "Weighbridges",
            "Truck Scales", "Counting Scales", "Load Cells"
        ]
    },

    // ==================================================================
    // 72. GLASS, ALUMINIUM & FABRICATION (NEW)
    // ==================================================================
    {
        category: "Glass Work",
        products: [
            "Toughened Glass Work", "Glass Partitions", "Shower Cubicles",
            "Glass Railings", "Mirrors (LED/Decorative)", "Automotive Glass",
            "Glass Etching Services"
        ]
    },
    {
        category: "Aluminium & Steel Work",
        products: [
            "Aluminium Windows", "Aluminium Doors", "Aluminium Partitions",
            "SS Railings (Stainless Steel)", "MS Grills", "Collapsible Gates",
            "Rolling Shutters", "Automatic Doors"
        ]
    },

    // ==================================================================
    // 73. SOLAR & POWER BACKUP SERVICES (NEW)
    // ==================================================================
    {
        category: "Solar Services",
        products: [
            "Rooftop Solar Installation", "Solar Panel Cleaning Services",
            "Solar Street Light Installation", "Solar Water Heater Installation",
            "On-Grid Solar Systems", "Off-Grid Solar Systems"
        ]
    },
    {
        category: "Power Backup Services",
        products: [
            "Inverter Repair", "UPS Repair", "Generator AMC Services",
            "Battery Charging Services", "Servo Stabilizer Repair"
        ]
    },

    // ==================================================================
    // 74. BOREWELL & DRILLING (NEW)
    // ==================================================================
    {
        category: "Drilling Services",
        products: [
            "Borewell Drilling Contractors", "Tubewell Drilling",
            "Piling Contractors", "Soil Testing Services",
            "Submersible Pump Installation", "Rainwater Harvesting Pits"
        ]
    },

    // ==================================================================
    // 75. COLD STORAGE & WAREHOUSING (NEW)
    // ==================================================================
    {
        category: "Storage Services",
        products: [
            "Cold Storage Services", "Warehouse for Rent",
            "Document Storage Services", "Household Goods Storage",
            "Industrial Sheds for Rent", "Frozen Food Storage"
        ]
    },
    // 76. FIRE FIGHTING & SAFETY SYSTEMS (NEW)
    // ==================================================================
    {
        category: "Fire Safety Equipment",
        products: [
            "Fire Extinguishers (ABC, CO2)", "Fire Hydrant Systems", "Fire Sprinkler Systems",
            "Fire Alarms", "Smoke Detectors", "Fire Hose Reels", "Emergency Exit Lights",
            "Fire Safety Suits", "Breathing Apparatus"
        ]
    },
    {
        category: "Fire Safety Services",
        products: [
            "Fire Safety Audit Services", "Fire Extinguisher Refilling",
            "Fire NOC Consultants", "Fire Training Services"
        ]
    },

    // ==================================================================
    // 77. MINING & GEOLOGY SERVICES (NEW)
    // ==================================================================
    {
        category: "Mining Services",
        products: [
            "Mining Contractors", "Blasting Services", "Rock Breaking Services",
            "Mining Survey Services", "Geological Survey Services",
            "Stone Crushing Services"
        ]
    },
    {
        category: "Mining Equipment",
        products: [
            "Rock Breakers", "Jack Hammers", "Drilling Rigs",
            "Conveyor Belts (Mining)", "Vibrating Screens", "Jaw Crushers"
        ]
    },

    // ==================================================================
    // 78. DAIRY & FOOD PLANT PROJECTS (NEW)
    // ==================================================================
    {
        category: "Dairy Plant Machinery",
        products: [
            "Milking Machines", "Bulk Milk Coolers (BMC)", "Milk Pasteurizers",
            "Cream Separators", "Ghee Making Machines", "Paneer Press Machines",
            "Milk Packaging Machines", "Khoya Making Machines"
        ]
    },

    // ==================================================================
    // 79. LANDSCAPING & HORTICULTURE (NEW)
    // ==================================================================
    {
        category: "Landscaping Services",
        products: [
            "Landscape Architects", "Garden Maintenance Services", "Vertical Garden Services",
            "Terrace Garden Services", "Nursery Plants Suppliers", "Grass Carpet Installation"
        ]
    },

    // ==================================================================
    // 80. STUDIO, AUDIO & VIDEO EQUIPMENT (NEW)
    // ==================================================================
    {
        category: "Studio Equipment",
        products: [
            "DSLR Cameras", "Studio Lights (Softbox, Ring Light)", "Green Screens",
            "Microphones (Condenser, Lapel)", "Audio Mixers", "Tripods & Gimbals",
            "Podcast Equipment", "Video Editing Consoles"
        ]
    },

    // ==================================================================
    // 81. INDUSTRIAL GASES & CYLINDERS (NEW)
    // ==================================================================
    {
        category: "Industrial Gases",
        products: [
            "Oxygen Cylinders", "Nitrogen Gas", "Argon Gas", "Acetylene Gas",
            "Carbon Dioxide (CO2) Gas", "Helium Gas", "Refrigerant Gases (Freon)"
        ]
    },

    // ==================================================================
    // 82. TENTS, TARPAULINS & CANOPIES (NEW)
    // ==================================================================
    {
        category: "Covering Materials",
        products: [
            "HDPE Tarpaulins", "PVC Tarpaulins", "Canvas Tarpaulins", "Truck Covers",
            "Pond Liners", "Agro Shade Nets", "Greenhouse Films",
            "Gazebo Tents", "Exhibition Tents"
        ]
    },

    // ==================================================================
    // 83. COSMETIC & PHARMA MACHINERY (NEW)
    // ==================================================================
    {
        category: "Manufacturing Machinery",
        products: [
            "Cream Filling Machines", "Tube Filling Machines", "Labeling Machines (Sticker)",
            "Bottle Capping Machines", "Soap Making Machines", "Shampoo Making Machines",
            "Detergent Making Machines"
        ]
    },

    // ==================================================================
    // 84. STATUES, SCULPTURES & TEMPLES (NEW)
    // ==================================================================
    {
        category: "Statues & Idols",
        products: [
            "Marble Statues", "Brass Statues", "Fiberglass Statues", "Stone Sculptures",
            "Bronze Statues", "Temple Construction Services", "Marble Temples"
        ]
    },

    // ==================================================================
    // 85. MOSQUITO NETS & BLINDS (NEW)
    // ==================================================================
    {
        category: "Screening Solutions",
        products: [
            "Mosquito Nets for Windows (Velcro)", "Pleated Mosquito Nets",
            "Roller Blinds", "Zebra Blinds", "Vertical Blinds", "Chick Blinds (Bamboo)",
            "PVC Curtains", "Bird Nets for Balcony"
        ]
    },

    // ==================================================================
    // 55. SOCIAL & NGO SERVICES (NEW)
    // ==================================================================
    {
        category: "Social Services",
        products: [
            "NGOs", "Charitable Trusts", "Old Age Homes", "Orphanages", "Rehabilitation Centres",
            "Blood Banks", "Eye Banks", "Ambulance Services (Free/Paid)"
        ]
    },

    {
        category: "Wellness Centers",
        products: [
            "Spa Centers", "Massage Centers", "Skin Care Clinics", "Hair Transplant Clinics",
            "Weight Loss Centers", "Slimming Centers", "Yoga Centers", "Meditation Centers"
        ]
    }
];

// 2. THE MULTIPLIER (Keyword Permutations)
// This turns 1 keyword into ~8-10 variations.
const generateVariations = (baseList: string[]): string[] => {
    const modifiers = [
        "Wholesaler", 
        "Manufacturer", 
        "Supplier", 
        "Dealer", 
        "Distributor", 
        "Shop", 
        "Store", 
        "Price List", // Targets users looking for rates
        "Near Me",     // Targets hyper-local intent
        "Service",
        "Agent",
        "Company"
    ];
    
    const variations: string[] = [];

    baseList.forEach(item => {
        // 1. Add the original exact match keyword
        variations.push(item);
        
        // 2. Add Modifier variations
        modifiers.forEach(mod => {
            variations.push(`${item} ${mod}`);
        });
    });
    
    return variations;
};

// 3. FLATTEN HELPER
// Extracts all products/services from the categorized structure into one massive list
const getAllBaseKeywords = (): string[] => {
    let allItems: string[] = [];
    industrialProducts.forEach(category => {
        allItems = [...allItems, ...category.products];
    });
    return allItems;
};

// 4. EXPORT COMBINED KEYWORDS
// Combine logic: Flatten categories -> Explode variations
export const ALL_KEYWORDS: string[] = generateVariations(getAllBaseKeywords());

// Helper to get total count for verification
export const getKeywordCount = (): number => {
    return ALL_KEYWORDS.length;
};

console.log(`Keyword Engine Loaded. Total Keywords generated: ${getKeywordCount()}`);