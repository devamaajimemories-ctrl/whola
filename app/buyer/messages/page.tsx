"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Send, ArrowLeft, MoreVertical, Phone, Search,
    ShieldCheck, Loader2, MessageSquare, User, Paperclip, Smile, Check, X, CheckCircle
} from 'lucide-react';

interface Conversation {
    _id: string; 
    lastMessage: string;
    lastDate: string;
    seller: {
        name: string;
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
    offerStatus?: 'PENDING' | 'ACCEPTED';
    paymentLink?: string;
}

function BuyerChatInterface() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSellerId = searchParams.get('sellerId');
    const paramSellerName = searchParams.get('sellerName');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeSellerId, setActiveSellerId] = useState<string | null>(initialSellerId);
    const [activeName, setActiveName] = useState<string>(paramSellerName || "Supplier");
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Deal & Order State
    const [showDealInput, setShowDealInput] = useState(false);
    const [dealAmount, setDealAmount] = useState("");
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [completingTask, setCompletingTask] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const checkActiveOrder = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/orders/check-active?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success && data.activeOrder) {
                setActiveOrder(data.activeOrder);
            } else {
                setActiveOrder(null);
            }
        } catch (e) { console.error("Order check failed", e); }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeSellerId) {
            const conv = conversations.find(c => c._id === activeSellerId);
            if (conv) setActiveName(conv.seller.name);
            fetchMessages(activeSellerId);
            checkActiveOrder(activeSellerId);
            const interval = setInterval(() => {
                fetchMessages(activeSellerId);
                checkActiveOrder(activeSellerId);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [activeSellerId, conversations]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, activeSellerId]);

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
            fetchConversations();
        } catch (e) { alert("Failed to send"); }
        finally { setSending(false); }
    };

    const handleProposeDeal = async () => {
        if (!dealAmount || isNaN(Number(dealAmount))) return alert("Invalid Amount");
        try {
            await fetch('/api/chat/offer/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sellerId: activeSellerId, 
                    amount: Number(dealAmount),
                    description: `Buyer proposed price: ₹${dealAmount}`,
                    sender: 'user' 
                })
            });
            setDealAmount("");
            setShowDealInput(false);
            if (activeSellerId) fetchMessages(activeSellerId);
        } catch (e) { alert("Failed to send proposal"); }
    };

    const handlePay = async (messageId: string) => {
        if(!confirm("Approve deal and pay?")) return;
        try {
            const res = await fetch('/api/chat/offer/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, sellerId: activeSellerId })
            });
            const data = await res.json();
            if (data.success && data.link) window.open(data.link, '_blank');
            else alert("Error generating link");
        } catch (e) { alert("Payment error"); }
    };

    const handleTaskCompleted = async () => {
        if(!activeOrder) {
            alert("No active order found. Please ensure you have paid for an order first.");
            return;
        }
        if(!confirm(`Confirm delivery for Order #${activeOrder.orderId}?`)) return;
        setCompletingTask(true);
        try {
            const res = await fetch('/api/orders/confirm-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: activeOrder.orderId })
            });
            const data = await res.json();
            if(data.success) {
                alert("Order completed! Payment released.");
                setActiveOrder(null);
            } else {
                alert(data.error || "Failed to confirm.");
            }
        } catch(e) { alert("Network error."); }
        finally { setCompletingTask(false); }
    };

    const handleBack = () => { setActiveSellerId(null); router.push('/buyer/messages'); };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#e5ddd5] font-sans">
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20 ${activeSellerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b border-[#d1d7db]">
                    <User size={20} className="text-gray-500" />
                    <span className="font-bold text-gray-700">Suppliers</span>
                </div>
                <div className="flex-1 overflow-y-auto bg-white">
                    {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : 
                        conversations.map((conv) => (
                            <div key={conv._id} onClick={() => setActiveSellerId(conv._id)} className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-[#f5f6f6] ${activeSellerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}>
                                <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-gray-600">{conv.seller.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate text-black">{conv.seller.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </aside>

            <main className={`flex-1 flex flex-col relative bg-[#efeae2] ${!activeSellerId ? 'hidden md:flex' : 'flex'}`}>
                {activeSellerId ? (
                    <>
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button onClick={handleBack} className="md:hidden"><ArrowLeft size={24}/></button>
                                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-gray-600">{activeName.charAt(0)}</div>
                                <div><h2 className="font-medium text-black">{activeName}</h2><p className="text-xs text-gray-500">Business Account</p></div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:px-16" ref={scrollRef} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {/* FORCE TEXT BLACK */}
                                    <div className={`relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm text-black ${msg.sender === 'user' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                                        
                                        {msg.type === 'OFFER' && (
                                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="font-bold text-yellow-800 text-xs uppercase mb-1">{msg.sender === 'user' ? 'You Proposed' : 'Seller Offer'}</p>
                                                <p className="text-lg font-bold text-black">₹{msg.offerAmount}</p>
                                                {msg.sender === 'seller' && msg.offerStatus === 'PENDING' && (
                                                    <button onClick={() => handlePay(msg._id)} className="mt-2 w-full bg-green-600 text-white py-1 rounded text-xs font-bold">Accept & Pay</button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {msg.type === 'PAYMENT_LINK' && (
                                            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                                                <p className="font-bold text-green-800 text-xs mb-1">PAYMENT LINK READY</p>
                                                <a href={msg.paymentLink} target="_blank" className="block w-full bg-green-600 text-white text-center py-1 rounded text-xs font-bold">Pay ₹{msg.offerAmount}</a>
                                            </div>
                                        )}

                                        <div>{msg.message}</div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ACTION BAR: Approve & Pay + Task Completed */}
                        <div className="bg-[#f0f2f5] px-4 pt-2 flex flex-col gap-2 border-t border-gray-200">
                            {showDealInput && (
                                <div className="p-3 bg-white border border-gray-200 rounded-lg animate-in slide-in-from-bottom-2 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">APPROVE AMOUNT</span>
                                        <button onClick={() => setShowDealInput(false)}><X size={16} className="text-gray-400"/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Enter Amount (₹)" className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none text-black" value={dealAmount} onChange={(e) => setDealAmount(e.target.value)} />
                                        <button onClick={handleProposeDeal} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700">Send</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 pb-1">
                                <button onClick={() => setShowDealInput(!showDealInput)} className="flex-1 bg-white border border-gray-300 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-50 shadow-sm flex items-center justify-center gap-1">
                                    <CheckCircle size={14}/> Approve & Pay
                                </button>

                                <button 
                                    onClick={handleTaskCompleted}
                                    className={`flex-1 border text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 transition-all ${
                                        activeOrder 
                                        ? 'bg-green-600 border-green-700 hover:bg-green-700 animate-pulse' 
                                        : 'bg-gray-400 border-gray-500 opacity-90'
                                    }`}
                                >
                                    {completingTask ? <Loader2 size={14} className="animate-spin"/> : <Check size={14} />} 
                                    Task Completed
                                </button>
                            </div>
                        </div>

                        <footer className="bg-[#f0f2f5] min-h-[60px] px-4 py-2 flex items-center gap-3 z-10">
                            <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2">
                                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message" className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-0 text-black placeholder:text-gray-500" />
                            </div>
                            <button onClick={handleSend} disabled={!input.trim()} className="text-[#54656f] hover:text-green-600"><Send size={24} /></button>
                        </footer>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500">Select a chat</div>
                )}
            </main>
        </div>
    );
}

export default function BuyerMessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BuyerChatInterface />
        </Suspense>
    );
}