"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Verified, MapPin, MessageCircle, Loader2, Filter } from "lucide-react";
import { industrialProducts } from "@/lib/industrialData";
import ChatModal from "@/components/ChatModal";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";
    
    // State
    const [searchTerm, setSearchTerm] = useState(initialQuery);
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

    // 1. Debounced Update of URL (Triggers Search)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm && searchTerm !== initialQuery) {
                // scroll: false prevents the page from jumping when URL changes
                router.replace(`/search?q=${encodeURIComponent(searchTerm)}`, { scroll: false });
            }
        }, 500); // Reduced to 500ms for faster response

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, router, initialQuery]);

    // 2. Static Product Search (Client Side)
    const productResults = useMemo(() => {
        if (!initialQuery) return [];
        const lowerQuery = initialQuery.toLowerCase();
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
    }, [initialQuery]);

    // 3. Dynamic Seller Search (Server Side JIT)
    useEffect(() => {
        // If no query, clear results
        if (!initialQuery) {
            setSellers([]);
            return;
        }

        const fetchSellers = async () => {
            setLoadingSellers(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setSellers(data.data);
                }
            } catch (error) {
                console.error("Error fetching sellers:", error);
            } finally {
                setLoadingSellers(false);
            }
        };

        fetchSellers();
    }, [initialQuery]);

    const totalResults = productResults.reduce((acc, cat) => acc + cat.products.length, 0) + sellers.length;

    return (
        <div className="min-h-screen bg-gray-50 py-6">
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
                {/* Top Navigation & Search Bar */}
                <div className="mb-6 sticky top-0 z-20 bg-gray-50 pt-4 pb-4 shadow-sm transition-all">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition-colors inline-flex text-sm font-medium">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Link>

                    <div className="relative max-w-2xl shadow-sm">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type to search products..." 
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition-all"
                            autoFocus
                        />
                        {loadingSellers ? (
                            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={20} />
                        ) : (
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between max-w-2xl">
                        <p className="text-gray-500 text-sm">
                            {loadingSellers ? "Searching live database..." : `Found ${totalResults} results`}
                        </p>
                        <div className="flex gap-2">
                             {/* Filter placeholders for future */}
                             <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1 cursor-pointer hover:bg-gray-100">
                                <Filter size={12}/> City
                             </span>
                        </div>
                    </div>
                </div>

                {/* LOADING STATE - Visible immediately */}
                {loadingSellers && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-48 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                                <div className="h-8 bg-gray-100 rounded-full w-full"></div>
                            </div>
                        ))}
                        <div className="col-span-full text-center py-4">
                            <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={16}/> 
                                Checking live inventory...
                            </p>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loadingSellers && totalResults === 0 && searchTerm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                        <p className="text-gray-500">Try searching for generic terms like "Steel", "Cement", or "Pipes"</p>
                    </div>
                )}

                {/* RESULTS */}
                <div className="space-y-10 min-h-[50vh]">
                    {/* SECTION 1: VERIFIED SELLERS */}
                    {!loadingSellers && sellers.length > 0 && (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Verified className="text-green-600 mr-2" />
                                Verified Suppliers
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sellers.map((seller, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{seller.name}</h3>
                                            {seller.isVerified && (
                                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                                            <MapPin size={14} className="mr-1 text-gray-400" />
                                            {seller.city}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded line-clamp-1 max-w-[50%]">
                                                {seller.category}
                                            </span>
                                            <button
                                                onClick={() => openChat(seller)}
                                                className="flex items-center bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform active:scale-95"
                                            >
                                                <MessageCircle size={14} className="mr-1.5" />
                                                Chat Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: CATEGORIES */}
                    {!loadingSellers && productResults.length > 0 && (
                        <div className="animate-in fade-in duration-700">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Matching Categories</h2>
                            <div className="space-y-6">
                                {productResults.map((category, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">{category.category}</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {category.products.map((product, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer text-center"
                                                        onClick={() => setSearchTerm(product)}
                                                    >
                                                        <span className="text-gray-700 hover:text-blue-700 text-sm font-medium">
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
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600"><Loader2 className="animate-spin mr-2"/> Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}