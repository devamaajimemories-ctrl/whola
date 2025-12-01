"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Send, ArrowLeft, MoreVertical, Phone, Search,
    ShieldCheck, Loader2, MessageSquare, User, Paperclip, Smile
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

export default function WhatsAppStylePage() {
    // --- State ---
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Load Data ---
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeSellerId) {
            fetchMessages(activeSellerId);
            const interval = setInterval(() => fetchMessages(activeSellerId), 3000);
            return () => clearInterval(interval);
        }
    }, [activeSellerId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeSellerId]);

    // --- API Functions ---
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
            fetchMessages(activeSellerId);
        } catch (e) { alert("Failed to send"); }
        finally { setSending(false); }
    };

    const activeConv = conversations.find(c => c._id === activeSellerId);

    return (
        // MAIN WRAPPER: Fixed Viewport Height
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#d1d7db] font-sans">

            {/* ================= LEFT SIDEBAR ================= */}
            <aside className={`
                w-full md:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20
                ${activeSellerId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* 1. Sidebar Header (Gray Bar) */}
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0 border-b border-[#d1d7db]">
                    <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-gray-500">
                        <User size={20} />
                    </div>
                    <div className="flex gap-6 text-[#54656f]">
                        <MessageSquare size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                {/* 2. Search Bar */}
                <div className="p-2 bg-white border-b border-[#f0f2f5] shrink-0">
                    <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 h-[35px]">
                        <Search size={18} className="text-[#54656f] mr-4" />
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-[#54656f] text-[#3b4a54]"
                        />
                    </div>
                </div>

                {/* 3. Conversation List */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {loading ? (
                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#00a884]" /></div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => setActiveSellerId(conv._id)}
                                className={`
                                    flex items-center gap-3 p-3 cursor-pointer border-b border-[#f0f2f5] hover:bg-[#f5f6f6]
                                    ${activeSellerId === conv._id ? 'bg-[#f0f2f5]' : ''}
                                `}
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center text-gray-600 text-lg font-medium shrink-0">
                                    {conv.seller.name[0]}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-[#111b21] font-normal text-[17px] truncate">{conv.seller.name}</h3>
                                        <span className="text-xs text-[#667781] whitespace-nowrap">
                                            {new Date(conv.lastDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#667781] truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>


            {/* ================= RIGHT MAIN CHAT ================= */}
            <main className={`
                flex-1 flex flex-col relative
                ${!activeSellerId ? 'hidden md:flex' : 'flex'}
            `}>
                {activeSellerId && activeConv ? (
                    <>
                        {/* 1. Chat Header */}
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0 border-b border-[#d1d7db] z-10">
                            <div className="flex items-center gap-3">
                                {/* Back Button (Mobile) */}
                                <button
                                    onClick={() => setActiveSellerId(null)}
                                    className="md:hidden text-[#54656f]"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-gray-600 text-lg">
                                    {activeConv.seller.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-[#111b21] font-medium text-[16px] flex items-center gap-1">
                                        {activeConv.seller.name}
                                        {activeConv.seller.isVerified && <ShieldCheck size={14} className="text-[#00a884]" />}
                                    </h2>
                                    <p className="text-xs text-[#667781]">Online</p>
                                </div>
                            </div>
                            <div className="flex gap-5 text-[#54656f]">
                                <Phone size={20} />
                                <Search size={20} />
                                <MoreVertical size={20} />
                            </div>
                        </header>

                        {/* 2. Messages Area (Beige Background) */}
                        <div
                            className="flex-1 overflow-y-auto p-4 md:px-16 lg:px-24 bg-[#efeae2] relative"
                            ref={scrollRef}
                            style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}
                        >
                            <div className="space-y-2 pb-2">
                                {messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                                            relative max-w-[85%] md:max-w-[65%] rounded-lg px-2 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[14.2px] leading-[19px]
                                            ${msg.sender === 'user'
                                                ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                                                : 'bg-white text-[#111b21] rounded-tl-none'}
                                        `}>
                                            {/* Offer/Deal Badge */}
                                            {msg.type === 'OFFER' && (
                                                <div className="mb-1 text-xs font-bold text-orange-600 uppercase tracking-wide">
                                                    Special Offer
                                                </div>
                                            )}

                                            {/* Message Text */}
                                            <div className="pr-16 whitespace-pre-wrap">{msg.message}</div>

                                            {/* Timestamp */}
                                            <span className={`
                                                absolute bottom-1 right-2 text-[11px] 
                                                ${msg.sender === 'user' ? 'text-[#00a884]' : 'text-[#667781]'}
                                            `}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.sender === 'user' && <span className="ml-1">✓✓</span>}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Input Footer */}
                        <footer className="bg-[#f0f2f5] min-h-[62px] px-4 py-2 flex items-center gap-3 shrink-0 z-10">
                            <div className="flex gap-4 text-[#54656f]">
                                <Smile size={24} />
                                <Paperclip size={24} />
                            </div>

                            <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message"
                                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#3b4a54] placeholder-[#54656f] p-0"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="text-[#54656f] hover:text-[#00a884] transition-colors"
                            >
                                {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        </footer>
                    </>
                ) : (
                    // Default Empty State (Like WhatsApp Web)
                    <div className="hidden md:flex flex-col items-center justify-center h-full bg-[#f0f2f5] border-b-[6px] border-[#25d366]">
                        <div className="text-center px-10">
                            <h2 className="text-[#41525d] text-[32px] font-light mt-8 mb-4">WhatsApp Web for Business</h2>
                            <p className="text-[#667781] text-sm leading-6">
                                Send and receive messages without keeping your phone online.<br />
                                Use WhatsApp on up to 4 linked devices and 1 phone.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}