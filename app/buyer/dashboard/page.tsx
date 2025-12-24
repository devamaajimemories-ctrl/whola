import React from "react";
import { headers } from "next/headers";
import User from "@/lib/models/User";
import Request from "@/lib/models/Request";
import dbConnect from "@/lib/db";
import { User as UserIcon, Phone, Mail, ShieldCheck, MessageCircle } from 'lucide-react';
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import Link from "next/link";

// Components (Frontend)
import Categories from "@/components/Categories";
// REMOVED: import AdPlaceholder... (This was causing the error)
import TrendingCategories from "@/components/TrendingCategories";
import ApparelFashion from "@/components/ApparelFashion";
import ConsumerElectronics from "@/components/ConsumerElectronics";
import HomeSupplies from "@/components/HomeSupplies";

export default async function BuyerDashboard() {
    // --- BACKEND LOGIC START ---
    await dbConnect();
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) return <div className="min-h-screen flex items-center justify-center">Access Denied</div>;

    const user = await User.findById(userId);
    if (!user) return <div className="min-h-screen flex items-center justify-center">Account Error. Please re-login.</div>;

    // Fetch Active Requests
    const activeRequests = await Request.find({
        buyerPhone: user.phone,
        $or: [{ status: { $ne: 'OPEN' } }, { unlockedBy: { $exists: true, $ne: [] } }]
    }).sort({ createdAt: -1 });

    // Fetch Recent Conversations
    const conversations = await Chat.aggregate([
        { $match: { userId: userId } },
        { $sort: { createdAt: 1 } },
        { $group: { _id: "$sellerId", lastMessage: { $last: "$message" }, lastDate: { $last: "$createdAt" } } },
        { $sort: { lastDate: -1 } },
        { $limit: 3 }
    ]);

    const populatedConversations = await Promise.all(conversations.map(async (conv) => {
        const seller = await Seller.findById(conv._id).select('name');
        return { ...conv, sellerName: seller ? seller.name : "Unknown Seller" };
    }));
    // --- BACKEND LOGIC END ---

    // --- FRONTEND UI START ---
    return (
        <main className="flex min-h-screen flex-col bg-gray-50">
            {/* Header */}
            <div className="w-full bg-gradient-to-r from-blue-900 to-blue-800 py-10 text-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200" />
                                Welcome, {user.name}
                            </h1>
                            <div className="mt-3 flex flex-wrap gap-4 text-blue-100 text-sm md:text-base">
                                <span className="flex items-center gap-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700/50"><Phone size={14} /> {user.phone}</span>
                                <span className="flex items-center gap-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700/50"><Mail size={14} /> {user.email}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[200px]">
                            <p className="text-xs text-blue-200 mb-1 uppercase tracking-wide font-semibold">Account Status</p>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-400"><ShieldCheck size={12} className="text-black" /></div>
                                <span className="font-bold text-white text-lg">Verified Buyer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Section */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Messages</h2>
                    <Link href="/buyer/messages" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
                </div>
                {populatedConversations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {populatedConversations.map((conv: any) => (
                            <Link href={`/buyer/messages?sellerId=${conv._id}`} key={conv._id} className="block">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:border-blue-200 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{conv.sellerName}</h3>
                                        <span className="text-xs text-gray-400">{new Date(conv.lastDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle size={32} /></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No conversations yet</h3>
                        <p className="text-gray-500 mb-4">Start chatting with sellers to negotiate deals.</p>
                        <Link href="/search" className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Find Sellers to Chat</Link>
                    </div>
                )}
            </div>

            {/* Marketplace Widgets */}
            <Categories />
            <TrendingCategories />
            <ApparelFashion />
            <ConsumerElectronics />
            <HomeSupplies />
        </main>
    );
}