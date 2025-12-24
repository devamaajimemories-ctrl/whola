"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, User, Store, Clock, ArrowRight } from 'lucide-react';

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/conversations')
            .then(res => res.json())
            .then(data => {
                if (data.success) setConversations(data.data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-white">Loading Chats...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare className="text-blue-500" /> All Conversations
            </h1>

            <div className="grid gap-4">
                {conversations.map((chat: any) => (
                    <div key={chat.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-750 transition">
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-6 mb-2">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <User size={16} /> 
                                    <span className="font-semibold">{chat.buyer.name}</span>
                                </div>
                                <span className="text-gray-600">↔️</span>
                                <div className="flex items-center gap-2 text-green-300">
                                    <Store size={16} />
                                    <span className="font-semibold">{chat.seller.name}</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm truncate">"{chat.lastMessage}"</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock size={14} /> {new Date(chat.lastActive).toLocaleString()}
                            </span>
                            <span className="bg-gray-700 px-2 py-1 rounded text-xs text-white">
                                {chat.count} msgs
                            </span>
                            <Link 
                                href={`/admin/monitor?buyerId=${chat.buyer.id}&sellerId=${chat.seller._id}`}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                Monitor <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}