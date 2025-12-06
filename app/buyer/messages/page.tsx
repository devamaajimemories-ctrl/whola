"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2, User, Check, X, CheckCircle } from 'lucide-react';

interface Conversation {
    _id: string; 
    lastMessage: string;
    seller: { name: string; };
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
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeSellerId, setActiveSellerId] = useState<string | null>(initialSellerId);
    const [activeSellerName, setActiveSellerName] = useState<string>("Supplier");
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Deals & Orders
    const [showDealInput, setShowDealInput] = useState(false);
    const [dealAmount, setDealAmount] = useState("");
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [completingTask, setCompletingTask] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch conversations list
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
                if(activeSellerId) {
                    const activeConv = data.data.find((c: any) => c._id === activeSellerId);
                    if(activeConv) setActiveSellerName(activeConv.seller.name);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // Fetch messages for active chat
    const fetchMessages = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/chat/history?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success) setMessages(data.data);
        } catch (e) { console.error(e); }
    };

    // Check for active orders
    const checkActiveOrder = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/orders/check-active?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success && data.activeOrder) {
                setActiveOrder(data.activeOrder);
            } else {
                setActiveOrder(null);
            }
        } catch (e) { console.error(e); }
    };

    // Polling intervals
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [activeSellerId]);

    useEffect(() => {
        if (activeSellerId) {
            fetchMessages(activeSellerId);
            checkActiveOrder(activeSellerId);
            const interval = setInterval(() => {
                fetchMessages(activeSellerId);
                checkActiveOrder(activeSellerId);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [activeSellerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !activeSellerId) return;
        
        const tempMsg: Message = { _id: Date.now().toString(), sender: 'user', message: input, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        const msgToSend = input;
        setInput("");

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: activeSellerId, message: msgToSend })
            });
            fetchMessages(activeSellerId);
            fetchConversations();
        } catch (e) { alert("Failed to send"); }
    };

    const handleProposeDeal = async () => {
        if (!dealAmount || isNaN(Number(dealAmount))) return alert("Invalid Amount");
        try {
            await fetch('/api/chat/offer/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId: activeSellerId, amount: Number(dealAmount), description: `Buyer proposed price: ₹${dealAmount}`, sender: 'user' })
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
        if(!activeOrder) return alert("No active order.");
        if(!confirm(`Confirm delivery for Order #${activeOrder.orderId}?`)) return;
        setCompletingTask(true);
        try {
            const res = await fetch('/api/orders/confirm-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: activeOrder.orderId })
            });
            if((await res.json()).success) { alert("Order completed!"); setActiveOrder(null); }
        } catch(e) { alert("Error."); }
        finally { setCompletingTask(false); }
    };

    return (
        <div className="flex h-[100dvh] bg-[#e5ddd5] font-sans overflow-hidden">
            <aside className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#d1d7db] flex flex-col z-20 h-full ${activeSellerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b flex-shrink-0">
                    <User size={20} className="text-gray-500" /> <span className="font-bold text-gray-700">Suppliers</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> : 
                        conversations.map((conv) => (
                            <div key={conv._id} onClick={() => {setActiveSellerId(conv._id); setActiveSellerName(conv.seller.name);}} className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-[#f5f6f6] ${activeSellerId === conv._id ? 'bg-[#f0f2f5]' : ''}`}>
                                <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-gray-600 flex-shrink-0">{conv.seller.name.charAt(0)}</div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-black truncate">{conv.seller.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </aside>

            <main className={`flex-1 flex flex-col relative bg-[#efeae2] h-full ${!activeSellerId ? 'hidden md:flex' : 'flex'}`}>
                {activeSellerId ? (
                    <>
                        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b z-10 shadow-sm flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => {setActiveSellerId(null); router.push('/buyer/messages');}} className="md:hidden p-1"><ArrowLeft size={24} className="text-gray-600"/></button>
                                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-gray-600">{activeSellerName.charAt(0)}</div>
                                <h2 className="font-medium text-black truncate">{activeSellerName}</h2>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef} style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#d9fdd3] text-black rounded-tr-none' : 'bg-white text-black rounded-tl-none'}`}>
                                        
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

                                        <div className="text-black break-words">{msg.message}</div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1 min-w-[40px]">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-shrink-0 bg-[#f0f2f5] z-10 border-t border-gray-200 w-full p-2">
                            {showDealInput && (
                                <div className="p-3 mb-2 bg-white border border-gray-200 rounded-lg animate-in slide-in-from-bottom-2 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-500">PROPOSE PRICE</span>
                                        <button onClick={() => setShowDealInput(false)}><X size={16} className="text-gray-400"/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Amount (₹)" className="flex-1 border rounded px-3 py-2 text-sm outline-none" value={dealAmount} onChange={(e) => setDealAmount(e.target.value)} />
                                        <button onClick={handleProposeDeal} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">Send</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowDealInput(!showDealInput)} className="bg-white border border-gray-300 text-green-700 p-2.5 rounded-full hover:bg-green-50 shadow-sm flex-shrink-0">
                                    <CheckCircle size={20}/>
                                </button>
                                <button onClick={handleTaskCompleted} className={`bg-white border border-gray-300 text-blue-600 p-2.5 rounded-full hover:bg-blue-50 shadow-sm flex-shrink-0 ${activeOrder ? 'animate-pulse ring-2 ring-blue-400' : 'opacity-50'}`} disabled={!activeOrder}>
                                    <Check size={20}/>
                                </button>
                                <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 border border-gray-300">
                                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message" className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-0 text-black placeholder:text-gray-500 outline-none" />
                                </div>
                                <button onClick={handleSend} disabled={!input.trim()} className="text-[#54656f] hover:text-green-600 p-2.5 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition flex-shrink-0">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="bg-gray-200 p-4 rounded-full mb-4"><User size={48} className="text-gray-400"/></div>
                        <p>Select a supplier to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
}

// Ensure this is the Default Export
export default function BuyerMessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BuyerChatInterface />
        </Suspense>
    );
}