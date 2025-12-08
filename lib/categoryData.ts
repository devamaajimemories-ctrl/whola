export const categoryData: Record<string, { title: string; subCategories: string[] }> = {
    // Top Categories
    "electronics-gadgets": {
        title: "Electronics & Gadgets",
        subCategories: [
            "Mobile Phones", "Smartphones", "Feature Phones", "Refurbished Phones",
            "Laptops", "Gaming Laptops", "Ultrabooks", "MacBooks",
            "Accessories", "Headphones", "Chargers", "Power Banks", "Phone Cases",
            "Cameras", "DSLR", "Mirrorless", "Action Cameras", "Drones",
            "Smart Watches", "Fitness Bands", "VR Headsets"
        ]
    },
    "apparel-fashion": {
        title: "Apparel & Fashion",
        subCategories: [
            "Men's Wear", "Shirts", "T-Shirts", "Jeans", "Trousers", "Suits",
            "Women's Wear", "Dresses", "Kurtis", "Sarees", "Lehengas", "Tops",
            "Kids' Wear", "Boys Clothing", "Girls Clothing", "Infant Wear",
            "Footwear", "Men's Shoes", "Women's Shoes", "Sports Shoes",
            "Fashion Accessories", "Belts", "Wallets", "Handbags", "Sunglasses"
        ]
    },
    "industrial-machinery": {
        title: "Industrial Machinery",
        subCategories: [
            "CNC Machines", "Lathe Machines", "Milling Machines", "Drilling Machines",
            "Pumps", "Centrifugal Pumps", "Submersible Pumps", "Vacuum Pumps",
            "Textile Machinery", "Spinning Machines", "Weaving Machines",
            "Food Processing Machinery", "Packaging Machines", "Filling Machines",
            "Construction Machinery", "Excavators", "Cranes", "Bulldozers"
        ]
    },
    "home-supplies": {
        title: "Home Supplies",
        subCategories: [
            "Kitchenware", "Cookware", "Dinnerware", "Cutlery", "Storage Containers",
            "Home Decor", "Wall Art", "Vases", "Clocks", "Mirrors",
            "Furnishings", "Curtains", "Bed Sheets", "Cushions", "Rugs",
            "Cleaning Supplies", "Mops", "Brooms", "Detergents", "Vacuum Cleaners",
            "Garden Supplies", "Planters", "Seeds", "Garden Tools"
        ]
    },
    "automotive": {
        title: "Automotive",
        subCategories: [
            "Car Parts", "Engine Parts", "Brake Systems", "Suspension", "Filters",
            "Bike Parts", "Tyres", "Batteries", "Helmets",
            "Accessories", "Car Covers", "Seat Covers", "Car Mats", "Audio Systems",
            "Lubricants", "Engine Oil", "Grease", "Coolants",
            "Vehicles", "Electric Scooters", "E-Rickshaws", "Bicycles"
        ]
    },
    "electrical-supplies": {
        title: "Electrical Supplies",
        subCategories: [
            "Wires & Cables", "Copper Wires", "Fiber Optic Cables",
            "Switches & Sockets", "Modular Switches", "Power Strips",
            "Lighting", "LED Bulbs", "Tube Lights", "Chandeliers", "Street Lights",
            "Circuit Breakers", "MCB", "MCCB", "Fuse",
            "Power Distribution", "Transformers", "Inverters", "Stabilizers"
        ]
    },
    "gifts-crafts": {
        title: "Gifts & Crafts",
        subCategories: [
            "Corporate Gifts", "Diaries", "Pens", "Trophies", "Mugs",
            "Handicrafts", "Wooden Crafts", "Metal Crafts", "Pottery",
            "Toys", "Educational Toys", "Soft Toys", "Board Games",
            "Festival Decor", "Diwali Lights", "Christmas Ornaments", "Rangoli",
            "Personalized Gifts", "Photo Frames", "Keychains"
        ]
    },
    "business-services": {
        title: "Business Services",
        subCategories: [
            "Logistics", "Freight Forwarding", "Warehousing", "Courier Services",
            "Consulting", "Management Consulting", "HR Consulting", "IT Consulting",
            "Marketing", "Digital Marketing", "SEO Services", "Advertising",
            "Financial Services", "Accounting", "Taxation", "Loans",
            "Printing Services", "Brochures", "Business Cards", "Banners"
        ]
    },
    "computer-it": {
        title: "Computer & IT",
        subCategories: [
            "Software", "ERP Software", "Antivirus", "Accounting Software",
            "Hardware", "Motherboards", "Processors", "RAM", "Hard Drives",
            "Networking", "Routers", "Switches", "Cables", "Modems",
            "Peripherals", "Printers", "Scanners", "Monitors", "Keyboards",
            "IT Services", "Web Development", "App Development", "Cloud Services"
        ]
    },
    "global-trade": {
        title: "Global Trade",
        subCategories: [
            "Import/Export Services", "Customs Clearance", "Freight Booking",
            "Shipping", "Sea Freight", "Air Freight", "Cargo Containers",
            "Trade Consultants", "Market Research", "Compliance Services"
        ]
    },
    "agriculture": {
        title: "Agriculture",
        subCategories: [
            "Seeds", "Vegetable Seeds", "Fruit Seeds", "Grain Seeds",
            "Fertilizers", "Organic Fertilizers", "Chemical Fertilizers", "Pesticides",
            "Farm Machinery", "Tractors", "Harvesters", "Ploughs",
            "Irrigation", "Drip Irrigation", "Sprinklers", "Pumps",
            "Animal Husbandry", "Poultry Feed", "Cattle Feed"
        ]
    },
    "food-beverages": {
        title: "Food & Beverages",
        subCategories: [
            "Spices", "Whole Spices", "Powdered Spices", "Blended Spices",
            "Grains", "Rice", "Wheat", "Pulses",
            "Processed Food", "Pickles", "Jams", "Sauces", "Snacks",
            "Beverages", "Tea", "Coffee", "Juices", "Soft Drinks",
            "Dairy Products", "Milk", "Cheese", "Butter", "Ghee"
        ]
    },
    "chemicals": {
        title: "Chemicals",
        subCategories: [
            "Industrial Chemicals", "Acids", "Solvents", "Polymers",
            "Agrochemicals", "Insecticides", "Fungicides", "Herbicides",
            "Dyes & Pigments", "Textile Dyes", "Food Colors", "Inks",
            "Lab Chemicals", "Reagents", "Indicators",
            "Cleaning Chemicals", "Floor Cleaners", "Toilet Cleaners"
        ]
    },
    "industrial-supplies": {
        title: "Industrial Supplies",
        subCategories: [
            "Safety Gear", "Helmets", "Gloves", "Safety Shoes", "Goggles",
            "Tools", "Hand Tools", "Power Tools", "Cutting Tools",
            "Fasteners", "Nuts", "Bolts", "Screws", "Washers",
            "Abrasives", "Grinding Wheels", "Sandpaper",
            "Adhesives", "Industrial Glues", "Sealants", "Tapes"
        ]
    },
    "construction": {
        title: "Construction",
        subCategories: [
            "Building Materials", "Cement", "Bricks", "Sand", "Aggregates",
            "Steel", "TMT Bars", "Steel Pipes", "Sheets",
            "Plumbing", "Pipes", "Fittings", "Taps", "Sanitary Ware",
            "Flooring", "Tiles", "Marbles", "Granite", "Wooden Flooring",
            "Paints", "Wall Paints", "Primers", "Putty"
        ]
    },
    "furniture": {
        title: "Furniture",
        subCategories: [
            "Office Furniture", "Desks", "Chairs", "Cabinets", "Workstations",
            "Home Furniture", "Sofas", "Beds", "Dining Tables", "Wardrobes",
            "Outdoor Furniture", "Garden Chairs", "Swings",
            "School Furniture", "Desks", "Benches",
            "Hospital Furniture", "Hospital Beds", "Trolleys"
        ]
    },
    "health-beauty": {
        title: "Health & Beauty",
        subCategories: [
            "Cosmetics", "Makeup", "Skincare", "Haircare", "Perfumes",
            "Supplements", "Vitamins", "Protein Powders", "Herbal Supplements",
            "Medical Equipment", "BP Monitors", "Thermometers", "Wheelchairs",
            "Personal Care", "Soaps", "Shampoos", "Lotions", "Toothpaste",
            "Ayurvedic Products", "Oils", "Powders", "Tablets"
        ]
    },
    "tools-hardware": {
        title: "Tools & Hardware",
        subCategories: [
            "Hand Tools", "Hammers", "Screwdrivers", "Wrenches", "Pliers",
            "Power Tools", "Drills", "Grinders", "Saws", "Sanders",
            "Hardware", "Door Handles", "Hinges", "Locks", "Knobs",
            "Garden Tools", "Shovels", "Rakes", "Pruners",
            "Measuring Tools", "Tapes", "Levels", "Calipers"
        ]
    },
    // New Categories for Housing & Map Services
    "real-estate": {
        title: "Real Estate & Rentals",
        subCategories: [
            "Residential Rentals", "Apartments", "Independent Houses", "Villas", "Studio Apartments",
            "Commercial Rentals", "Office Spaces", "Shops", "Warehouses", "Showrooms",
            "Accommodation", "PG", "Hostels", "Service Apartments", "Guest Houses",
            "Land & Plots", "Agricultural Land", "Commercial Plots", "Residential Plots",
            "Property Services", "Real Estate Agents", "Property Management", "Tenant Verification"
        ]
    },
    "local-services": {
        title: "Local Services & Businesses",
        subCategories: [
            "Food & Dining", "Sweet Shops", "Restaurants", "Cafes", "Bakeries", "Catering Services",
            "Daily Needs", "Grocery Stores", "Supermarkets", "Vegetable Markets", "Dairy Booths",
            "Personal Care", "Salons", "Spas", "Gyms", "Yoga Centers", "Beauty Parlours",
            "Repairs & Services", "Plumbers", "Electricians", "Carpenters", "Mechanics", "AC Repair",
            "Health & Wellness", "Pharmacies", "Clinics", "Diagnostic Labs", "Veterinary Clinics",
            "Other Services", "Laundry", "Dry Cleaners", "Photo Studios", "Internet Cafes", "Printing Shops"
        ]
    },

    // Trending Categories
    "room-heater": {
        title: "Room Heater",
        subCategories: ["Oil Heaters", "Fan Heaters", "Gas Heaters", "Halogen Heaters", "Infrared Heaters"]
    },
    "electric-kettle": {
        title: "Electric Kettle",
        subCategories: ["Glass Kettles", "Steel Kettles", "Travel Kettles", "Cordless Kettles"]
    },
    "body-lotion": {
        title: "Body Lotion",
        subCategories: ["Moisturizers", "Sunscreen", "Body Butter", "Aloe Vera Gel", "Cocoa Butter"]
    },
    "duvets-comforters": {
        title: "Duvets & Comforters",
        subCategories: ["Single Duvets", "Double Duvets", "Down Comforters", "Microfiber Duvets"]
    },
    "winter-jackets": {
        title: "Winter Jackets",
        subCategories: ["Leather Jackets", "Puffer Jackets", "Parkas", "Bomber Jackets", "Denim Jackets"]
    },
    "essential-oil": {
        title: "Essential Oil",
        subCategories: ["Lavender Oil", "Tea Tree Oil", "Peppermint Oil", "Eucalyptus Oil", "Lemon Oil"]
    },
    "sweater": {
        title: "Sweater",
        subCategories: ["Woolen Sweaters", "Cardigans", "Pullovers", "Cashmere Sweaters", "Turtlenecks"]
    },
    "industrial-heaters": {
        title: "Industrial Heaters",
        subCategories: ["Band Heaters", "Cartridge Heaters", "Coil Heaters", "Immersion Heaters"]
    },
    "blankets": {
        title: "Blankets",
        subCategories: ["Fleece Blankets", "Wool Blankets", "Electric Blankets", "Weighted Blankets"]
    },
    "christmas-decorations": {
        title: "Christmas Decorations",
        subCategories: ["Ornaments", "Lights", "Trees", "Wreaths", "Stockings"]
    },
    "ayurvedic-powders": {
        title: "Ayurvedic Powders",
        subCategories: ["Triphala", "Ashwagandha", "Neem Powder", "Amla Powder", "Brahmi"]
    },
    "water-heaters": {
        title: "Water Heaters",
        subCategories: ["Geysers", "Solar Heaters", "Instant Heaters", "Gas Geysers"]
    },
    "winter-wear": {
        title: "Winter Wear",
        subCategories: ["Thermals", "Gloves", "Beanies", "Scarves", "Socks"]
    },
    "dry-fruits": {
        title: "Dry Fruits",
        subCategories: ["Almonds", "Cashews", "Walnuts", "Pistachios", "Raisins"]
    },
    "air-purifiers": {
        title: "Air Purifiers",
        subCategories: ["HEPA Filters", "Ionic Purifiers", "Car Purifiers", "Humidifiers"]
    }
};