"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Verified, MapPin, MessageCircle } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import ChatModal from "@/components/ChatModal";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [sellers, setSellers] = useState<any[]>([]);
    const [loadingSellers, setLoadingSellers] = useState(false);

    // Chat Modal State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<{ name: string, id: string } | null>(null);

    const openChat = (seller: any) => {
        setSelectedSeller({
            name: seller.name,
            id: seller._id // Use MongoDB _id
        });
        setIsChatOpen(true);
    };

    // 1. Static Product Search (Existing Logic)
    const productResults = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        const filtered = [];

        for (const category of industrialProducts) {
            const matchingProducts = category.products.filter(product =>
                product.toLowerCase().includes(lowerQuery)
            );

            if (matchingProducts.length > 0) {
                filtered.push({
                    category: category.category,
                    products: matchingProducts
                });
            }
        }
        return filtered;
    }, [query]);

    // 2. Dynamic Seller Search (New API Logic with Auto-Scraper)
    useEffect(() => {
        if (!query) {
            setSellers([]);
            return;
        }

        const fetchSellers = async () => {
            setLoadingSellers(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.success) {
                    setSellers(data.data);
                }
            } catch (error) {
                console.error("Error fetching sellers:", error);
            }
            setLoadingSellers(false);
        };

        fetchSellers();
    }, [query]);

    const totalResults = productResults.reduce((acc, cat) => acc + cat.products.length, 0) + sellers.length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Chat Modal */}
            {selectedSeller && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    sellerName={selectedSeller.name}
                    sellerId={selectedSeller.id}
                />
            )}

            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Link>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                        Search Results for <span className="text-blue-600">"{query}"</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Found {totalResults} results
                    </p>
                </div>

                {totalResults === 0 && !loadingSellers ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                        <p className="text-gray-500">Try searching for something else, like "Steel", "Pumps", or "Valves"</p>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* SECTION 1: VERIFIED SELLERS (Dynamic Data) */}
                        {sellers.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <Verified className="text-green-600 mr-2" />
                                    Verified Sellers & Suppliers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sellers.map((seller, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{seller.name}</h3>
                                                {seller.isVerified && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 flex items-center">
                                                <MapPin size={14} className="mr-1" />
                                                {seller.city}
                                            </p>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    {seller.category}
                                                </span>
                                                <button
                                                    onClick={() => openChat(seller)}
                                                    className="flex items-center text-blue-600 font-bold text-sm hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                                                >
                                                    <MessageCircle size={16} className="mr-1.5" />
                                                    Chat with Supplier
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: PRODUCT CATEGORIES (Static Data) */}
                        {productResults.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Matching Product Categories</h2>
                                <div className="space-y-6">
                                    {productResults.map((category, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                                <h2 className="font-semibold text-gray-800">{category.category}</h2>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {category.products.map((product, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group"
                                                        >
                                                            <span className="text-gray-600 group-hover:text-blue-700 text-sm font-medium">
                                                                {product}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Loading Search Results...</div>}>
            <SearchContent />
        </Suspense>
    );
}