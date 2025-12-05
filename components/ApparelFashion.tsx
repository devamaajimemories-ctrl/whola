"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Snowflake, User, Shirt, Scissors, Layers, ShoppingBag } from "lucide-react";
import Link from "next/link";

const subCategories = [
    {
        title: "Winter Clothing & Accessories",
        items: ["Winter Jackets", "Sweater", "Sweatshirt", "Cardigans"],
        icon: Snowflake,
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Ladies Dresses, Apparels & Cloth...",
        items: ["Ladies Woolen Kurti", "Ladies Jackets", "Women Wear", "Palazzo Suit"],
        icon: User,
        color: "bg-pink-100 text-pink-600",
    },
    {
        title: "Unisex Clothing",
        items: ["Winter Coat", "Knitted Garment", "Overcoats", "ZIP Hoodie"],
        icon: Shirt,
        color: "bg-purple-100 text-purple-600",
    },
    {
        title: "Scarves, Stoles, Shawls and...",
        items: ["Scarves", "Shawls", "Pashmina Shawls", "Stoles"],
        icon: Layers,
        color: "bg-orange-100 text-orange-600",
    },
    {
        title: "Apparel Fabrics & Dress Mat...",
        items: ["Fabric", "Knitted Fabrics", "Synthetic Fabrics", "Natural Fabrics"],
        icon: Scissors,
        color: "bg-green-100 text-green-600",
    },
    {
        title: "Men Shirts, Jeans & Clothing",
        items: ["Mens T shirt", "Mens Organic Clothing", "Mens Lower", "Mens V-neck T-shirts"],
        icon: ShoppingBag,
        color: "bg-indigo-100 text-indigo-600",
    },
];

const ApparelFashion = () => {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                        Apparel & Fashion
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Banner */}
                    <div className="w-full lg:w-1/4 relative rounded-2xl overflow-hidden shadow-lg group min-h-[400px]">
                        <Image
                            src="/fashion_banner.png"
                            alt="Fashion Banner"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <div className="space-y-2 mb-6">
                                <Link href="/search?q=Badges%2C%20Emblems%20%26%20Lanyards" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Badges, Emblems & Lanyards</Link>
                                <Link href="/search?q=Designer%20%26%20Fashion%20Bags" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Designer & Fashion Bags</Link>
                                <Link href="/search?q=Bags%2C%20Pouches%2C%20Card%20Holder" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Bags, Pouches, Card Holder</Link>
                                <Link href="/search?q=Sarees%20%26%20Lehenga" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Sarees & Lehenga</Link>
                            </div>
                            <Link href="/category/apparel-fashion" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full w-fit transition-colors shadow-md inline-block">
                                View All
                            </Link>
                        </div>
                    </div>

                    {/* Right Grid */}
                    <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subCategories.map((cat, index) => (
                            <div key={index} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1 pr-2" title={cat.title}>
                                        {cat.title}
                                    </h3>
                                    <ArrowRight size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                </div>

                                <div className="flex justify-between items-start gap-3">
                                    <ul className="space-y-1.5 text-sm">
                                        {cat.items.map((item, i) => (
                                            <li key={i}>
                                                <Link href={`/search?q=${encodeURIComponent(item)}`} className="text-gray-500 hover:text-blue-600 transition-colors block">
                                                    {item}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                                        <cat.icon size={32} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApparelFashion;
