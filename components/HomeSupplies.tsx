"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Utensils, Baby, Flame, Droplet, Sparkles, Briefcase, Cigarette } from "lucide-react";
import Link from "next/link";

const subCategories = [
    {
        title: "Dinnerware, Tableware and Servi...",
        items: ["Casserole Set", "Hot Case", "Stainless Steel Dinner Set", "Bowls"],
        icon: Utensils,
        color: "bg-orange-100 text-orange-600",
    },
    {
        title: "Child & Baby Care Products",
        items: ["Bio Oil", "Baby Bath Tub", "Baby Carrier", "Baby Cradle", "Diaper", "Baby Diapers"],
        icon: Baby,
        color: "bg-pink-100 text-pink-600",
    },
    {
        title: "Incense, Incensory & Pooja Articles",
        items: ["Camphor", "Incense Sticks", "Shankh", "Frankincense", "Hanuman Kavach"],
        icon: Flame,
        color: "bg-yellow-100 text-yellow-600",
    },
    {
        title: "Soaps & Detergents",
        items: ["Sodium Sulphate", "Detergent", "Detergent Powder", "Castile Soap"],
        icon: Droplet,
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Home Cleaning Products",
        items: ["Squeegees", "White Phenyl Compound", "Vacuum Purifier", "Washing Brushes"],
        icon: Sparkles,
        color: "bg-cyan-100 text-cyan-600",
    },
    {
        title: "Smoking Pipe, Hookah & Cigarett...",
        items: ["Ashtray", "Bongs", "Cigarette Holder", "Cigarette Filter", "Smoking Pipes"],
        icon: Cigarette,
        color: "bg-gray-100 text-gray-600",
    },
    {
        title: "Briefcases, Portfolio & Laptop Bags",
        items: ["Laptop Bags", "Briefcase"],
        icon: Briefcase,
        color: "bg-indigo-100 text-indigo-600",
    },
];

const HomeSupplies = () => {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                        Home Supplies
                    </h2>
                    <Link href="/category/home-supplies" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full w-fit transition-colors shadow-md">
                        View All
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Banner */}
                    <div className="w-full lg:w-1/4 relative rounded-2xl overflow-hidden shadow-lg group min-h-[400px]">
                        <Image
                            src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1000&auto=format&fit=crop"
                            alt="Home Supplies Banner"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <div className="space-y-2 mb-6">
                                <Link href="/search?q=Kitchenware" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Kitchenware</Link>
                                <Link href="/search?q=Cleaning%20Supplies" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Cleaning Supplies</Link>
                                <Link href="/search?q=Baby%20Care" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Baby Care</Link>
                                <Link href="/search?q=Home%20Decor" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Home Decor</Link>
                            </div>
                            <Link href="/category/home-supplies" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/50 font-medium py-2 px-4 rounded-lg transition-all inline-block">
                                Explore Now
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
                                        <li className="text-blue-600 text-xs font-medium cursor-pointer hover:underline mt-1">
                                            <Link href={`/search?q=${encodeURIComponent(cat.title.replace(/\.\.\./, ''))}`}>
                                                View More
                                            </Link>
                                        </li>
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

export default HomeSupplies;
