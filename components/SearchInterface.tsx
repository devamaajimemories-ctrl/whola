"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, MessageCircle, Loader2, Building2, ShieldCheck, Lock, Star } from "lucide-react";
import ChatModal from "@/components/ChatModal";

interface SearchInterfaceProps {
    initialQuery: string;
    initialLocation: string;
    initialData: any[];
    initialFilters?: { verified: boolean; topRated: boolean; openNow: boolean };
}

export default function SearchInterface({ initialQuery, initialLocation, initialData, initialFilters }: SearchInterfaceProps) {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [sellers, setSellers] = useState<any[]>(initialData);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [filters, setFilters] = useState({
        verified: initialFilters?.verified || false,
        topRated: initialFilters?.topRated || false,
        openNow: initialFilters?.openNow || false
    });
    
    const observerTarget = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<{ name: string, id: string } | null>(null);

    useEffect(() => {
        setSearchTerm(initialQuery);
        setSellers(initialData);
    }, [initialData, initialQuery]);

    const handleSearch = () => {
        if(!searchTerm.trim()) return;
        const params = new URLSearchParams();
        params.set('q', searchTerm);
        if(initialLocation) params.set('loc', initialLocation);
        router.push(`/search?${params.toString()}`);
    };

    const loadMoreSellers = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        
        try {
            const nextPage = page + 1;
            const params = new URLSearchParams();
            params.set('q', initialQuery);
            if(initialLocation) params.set('loc', initialLocation);
            params.set('page', nextPage.toString());
            
            // Add filters
            if(filters.verified) params.set('verified', 'true');
            if(filters.topRated) params.set('topRated', 'true');
            if(filters.openNow) params.set('openNow', 'true');

            const res = await fetch(`/api/search?${params.toString()}`);
            const data = await res.json();
            
            if (data.success && data.products.length > 0) {
                setSellers(prev => {
                    const existingIds = new Set(prev.map(p => p._id));
                    const newUnique = data.products.filter((p: any) => !existingIds.has(p._id));
                    return [...prev, ...newUnique];
                });
                setPage(nextPage);
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false);
        }
    }, [initialQuery, initialLocation, page, hasMore, loadingMore, filters]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                loadMoreSellers();
            }
        }, { threshold: 1.0 });
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [loadMoreSellers, hasMore, loadingMore]);

    return (
        <div className="min-h-screen bg-white">
            {selectedSeller && <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} sellerName={selectedSeller.name} sellerId={selectedSeller.id} />}

            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 pt-4 pb-2 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-3">
                        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ArrowLeft size={20} /></Link>
                        <div className="relative flex-1 shadow-sm">
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search products..." 
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto pb-20">
                {sellers.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {sellers.map((seller, index) => (
                            <div key={`${seller._id}-${index}`} className="flex p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-[120px] h-[120px] bg-gray-100 rounded-xl overflow-hidden shrink-0 relative border border-gray-100">
                                    {seller.images?.[0] ? (
                                        <img src={seller.images[0]} alt={seller.name} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><Building2 size={32} /></div>
                                    )}
                                    {seller.isVerified && <div className="absolute top-2 left-2 bg-white/95 text-green-700 text-[10px] px-1.5 py-0.5 rounded shadow font-bold flex gap-1"><ShieldCheck size={10} /> Verified</div>}
                                </div>

                                <div className="flex-1 pl-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{seller.name}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-sm flex-wrap">
                                            <span className="font-bold text-gray-900">{seller.ratingAverage || 4.5}</span>
                                            <Star size={12} className="text-yellow-500" fill="currentColor"/>
                                            <span className="text-gray-500 text-xs">({seller.ratingCount || 10})</span>
                                            <span className="text-gray-300 mx-1">•</span>
                                            <span className="text-gray-600 truncate">{seller.category}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2"><MapPin size={12} className="inline mr-1" /> {seller.address || seller.city}</p>
                                        
                                        {seller.openingHours && (
                                            <p className={`text-xs font-medium mt-1 ${seller.openingHours.includes("Open") ? 'text-green-600' : 'text-red-500'}`}>
                                                {seller.openingHours}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-3">
                                        <button onClick={() => { setSelectedSeller({ name: seller.name, id: seller._id }); setIsChatOpen(true); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-full shadow-sm flex justify-center gap-2 transition-colors"><MessageCircle size={16} /> Contact</button>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded"><Lock size={10} /> Hidden</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 px-4">
                        <div>
                            <Search className="text-gray-300 mx-auto mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-800">No matching suppliers found</h3>
                            <p className="text-gray-500 mt-2">Try checking the spelling or posting a requirement.</p>
                            <Link href="/post-requirement" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700">
                                Post Requirement
                            </Link>
                        </div>
                    </div>
                )}
                
                {/* Always render target, but only trigger if we have data */}
                <div ref={observerTarget} className="h-24 flex items-center justify-center mt-4">
                    {loadingMore && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> Loading more...</div>}
                </div>
            </div>
        </div>
    );
}