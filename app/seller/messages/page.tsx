"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Send, ArrowLeft, MoreVertical, Phone, Search,
    ShieldCheck, Loader2, MessageSquare, User, Paperclip, Smile, Circle, Check
} from 'lucide-react';

// Types
interface Conversation {
    _id: string; // This is the Buyer ID
    lastMessage: string;
    lastDate: string;
    buyer: {
        name: string;
    };
}

interface Message {
    _id: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    createdAt: string;
    type?: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
}

function SellerChatInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialBuyerId = searchParams.get('buyerId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeBuyerId, setActiveBuyerId] = useState<string | null>(initialBuyerId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversation List
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/seller-conversations');
            const data = await res.json();
            if (data.success) setConversations(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // 2. Fetch Messages for Active Chat
    const fetchMessages = async (buyerId: string) => {
        try {
            const res = await fetch(`/api/chat/seller-history?buyerId=${buyerId}`);
            const data = await res.json();
            if (data.success) setMessages(data.data);
        } catch (e) { console.error(e); }
    };

    // Initial Load & Polling
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Refresh list every 10s
        return () => clearInterval(interval);
    }, []);

    // Active Chat Logic
    useEffect(() => {
        if (activeBuyerId) {
            fetchMessages(activeBuyerId);
            const interval = setInterval(() => fetchMessages(activeBuyerId), 3000); // Poll chat every 3s
            return () => clearInterval(interval);
        }
    }, [activeBuyerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeBuyerId]);

    const handleSend = async () => {
        if (!input.trim() || !activeBuyerId) return;
        setSending(true);
        try {
            await fetch('/api/chat/seller-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: activeBuyerId, message: input })
            });
            setInput("");
            fetchMessages(activeBuyerId);
        } catch (e) { alert("Failed to send"); }
        finally { setSending(false); }
    };

    // Back button for mobile
    const handleBack = () => {
        setActiveBuyerId(null);
        router.push('/seller/messages'); // Clear query param
    };

    const activeConv = conversations.find(c => c._id === activeBuyerId);
    const activeName = activeConv?.buyer?.name || "Potential Buyer";

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#d1d7db] overflow-hidden font-sans">
            
            {/* === SIDEBAR (List of Buyers) === */}
            <aside className={`
                w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20
                ${activeBuyerId ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db]">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                        </div>
                        <span className="font-bold text-gray-700">My Leads</span>
                    </div>
                    <div className="flex gap-4 text-[#54656f]">
                        <MessageSquare size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                {/* Search */}
                <div className="p-2 bg-white border-b border-[#f0f2f5]">
                    <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 h-[35px]">
                        <Search size={18} className="text-[#54656f] mr-4" />
                        <input placeholder="Search buyers..." className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-[#54656f]" />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {loading ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#00a884]" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No inquiries yet.</div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => setActiveBuyerId(conv._id)}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[#f0f2f5] hover:bg-[#f5f6f6] ${activeBuyerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold shrink-0">
                                    {conv.buyer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-[#111b21] font-normal text-[17px] truncate capitalize">{conv.buyer.name}</h3>
                                        <span className="text-xs text-[#667781]">{new Date(conv.lastDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-[#667781] truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* === MAIN CHAT AREA === */}
            <main className={`
                flex-1 flex flex-col relative bg-[#efeae2]
                ${!activeBuyerId ? 'hidden md:flex' : 'flex'}
            `}>
                {activeBuyerId ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db] z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={handleBack} className="md:hidden text-[#54656f]"><ArrowLeft size={24} /></button>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {activeName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-[#111b21] font-medium text-[16px]">{activeName}</h2>
                                    <p className="text-xs text-[#667781]">Prospective Buyer</p>
                                </div>
                            </div>
                            <div className="flex gap-5 text-[#54656f]">
                                <Search size={20} />
                                <MoreVertical size={20} />
                            </div>
                        </header>

                        {/* Messages */}
                        <div 
                            className="flex-1 overflow-y-auto p-4 md:px-16 lg:px-24" 
                            ref={scrollRef}
                            style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}
                        >
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        relative max-w-[85%] md:max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm text-[14.2px] leading-[19px] break-words
                                        ${msg.sender === 'seller' ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' : 'bg-white text-[#111b21] rounded-tl-none'}
                                    `}>
                                        {/* Special Message Types */}
                                        {msg.type === 'OFFER' && <div className="text-xs font-bold text-orange-600 mb-1">PROPOSAL</div>}
                                        
                                        <div>{msg.message}</div>
                                        
                                        <div className="text-[11px] text-[#667781] text-right mt-1 flex justify-end items-center gap-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.sender === 'seller' && <Check size={14} className="text-[#53bdeb]" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <footer className="bg-[#f0f2f5] min-h-[62px] px-4 py-2 flex items-center gap-3 z-10">
                            <div className="flex gap-4 text-[#54656f]"><Smile size={24} /><Paperclip size={24} /></div>
                            <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message"
                                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#3b4a54] p-0 placeholder-[#54656f]"
                                />
                            </div>
                            <button onClick={handleSend} disabled={!input.trim() || sending} className="text-[#54656f] hover:text-[#00a884] transition-colors">
                                {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full border-b-[6px] border-[#25d366] bg-[#f0f2f5]">
                        <h2 className="text-[#41525d] text-[32px] font-light mt-8">YouthBharat Seller Chat</h2>
                        <p className="text-[#667781] text-sm mt-4">Select a buyer from the list to start negotiating.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SellerMessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <SellerChatInterface />
        </Suspense>
    );
}