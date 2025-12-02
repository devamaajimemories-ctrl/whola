"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Send, ArrowLeft, Loader2, User, Check, X
} from 'lucide-react';

interface Message {
    _id: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    createdAt: string;
    type?: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
    offerStatus?: 'PENDING' | 'ACCEPTED';
}

function SellerChatInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paramBuyerId = searchParams.get('buyerId');
    const paramBuyerName = searchParams.get('buyerName');

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeBuyerId, setActiveBuyerId] = useState<string | null>(paramBuyerId);
    const [tempBuyerName, setTempBuyerName] = useState<string>(paramBuyerName || "Buyer");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    
    // Deal State
    const [showDealInput, setShowDealInput] = useState(false);
    const [dealAmount, setDealAmount] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/seller-conversations');
            const data = await res.json();
            if (data.success) setConversations(data.data);
        } catch (e) { console.error(e); }
    };

    const fetchMessages = async (buyerId: string) => {
        try {
            const res = await fetch(`/api/chat/seller-history?buyerId=${buyerId}`);
            const data = await res.json();
            if (data.success) setMessages(data.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeBuyerId) {
            fetchMessages(activeBuyerId);
            const interval = setInterval(() => fetchMessages(activeBuyerId), 3000); 
            return () => clearInterval(interval);
        }
    }, [activeBuyerId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, activeBuyerId]);

    const handleSend = async () => {
        if (!input.trim() || !activeBuyerId) return;
        try {
            await fetch('/api/chat/seller-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: activeBuyerId, message: input, buyerName: tempBuyerName })
            });
            setInput("");
            fetchMessages(activeBuyerId);
        } catch (e) { alert("Failed to send"); }
    };

    // ACCEPT DEAL (Seller Proposes/Accepts)
    const handleAcceptDeal = async () => {
        if (!dealAmount || isNaN(Number(dealAmount))) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            await fetch('/api/chat/offer/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sellerId: activeBuyerId, // Passing Buyer ID as target
                    amount: Number(dealAmount),
                    description: `Seller Accepted Price: ₹${dealAmount}`,
                    sender: 'seller' // Seller sending official offer
                })
            });
            setDealAmount("");
            setShowDealInput(false);
            if (activeBuyerId) fetchMessages(activeBuyerId);
        } catch (e) { alert("Failed to send offer"); }
    };

    // CONFIRM PROPOSAL (Convert Buyer's Proposal to Official Offer)
    const handleConfirmProposal = async (messageId: string) => {
        if(!confirm("Accept buyer's proposal?")) return;
        await fetch('/api/chat/offer/accept-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
        });
        if(activeBuyerId) fetchMessages(activeBuyerId);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#d1d7db] overflow-hidden font-sans">
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20 ${activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b">
                    <User size={20} className="text-gray-500" /> <span className="font-bold text-gray-700">Inbox</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div key={conv._id} onClick={() => {setActiveBuyerId(conv._id); setTempBuyerName(conv.buyer.name);}} className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-[#f5f6f6] ${activeBuyerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{conv.buyer.name.charAt(0)}</div>
                            <div><h3 className="font-medium">{conv.buyer.name}</h3><p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p></div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className={`flex-1 flex flex-col relative bg-[#efeae2] ${!activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                {activeBuyerId ? (
                    <>
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-3 border-b z-10">
                            <button onClick={() => {setActiveBuyerId(null); router.push('/seller/messages');}} className="md:hidden"><ArrowLeft size={24}/></button>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{tempBuyerName.charAt(0)}</div>
                            <h2 className="font-medium">{tempBuyerName}</h2>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:px-16" ref={scrollRef} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.sender === 'seller' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                                        
                                        {/* Offer UI */}
                                        {msg.type === 'OFFER' && (
                                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="font-bold text-yellow-800 text-xs uppercase mb-1">
                                                    {msg.sender === 'user' ? 'Buyer Proposed' : 'You Offered'}
                                                </p>
                                                <p className="text-lg font-bold">₹{msg.offerAmount}</p>
                                                {/* If Buyer sent proposal, Seller sees Accept button */}
                                                {msg.sender === 'user' && msg.offerStatus === 'PENDING' && (
                                                    <button onClick={() => handleConfirmProposal(msg._id)} className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs font-bold">
                                                        Accept Proposal
                                                    </button>
                                                )}
                                                {msg.offerStatus === 'ACCEPTED' && <span className="text-xs text-green-600 font-bold">✅ DEAL AGREED</span>}
                                            </div>
                                        )}

                                        <div>{msg.message}</div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ACCEPT DEAL INPUT AREA */}
                        {showDealInput && (
                            <div className="p-3 bg-white border-t border-gray-200 animate-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500">ACCEPT AMOUNT (FINAL OFFER)</span>
                                    <button onClick={() => setShowDealInput(false)}><X size={16} className="text-gray-400"/></button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Enter Amount (₹)" 
                                        className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={dealAmount}
                                        onChange={(e) => setDealAmount(e.target.value)}
                                    />
                                    <button onClick={handleAcceptDeal} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}

                        <footer className="bg-[#f0f2f5] min-h-[62px] px-4 py-2 flex items-center gap-3 z-10">
                            <button 
                                onClick={() => setShowDealInput(!showDealInput)}
                                className="bg-white border border-gray-300 text-blue-700 px-3 py-2 rounded-full text-xs font-bold hover:bg-blue-50 shadow-sm whitespace-nowrap"
                            >
                                Accept Deal
                            </button>
                            <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message" className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-0" />
                            </div>
                            <button onClick={handleSend} disabled={!input.trim()} className="text-[#54656f]"><Send size={24} /></button>
                        </footer>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500">Select a chat</div>
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
