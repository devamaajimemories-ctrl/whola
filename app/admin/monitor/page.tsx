"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Users, ShieldCheck, Loader2 } from 'lucide-react';

interface Message {
    _id: string;
    sender: 'user' | 'seller';
    message: string;
    createdAt: string;
    type?: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
}

// 1. Move your original logic into this sub-component
function MonitorContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [buyerName, setBuyerName] = useState('');
    const [sellerName, setSellerName] = useState('');

    useEffect(() => {
        if (!token || token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
            setError('Unauthorized - Invalid admin token');
            setLoading(false);
            return;
        }

        if (!buyerId || !sellerId) {
            setError('Missing conversation parameters');
            setLoading(false);
            return;
        }

        fetchConversation();
        const interval = setInterval(fetchConversation, 3000); // Auto-refresh
        return () => clearInterval(interval);
    }, [token, buyerId, sellerId]);

    const fetchConversation = async () => {
        try {
            const res = await fetch(`/api/admin/monitor?token=${token}&buyerId=${buyerId}&sellerId=${sellerId}`);
            const data = await res.json();

            if (data.success) {
                setMessages(data.messages);
                setBuyerName(data.buyerName);
                setSellerName(data.sellerName);
                setError(null);
            } else {
                setError(data.error || 'Failed to load conversation');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-red-900 text-white p-8 rounded-xl max-w-md">
                    <h2 className="text-2xl font-bold mb-4">⛔ Access Denied</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 shadow-lg sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck size={32} />
                        <h1 className="text-2xl font-bold">Admin Monitor - Live Chat</h1>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>Buyer: <strong>{buyerName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} />
                            <span>Seller: <strong>{sellerName}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 min-h-[600px]">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <MessageSquare size={64} className="mx-auto mb-4 opacity-30" />
                            <p>No messages in this conversation yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-xl p-4 ${msg.sender === 'seller'
                                            ? 'bg-green-700 text-white'
                                            : 'bg-blue-700 text-white'
                                        }`}>
                                        <div className="text-xs opacity-75 mb-1">
                                            {msg.sender === 'seller' ? '🏪 Seller' : '👤 Buyer'}
                                        </div>
                                        <p className="text-sm">{msg.message}</p>
                                        {msg.offerAmount && (
                                            <div className="mt-2 text-lg font-bold border-t border-white/20 pt-2">
                                                💰 ₹{msg.offerAmount}
                                            </div>
                                        )}
                                        <div className="text-xs opacity-60 mt-2">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auto-refresh indicator */}
                <div className="text-center mt-4 text-gray-500 text-sm">
                    🔄 Auto-refreshing every 3 seconds
                </div>
            </div>
        </div>
    );
}

// 2. Export the page component wrapped in Suspense
export default function AdminMonitorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Monitor...</div>}>
            <MonitorContent />
        </Suspense>
    );
}