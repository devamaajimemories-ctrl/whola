"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Send, ArrowLeft, MoreVertical, Phone, Search,
    CheckCircle, ShieldCheck, ShoppingBag, Loader2
} from 'lucide-react';

// --- Types ---
interface Conversation {
    _id: string;
    lastMessage: string;
    lastDate: string;
    seller: {
        name: string;
        city: string;
        category: string;
        isVerified: boolean;
        avatarColor?: string;
    };
}

interface Message {
    _id: string;
    sender: 'user' | 'seller';
    message: string;
    createdAt: string;
    type?: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
}

export default function BuyerMessagesPage() {
    // --- State ---
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Effects ---

    // 1. Initial Load & Poll Inbox
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // 2. Poll Active Chat
    useEffect(() => {
        if (activeSellerId) {
            fetchMessages(activeSellerId);
            const interval = setInterval(() => fetchMessages(activeSellerId), 3000);
            return () => clearInterval(interval);
        }
    }, [activeSellerId]);

    // 3. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // --- API Calls ---
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) setConversations(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchMessages = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/chat/history?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success) setMessages(data.data);
        } catch (e) { console.error(e); }
    };

    const handleSend = async () => {
        if (!input.trim() || !activeSellerId) return;
        setSending(true);
        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: activeSellerId, message: input })
            });
            setInput("");
            fetchMessages(activeSellerId); // Instant refresh
        } catch (e) { alert("Failed to send"); }
        finally { setSending(false); }
    };

    // --- Helpers ---
    const activeConv = conversations.find(c => c._id === activeSellerId);

    // --- RENDER ---
    return (
        // MAIN CONTAINER: Fixed height, no window scroll
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">

            {/* SIDEBAR: List of Sellers */}
            <aside className={`
                w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white z-10
                ${activeSellerId ? 'hidden md:flex' : 'flex'} 
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-xl font-bold text-gray-800 mb-3">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Sidebar List (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <ShoppingBag size={48} className="mb-2 opacity-20" />
                            <p>No messages yet</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => setActiveSellerId(conv._id)}
                                className={`
                                    flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-50 transition-colors
                                    ${activeSellerId === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}
                                `}
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                    {conv.seller.name[0]}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-900 truncate">{conv.seller.name}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(conv.lastDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* CHAT AREA: The Conversation */}
            <main className={`
                flex-1 flex flex-col bg-[#efeae2] relative
                ${!activeSellerId ? 'hidden md:flex' : 'flex'}
            `}>
                {activeSellerId && activeConv ? (
                    <>
                        {/* Chat Header */}
                        <header className="bg-white p-3 border-b border-gray-200 flex items-center justify-between shadow-sm flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setActiveSellerId(null)}
                                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                    {activeConv.seller.name[0]}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800 flex items-center gap-1">
                                        {activeConv.seller.name}
                                        {activeConv.seller.isVerified && <ShieldCheck size={14} className="text-green-500" />}
                                    </h2>
                                    <p className="text-xs text-gray-500">{activeConv.seller.category}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </header>

                        {/* Messages (Scrollable) */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-3 bg-opacity-10 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"
                            ref={scrollRef}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[80%] rounded-lg px-4 py-2 shadow-sm text-sm relative
                                        ${msg.sender === 'user'
                                            ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                            : 'bg-white text-gray-900 rounded-tl-none'}
                                    `}>
                                        {msg.type === 'OFFER' && (
                                            <div className="text-xs font-bold text-orange-600 mb-1">OFFER RECEIVED</div>
                                        )}
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                        <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'user' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <footer className="bg-[#f0f2f5] p-3 flex items-center gap-2 flex-shrink-0">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message"
                                className="flex-1 bg-white border-none rounded-lg px-4 py-3 focus:ring-0 text-sm shadow-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </footer>
                    </>
                ) : (
                    // Desktop Placeholder (Empty State)
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 border-l border-gray-300/50">
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                            <div className="relative">
                                <ShoppingBag size={50} className="text-gray-400" />
                                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
                                    <CheckCircle className="text-green-500" size={20} />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-light text-gray-600 mb-2">Web Chat</h2>
                        <p className="text-sm">Select a conversation to start messaging.</p>
                    </div>
                )}
            </main>
        </div>
    );
}