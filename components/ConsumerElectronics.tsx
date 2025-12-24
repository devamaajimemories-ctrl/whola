"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Zap, Coffee, WashingMachine, Fan, Monitor, Lightbulb } from "lucide-react";
import Link from "next/link";

const subCategories = [
    {
        title: "Heaters, Thermostats & Heating",
        items: ["Water Heaters", "Immersion Heaters", "Electric Geyser", "Air Heaters"],
        icon: Zap,
        color: "bg-orange-100 text-orange-600",
    },
    {
        title: "Kitchen Appliances",
        items: ["Induction Cooker", "Coffee Machine", "Electric Kettle", "Hot Pots"],
        icon: Coffee,
        color: "bg-amber-100 text-amber-600",
    },
    {
        title: "Electric & Home Appliances",
        items: ["Air Purifiers", "Electric Irons", "Dishwasher", "Washing Machine Spare Parts"],
        icon: WashingMachine,
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Domestic Fans, AC & Coolers",
        items: ["Air Coolers", "Pedestal Fan", "Ceiling Fans", "Air Fan"],
        icon: Fan,
        color: "bg-cyan-100 text-cyan-600",
    },
    {
        title: "Cleaning Machines & Equipment",
        items: ["Laminar Air Flow", "Cleaning Machine", "Floor Sweeper", "Ultrasonic Machine"],
        icon: Monitor, // Using Monitor as a generic tech icon, could be better but fits "Machine"
        color: "bg-slate-100 text-slate-600",
    },
    {
        title: "Street, Flood & Commercial Lights",
        items: ["LED Street Light", "Theater Lights", "Street Light Pole", "Outdoor Light"],
        icon: Lightbulb,
        color: "bg-yellow-100 text-yellow-600",
    },
];

const ConsumerElectronics = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                        Consumer Electronics
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Banner */}
                    <div className="w-full lg:w-1/4 relative rounded-2xl overflow-hidden shadow-lg group min-h-[400px]">
                        <Image
                            src="/electronics_banner.png"
                            alt="Electronics Banner"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <div className="space-y-2 mb-6">
                                <Link href="/search?q=Adaptors%2C%20Plugs%20and%20Sockets" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Adaptors, Plugs and Sockets</Link>
                                <Link href="/search?q=Indoor%20Lights%20%26%20Fittings" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Indoor Lights & Fittings</Link>
                                <Link href="/search?q=Freezers%2C%20Refrigerators" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Freezers, Refrigerators</Link>
                                <Link href="/search?q=Audio%20Video%20System" className="block text-white/90 hover:text-white hover:translate-x-1 transition-transform">Audio Video System</Link>
                            </div>
                            <Link href="/category/electronics-gadgets" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full w-fit transition-colors shadow-md inline-block">
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

export default ConsumerElectronics;
