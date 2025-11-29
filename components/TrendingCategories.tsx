"use client";

import React from "react";
import {
    Flame,
    Coffee,
    Droplet,
    Bed,
    Shirt,
    Pipette,
    Factory,
    Layers,
    Star,
    Leaf,
    Thermometer,
    Snowflake,
    Nut,
    Wind
} from "lucide-react";
import Link from "next/link";

const trendingItems = [
    {
        name: "Room Heater",
        slug: "room-heater",
        icon: Flame,
        color: "bg-orange-100 text-orange-600",
        items: ["Oil Heaters", "Fan Heaters", "Gas Heaters"]
    },
    {
        name: "Electric Kettle",
        slug: "electric-kettle",
        icon: Coffee,
        color: "bg-gray-100 text-gray-600",
        items: ["Glass Kettles", "Steel Kettles", "Travel Kettles"]
    },
    {
        name: "Body Lotion",
        slug: "body-lotion",
        icon: Droplet,
        color: "bg-pink-100 text-pink-600",
        items: ["Moisturizers", "Sunscreen", "Body Butter"]
    },
    {
        name: "Duvets & Comforters",
        slug: "duvets-comforters",
        icon: Bed,
        color: "bg-blue-100 text-blue-600",
        items: ["Single Duvets", "Double Duvets", "Down Comforters"]
    },
    {
        name: "Winter Jackets",
        slug: "winter-jackets",
        icon: Shirt,
        color: "bg-indigo-100 text-indigo-600",
        items: ["Leather Jackets", "Puffer Jackets", "Parkas"]
    },
    {
        name: "Essential Oil",
        slug: "essential-oil",
        icon: Pipette,
        color: "bg-green-100 text-green-600",
        items: ["Lavender Oil", "Tea Tree Oil", "Peppermint Oil"]
    },
    {
        name: "Sweater",
        slug: "sweater",
        icon: Shirt,
        color: "bg-red-100 text-red-600",
        items: ["Woolen Sweaters", "Cardigans", "Pullovers"]
    },
    {
        name: "Industrial Heaters",
        slug: "industrial-heaters",
        icon: Factory,
        color: "bg-slate-100 text-slate-600",
        items: ["Band Heaters", "Cartridge Heaters", "Coil Heaters"]
    },
    {
        name: "Blankets",
        slug: "blankets",
        icon: Layers,
        color: "bg-purple-100 text-purple-600",
        items: ["Fleece Blankets", "Wool Blankets", "Electric Blankets"]
    },
    {
        name: "Christmas Decorations",
        slug: "christmas-decorations",
        icon: Star,
        color: "bg-yellow-100 text-yellow-600",
        items: ["Ornaments", "Lights", "Trees"]
    },
    {
        name: "Ayurvedic Powders",
        slug: "ayurvedic-powders",
        icon: Leaf,
        color: "bg-emerald-100 text-emerald-600",
        items: ["Triphala", "Ashwagandha", "Neem Powder"]
    },
    {
        name: "Water Heaters",
        slug: "water-heaters",
        icon: Thermometer,
        color: "bg-cyan-100 text-cyan-600",
        items: ["Geysers", "Solar Heaters", "Instant Heaters"]
    },
    {
        name: "Winter Wear",
        slug: "winter-wear",
        icon: Snowflake,
        color: "bg-sky-100 text-sky-600",
        items: ["Thermals", "Gloves", "Beanies"]
    },
    {
        name: "Dry Fruits",
        slug: "dry-fruits",
        icon: Nut,
        color: "bg-amber-100 text-amber-600",
        items: ["Almonds", "Cashews", "Walnuts"]
    },
    {
        name: "Air Purifiers",
        slug: "air-purifiers",
        icon: Wind,
        color: "bg-teal-100 text-teal-600",
        items: ["HEPA Filters", "Ionic Purifiers", "Car Purifiers"]
    },
];

const TrendingCategories = () => {
    return (
        <section className="py-12 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Trending Categories</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {trendingItems.map((item, index) => (
                        <Link
                            key={index}
                            href={`/category/${item.slug}`}
                            className="group flex flex-col items-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white h-full"
                        >
                            <div className={`p-4 rounded-full mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={32} />
                            </div>
                            <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center text-sm mb-3">
                                {item.name}
                            </h3>

                            {/* Sub-items List */}
                            <div className="w-full border-t border-gray-100 pt-3 mt-auto">
                                <ul className="text-center space-y-1">
                                    {item.items.map((subItem, i) => (
                                        <li key={i} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                            <span className="block">{subItem}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingCategories;
