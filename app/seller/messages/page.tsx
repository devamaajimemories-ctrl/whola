"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Send, ArrowLeft, MoreVertical, Phone, Search,
    Loader2, MessageSquare, User, Paperclip, Smile, Check
} from 'lucide-react';

// Types
interface Conversation {
    _id: string; // This is the Buyer ID (Phone or MongoID)
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
    
    // Get Params from Link
    const paramBuyerId = searchParams.get('buyerId');
    const paramBuyerName = searchParams.get('buyerName');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeBuyerId, setActiveBuyerId] = useState<string | null>(paramBuyerId);
    
    // If we have params but no conversation yet, we store the name temporarily
    const [tempBuyerName, setTempBuyerName] = useState<string>(paramBuyerName || "Potential Buyer");

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
            if (data.success) {
                setConversations(data.data);
                // If we found the active conversation in the list, update the temp name to the real one
                if (activeBuyerId) {
                    const found = data.data.find((c: any) => c._id === activeBuyerId);
                    if (found) setTempBuyerName(found.buyer.name);
                }
            }
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

    // Initial Load
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); 
        return () => clearInterval(interval);
    }, []);

    // Active Chat Logic
    useEffect(() => {
        if (activeBuyerId) {
            fetchMessages(activeBuyerId);
            const interval = setInterval(() => fetchMessages(activeBuyerId), 3000); 
            return () => clearInterval(interval);
        }
    }, [activeBuyerId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeBuyerId]);

    const handleSend = async () => {
        if (!input.trim() || !activeBuyerId) return;
        setSending(true);
        try {
            // We pass paramBuyerName just in case it's the first message and we need to create the user
            await fetch('/api/chat/seller-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    buyerId: activeBuyerId, 
                    message: input,
                    buyerName: tempBuyerName // Pass name to backend to create user if needed
                })
            });
            setInput("");
            fetchMessages(activeBuyerId);
            fetchConversations(); // Refresh list to show new chat
        } catch (e) { alert("Failed to send"); }
        finally { setSending(false); }
    };

    const handleBack = () => {
        setActiveBuyerId(null);
        router.push('/seller/messages'); 
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#d1d7db] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20 ${activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db]">
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                        </div>
                        <span className="font-bold text-gray-700">Inbox</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-white">
                    {conversations.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500 text-sm">No active chats.</div>
                    )}
                    {conversations.map((conv) => (
                        <div key={conv._id} onClick={() => { setActiveBuyerId(conv._id); setTempBuyerName(conv.buyer.name); }} className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[#f0f2f5] hover:bg-[#f5f6f6] ${activeBuyerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold shrink-0">
                                {conv.buyer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[#111b21] font-normal text-[17px] truncate capitalize">{conv.buyer.name}</h3>
                                <p className="text-sm text-[#667781] truncate">{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Chat */}
            <main className={`flex-1 flex flex-col relative bg-[#efeae2] ${!activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                {activeBuyerId ? (
                    <>
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db] z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={handleBack} className="md:hidden text-[#54656f]"><ArrowLeft size={24} /></button>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {tempBuyerName.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-[#111b21] font-medium text-[16px]">{tempBuyerName}</h2>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:px-16" ref={scrollRef} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm text-[14.2px] break-words ${msg.sender === 'seller' ? 'bg-[#d9fdd3] text-black' : 'bg-white text-black'}`}>
                                        <div>{msg.message}</div>
                                        <div className="text-[11px] text-[#667781] text-right mt-1 flex justify-end items-center gap-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.sender === 'seller' && <Check size={14} className="text-[#53bdeb]" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <footer className="bg-[#f0f2f5] min-h-[62px] px-4 py-2 flex items-center gap-3 z-10">
                            <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                                <input 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                                    placeholder="Type a message" 
                                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-0 text-black" 
                                />
                            </div>
                            <button onClick={handleSend} disabled={!input.trim() || sending} className="text-[#54656f] hover:text-[#00a884]">
                                {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full border-b-[6px] border-[#25d366] bg-[#f0f2f5]">
                        <h2 className="text-[#41525d] text-[32px] font-light mt-8">Seller Chat</h2>
                        <p className="text-[#667781] text-sm mt-4">Select a conversation to start.</p>
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