"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2, User, CheckCircle, X } from 'lucide-react';

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
    const [showDealInput, setShowDealInput] = useState(false);
    const [dealAmount, setDealAmount] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/seller-conversations');
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
                // Auto-update name if active buyer is in list
                if(activeBuyerId) {
                    const current = data.data.find((c:any) => c._id === activeBuyerId);
                    if(current) setTempBuyerName(current.buyer.name);
                }
            }
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
        const interval = setInterval(fetchConversations, 5000); 
        return () => clearInterval(interval);
    }, [activeBuyerId]);

    useEffect(() => {
        if (activeBuyerId) {
            fetchMessages(activeBuyerId);
            const interval = setInterval(() => fetchMessages(activeBuyerId), 3000); 
            return () => clearInterval(interval);
        }
    }, [activeBuyerId]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, activeBuyerId]);

    const handleSend = async () => {
        if (!input.trim() || !activeBuyerId) return;
        
        const tempMsg: Message = { _id: Date.now().toString(), sender: 'seller', message: input, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        const msgToSend = input;
        setInput("");

        try {
            await fetch('/api/chat/seller-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: activeBuyerId, message: msgToSend, buyerName: tempBuyerName })
            });
            fetchMessages(activeBuyerId);
        } catch (e) { alert("Failed to send"); }
    };

    const handleAcceptDeal = async () => {
        if (!dealAmount || isNaN(Number(dealAmount))) return alert("Invalid amount");
        try {
            await fetch('/api/chat/offer/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sellerId: activeBuyerId, 
                    amount: Number(dealAmount),
                    description: `Seller Accepted Price: ₹${dealAmount}`,
                    sender: 'seller'
                })
            });
            setDealAmount("");
            setShowDealInput(false);
            if (activeBuyerId) fetchMessages(activeBuyerId);
        } catch (e) { alert("Failed to send offer"); }
    };

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
        <div className="flex h-[100dvh] bg-[#e5ddd5] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20 h-full ${activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b flex-shrink-0">
                    <User size={20} className="text-gray-500" /> <span className="font-bold text-gray-700">Inbox</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div key={conv._id} onClick={() => {setActiveBuyerId(conv._id); setTempBuyerName(conv.buyer.name);}} className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-[#f5f6f6] ${activeBuyerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                                {conv.buyer.name ? conv.buyer.name.charAt(0) : 'U'}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-medium text-black truncate">{conv.buyer.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`flex-1 flex flex-col relative bg-[#efeae2] h-full ${!activeBuyerId ? 'hidden md:flex' : 'flex'}`}>
                {activeBuyerId ? (
                    <>
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-3 border-b z-10 flex-shrink-0">
                            <button onClick={() => {setActiveBuyerId(null); router.push('/seller/messages');}} className="md:hidden p-1">
                                <ArrowLeft size={24} className="text-gray-600"/>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                                {tempBuyerName.charAt(0)}
                            </div>
                            <h2 className="font-medium text-black truncate">{tempBuyerName}</h2>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:px-16" ref={scrollRef} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm text-black ${msg.sender === 'seller' ? 'bg-[#d9fdd3] text-black' : 'bg-white text-black'}`}>
                                        
                                        {msg.type === 'OFFER' && (
                                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="font-bold text-yellow-800 text-xs uppercase mb-1">{msg.sender === 'user' ? 'Buyer Proposed' : 'You Offered'}</p>
                                                <p className="text-lg font-bold text-black">₹{msg.offerAmount}</p>
                                                {msg.sender === 'user' && msg.offerStatus === 'PENDING' && (
                                                    <button onClick={() => handleConfirmProposal(msg._id)} className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs font-bold">Accept Proposal</button>
                                                )}
                                                {msg.offerStatus === 'ACCEPTED' && <span className="text-xs text-green-600 font-bold">✅ DEAL AGREED</span>}
                                            </div>
                                        )}

                                        <div className="text-black break-words">{msg.message}</div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex-shrink-0 bg-[#f0f2f5] z-10 border-t border-gray-200 w-full p-2">
                            {showDealInput && (
                                <div className="p-3 mb-2 bg-white border border-gray-200 rounded-lg animate-in slide-in-from-bottom-2 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">ACCEPT PRICE</span>
                                        <button onClick={() => setShowDealInput(false)}><X size={16} className="text-gray-400"/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Amount (₹)" className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black" value={dealAmount} onChange={(e) => setDealAmount(e.target.value)} />
                                        <button onClick={handleAcceptDeal} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Send</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowDealInput(!showDealInput)} className="bg-white border border-gray-300 text-blue-600 p-2.5 rounded-full hover:bg-blue-50 shadow-sm flex-shrink-0">
                                    <CheckCircle size={20}/>
                                </button>
                                <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 border border-gray-300">
                                    <input 
                                        value={input} 
                                        onChange={(e) => setInput(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                                        placeholder="Type a message" 
                                        className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-0 text-black placeholder:text-gray-500 outline-none" 
                                    />
                                </div>
                                <button onClick={handleSend} disabled={!input.trim()} className="text-[#54656f] hover:text-blue-600 p-2.5 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition flex-shrink-0">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
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