import React from "react";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { User as UserIcon, Phone, Mail, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

// Import Marketplace Components
import Categories from "@/components/Categories";
import GoogleAd from "@/components/GoogleAd"; // ✅ UPDATED IMPORT
import TrendingCategories from "@/components/TrendingCategories";
import ApparelFashion from "@/components/ApparelFashion";
import ConsumerElectronics from "@/components/ConsumerElectronics";
import HomeSupplies from "@/components/HomeSupplies";

export default async function BuyerPage({ params }: { params: { id: string } }) {
    await dbConnect();

    let user = null;
    let isGuest = false;

    try {
        // 1. Safely attempt to find the user
        user = await User.findById(params.id);
    } catch (error) {
        console.error("Safe Fail: Invalid User ID detected, switching to Guest Mode.");
    }

    // 2. PRODUCTION SAFEGUARD: Fallback to Guest
    if (!user) {
        isGuest = true;
        user = {
            name: "Guest User",
            phone: "Not Connected",
            email: "guest@youthbharat.com",
            createdAt: new Date(),
            role: "guest"
        };
    }

    return (
        <main className="flex min-h-screen flex-col bg-gray-50">
            {/* Dashboard Header */}
            <div className="w-full bg-gradient-to-r from-blue-900 to-blue-800 py-10 text-white shadow-md">
                <div className="container mx-auto px-4">

                    {/* Security Notice */}
                    {isGuest && (
                        <div className="mb-4 bg-yellow-500/20 border border-yellow-400/30 p-3 rounded-lg flex items-center text-yellow-100 text-sm">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Notice: We couldn't find your account details. You are browsing as a Guest.</span>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200" />
                                <span>Welcome, {user.name}!</span>
                            </h1>
                            <div className="mt-3 flex flex-wrap gap-4 text-blue-100 text-sm md:text-base">
                                <span className="flex items-center gap-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700/50">
                                    <Phone size={14} /> {user.phone || 'No Phone'}
                                </span>
                                <span className="flex items-center gap-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700/50">
                                    <Mail size={14} /> {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700/50">
                                    <Clock size={14} /> Joined {new Date(user.createdAt).getFullYear()}
                                </span>
                            </div>
                        </div>

                        {/* Account Status Badge */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[200px]">
                            <p className="text-xs text-blue-200 mb-1 uppercase tracking-wide font-semibold">Account Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${isGuest ? 'bg-yellow-400' : 'bg-green-400'}`}>
                                    <ShieldCheck size={12} className="text-black" />
                                </div>
                                <span className="font-bold text-white text-lg">
                                    {isGuest ? "Guest Access" : "Verified Buyer"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. The "Whole Website" Content */}
            <Categories />
            
            {/* ✅ AD UNIT ADDED HERE */}
            <GoogleAd slot="YOUR_AD_SLOT_ID_3" />
            
            <TrendingCategories />
            <ApparelFashion />
            <ConsumerElectronics />
            
            {/* ✅ AD UNIT ADDED HERE */}
            <GoogleAd slot="YOUR_AD_SLOT_ID_4" />
            
            <HomeSupplies />
        </main>
    );
}