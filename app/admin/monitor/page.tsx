"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Store } from 'lucide-react';

function MonitorContent() {
    const searchParams = useSearchParams();
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    
    const [messages, setMessages] = useState<any[]>([]);
    const [meta, setMeta] = useState({ buyerName: '', sellerName: '' });

    // 1. Refs for smart scrolling
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true); // Default to true so it scrolls on first load

    const fetchData = async () => {
        if (!buyerId || !sellerId) return;
        try {
            const res = await fetch(`/api/admin/monitor?buyerId=${buyerId}&sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error("Failed to fetch monitor data", error);
        }
    };

    // Poll every 2 seconds for live updates
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [buyerId, sellerId]);

    // 2. Handle Scroll Event to track user position
    const handleScroll = () => {
        if (!scrollRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        // Check if user is within 100px of the bottom
        // If they are, we consider them "at the bottom" and will auto-scroll for new messages
        const isBottom = scrollHeight - scrollTop - clientHeight < 100;
        isAtBottomRef.current = isBottom;
    };

    // 3. Smart Auto-Scroll Effect
    useEffect(() => {
        // Only scroll to bottom if the user was ALREADY at the bottom
        if (scrollRef.current && isAtBottomRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4 shadow-md flex justify-between items-center z-10">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Store className="text-green-400" size={20} /> {meta.sellerName || 'Loading...'}
                        <span className="text-gray-600 mx-2">↔</span>
                        <User className="text-blue-400" size={20} /> {meta.buyerName || 'Loading...'}
                    </h2>
                    <p className="text-xs text-gray-500">Live Admin Monitor • Read-Only Mode</p>
                </div>
                <div className="text-xs bg-red-900/50 text-red-200 px-3 py-1 rounded-full animate-pulse">
                    🔴 Live
                </div>
            </header>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50"
            >
                {messages.map((msg) => {
                    const isSeller = msg.sender === 'seller';
                    return (
                        <div key={msg._id} className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                isSeller 
                                ? 'bg-green-900/80 text-green-50 rounded-tr-none' 
                                : 'bg-gray-800 text-gray-100 rounded-tl-none'
                            }`}>
                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1">
                                    {isSeller ? 'Seller' : 'Buyer'}
                                </div>
                                <div className="whitespace-pre-wrap">{msg.message}</div>
                                <div className="text-[10px] text-right mt-2 opacity-40">
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminMonitorPage() {
    return (
        <Suspense fallback={<div className="p-10 text-white">Loading Monitor...</div>}>
            <MonitorContent />
        </Suspense>
    );
}