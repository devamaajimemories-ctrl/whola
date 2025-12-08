"use client";

import React from "react";
import {
    Smartphone,
    Shirt,
    Settings,
    Home,
    Truck,
    Zap,
    Gift,
    Briefcase,
    Cpu,
    Globe,
    Sprout,
    Utensils,
    FlaskConical,
    Factory,
    Building2,
    Armchair,
    Heart,
    Hammer,
    Key,     // Added for Real Estate
    MapPin   // Added for Local Services
} from "lucide-react";
import Link from "next/link";

const categories = [
    {
        name: "Electronics & Gadgets",
        slug: "electronics-gadgets",
        icon: Smartphone,
        color: "bg-blue-100 text-blue-600",
        items: ["Mobile Phones", "Laptops", "Accessories"]
    },
    {
        name: "Apparel & Fashion",
        slug: "apparel-fashion",
        icon: Shirt,
        color: "bg-pink-100 text-pink-600",
        items: ["Men's Wear", "Women's Wear", "Kids' Wear"]
    },
    {
        name: "Industrial Machinery",
        slug: "industrial-machinery",
        icon: Settings,
        color: "bg-orange-100 text-orange-600",
        items: ["CNC Machines", "Pumps", "Lathe Machines"]
    },
    {
        name: "Home Supplies",
        slug: "home-supplies",
        icon: Home,
        color: "bg-green-100 text-green-600",
        items: ["Kitchenware", "Decor", "Furnishings"]
    },
    {
        name: "Automotive",
        slug: "automotive",
        icon: Truck,
        color: "bg-red-100 text-red-600",
        items: ["Car Parts", "Bikes", "Accessories"]
    },
    {
        name: "Electrical Supplies",
        slug: "electrical-supplies",
        icon: Zap,
        color: "bg-yellow-100 text-yellow-600",
        items: ["Wires", "Switches", "Panels"]
    },
    {
        name: "Gifts & Crafts",
        slug: "gifts-crafts",
        icon: Gift,
        color: "bg-purple-100 text-purple-600",
        items: ["Corporate Gifts", "Handicrafts", "Toys"]
    },
    {
        name: "Business Services",
        slug: "business-services",
        icon: Briefcase,
        color: "bg-gray-100 text-gray-600",
        items: ["Logistics", "Consulting", "Marketing"]
    },
    {
        name: "Computer & IT",
        slug: "computer-it",
        icon: Cpu,
        color: "bg-cyan-100 text-cyan-600",
        items: ["Software", "Hardware", "Networking"]
    },
    {
        name: "Global Trade",
        slug: "global-trade",
        icon: Globe,
        color: "bg-indigo-100 text-indigo-600",
        items: ["Import/Export", "Shipping", "Customs"]
    },
    {
        name: "Agriculture",
        slug: "agriculture",
        icon: Sprout,
        color: "bg-lime-100 text-lime-600",
        items: ["Seeds", "Fertilizers", "Tractor Parts"]
    },
    {
        name: "Food & Beverages",
        slug: "food-beverages",
        icon: Utensils,
        color: "bg-amber-100 text-amber-600",
        items: ["Spices", "Grains", "Processed Food"]
    },
    {
        name: "Chemicals",
        slug: "chemicals",
        icon: FlaskConical,
        color: "bg-teal-100 text-teal-600",
        items: ["Industrial Chemicals", "Solvents", "Dyes"]
    },
    {
        name: "Industrial Supplies",
        slug: "industrial-supplies",
        icon: Factory,
        color: "bg-slate-100 text-slate-600",
        items: ["Safety Gear", "Tools", "Fasteners"]
    },
    {
        name: "Construction",
        slug: "construction",
        icon: Building2,
        color: "bg-sky-100 text-sky-600",
        items: ["Cement", "Bricks", "Steel"]
    },
    {
        name: "Furniture",
        slug: "furniture",
        icon: Armchair,
        color: "bg-rose-100 text-rose-600",
        items: ["Office Furniture", "Home Furniture", "Chairs"]
    },
    {
        name: "Health & Beauty",
        slug: "health-beauty",
        icon: Heart,
        color: "bg-fuchsia-100 text-fuchsia-600",
        items: ["Cosmetics", "Supplements", "Equipment"]
    },
    {
        name: "Tools & Hardware",
        slug: "tools-hardware",
        icon: Hammer,
        color: "bg-zinc-100 text-zinc-600",
        items: ["Hand Tools", "Power Tools", "Drills"]
    },
    // New Categories Added Below
    {
        name: "Real Estate & Rentals",
        slug: "real-estate",
        icon: Key,
        color: "bg-emerald-100 text-emerald-600",
        items: ["Rentals", "PG & Hostels", "Commercial"]
    },
    {
        name: "Local Services",
        slug: "local-services",
        icon: MapPin,
        color: "bg-violet-100 text-violet-600",
        items: ["Sweet Shops", "Restaurants", "Services"]
    },
];

const Categories = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore Top Categories</h2>
                    <p className="text-gray-500">Browse through our extensive range of products and services</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={`/category/${cat.slug}`}
                            className="group flex flex-col items-center p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white h-full"
                        >
                            <div className={`p-4 rounded-full mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon size={32} />
                            </div>
                            <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center text-sm mb-3">
                                {cat.name}
                            </h3>

                            {/* Sub-items List */}
                            <div className="w-full border-t border-gray-100 pt-3 mt-auto">
                                <ul className="text-center space-y-1">
                                    {cat.items.map((item, i) => (
                                        <li key={i} className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                            <span className="block">{item}</span>
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

export default Categories;