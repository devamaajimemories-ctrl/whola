"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, ArrowLeft, ShieldCheck, MoreVertical, 
    Phone, Loader2, ShoppingBag, Search, CheckCircle, Clock 
} from 'lucide-react';

interface Conversation {
    _id: string; // This is the sellerId
    lastMessage: string;
    lastDate: string;
    seller: {
        name: string;
        city: string;
        category: string;
        isVerified: boolean;
    };
    isAccepted?: boolean;
}

interface Message {
    _id: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    type: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
    offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    paymentLink?: string;
    createdAt: string;
}

export default function BuyerMessagesPage() {
    // UI State
    const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Input State
    const [newMessage, setNewMessage] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Load Conversations (Inbox)
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    // 2. Load Messages when a seller is selected
    useEffect(() => {
        if (selectedSellerId) {
            fetchMessages(selectedSellerId);
            const interval = setInterval(() => fetchMessages(selectedSellerId), 3000); // Poll chat fast
            return () => clearInterval(interval);
        }
    }, [selectedSellerId]);

    // 3. Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error("Failed to load inbox");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/chat/history?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Failed to load chat");
        }
    };

    const handleSellerClick = (sellerId: string) => {
        setSelectedSellerId(sellerId);
        setMobileView('CHAT'); // Switch to chat view on mobile
        fetchMessages(sellerId);
    };

    const handleBackToList = () => {
        setMobileView('LIST');
        setSelectedSellerId(null);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSellerId) return;
        setIsSending(true);

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sellerId: selectedSellerId, 
                    message: newMessage 
                })
            });
            setNewMessage("");
            fetchMessages(selectedSellerId);
        } catch (error) {
            alert("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    // Buyer Action: Approve Deal & Pay
    const handleApproveDeal = async (messageId: string) => {
        if (!confirm("Approve this deal and proceed to secure payment?")) return;
        setProcessingId(messageId);

        try {
            const res = await fetch('/api/chat/offer/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, sellerId: selectedSellerId })
            });
            const data = await res.json();
            
            if (data.success && data.link) {
                window.location.href = data.link; // Redirect to Razorpay
            } else {
                alert(data.error || "Payment generation failed");
            }
        } catch (error) {
            alert("Error processing deal");
        } finally {
            setProcessingId(null);
        }
    };

    const activeSeller = conversations.find(c => c._id === selectedSellerId)?.seller;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden font-sans">
            
            {/* --- LEFT SIDEBAR (Seller List) --- */}
            <div className={`
                w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full
                ${mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Search / Header */}
                <div className="p-4 border-b border-gray-100 bg-white z-10">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search sellers..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <ShoppingBag className="mx-auto mb-2 text-gray-300" size={32} />
                            <p>No messages yet.</p>
                            <p className="text-xs mt-1">Contact sellers from search results.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div 
                                key={conv._id}
                                onClick={() => handleSellerClick(conv._id)}
                                className={`
                                    flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50
                                    ${selectedSellerId === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}
                                `}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                                        {conv.seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    {conv.seller.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                                            <ShieldCheck className="text-green-500 w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate pr-2">
                                            {conv.seller.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(conv.lastDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                            {conv.seller.city || 'India'}
                                        </span>
                                        {conv.isAccepted && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle size={10} /> Deal Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDE (Chat Window) --- */}
            <div className={`
                flex-1 flex flex-col h-full bg-[#f0f2f5] relative
                ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}
            `}>
                {selectedSellerId && activeSeller ? (
                    <>
                        {/* Header */}
                        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleBackToList}
                                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {activeSeller.name.charAt(0)}
                                </div>
                                
                                <div>
                                    <h2 className="font-bold text-gray-800 flex items-center gap-1.5">
                                        {activeSeller.name}
                                        {activeSeller.isVerified && <ShieldCheck size={14} className="text-green-500" />}
                                    </h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {activeSeller.category} • {activeSeller.city}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/chat-bg-pattern.png')] bg-repeat bg-opacity-5">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative text-sm
                                        ${msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : msg.type === 'OFFER' ? 'bg-white border-2 border-orange-200 w-full md:w-auto' 
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}
                                    `}>
                                        {/* SPECIAL MESSAGE TYPE: OFFER */}
                                        {msg.type === 'OFFER' && (
                                            <div className="mb-2 pb-2 border-b border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                                                        Seller Offer
                                                    </span>
                                                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                                        ₹{msg.offerAmount}
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 font-medium">
                                                    {msg.message.split('\n')[1] || "Deal Offered"}
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Content */}
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.type === 'OFFER' 
                                                ? "Please review the offer details above." 
                                                : msg.message
                                            }
                                        </div>

                                        {/* ACTION BUTTONS */}
                                        {msg.type === 'OFFER' && msg.offerStatus === 'PENDING' && msg.sender === 'seller' && (
                                            <button
                                                onClick={() => handleApproveDeal(msg._id)}
                                                disabled={!!processingId}
                                                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                            >
                                                {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : "✅ Approve & Pay"}
                                            </button>
                                        )}

                                        {/* PAYMENT LINK */}
                                        {msg.type === 'PAYMENT_LINK' && (
                                            <a 
                                                href={msg.paymentLink} 
                                                target="_blank" 
                                                className="mt-2 block w-full bg-blue-600 text-white text-center py-2 rounded font-bold hover:bg-blue-700"
                                            >
                                                Pay Now
                                            </a>
                                        )}

                                        {/* Time Stamp */}
                                        <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-3 border-t border-gray-200">
                            <div className="flex gap-2 items-end max-w-4xl mx-auto">
                                <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Type your message..."
                                        className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm text-gray-800 placeholder-gray-500"
                                        rows={1}
                                        style={{ minHeight: '24px' }}
                                    />
                                </div>
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isSending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="text-gray-400" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Welcome to Messages</h2>
                        <p className="text-center max-w-xs mb-6">
                            Select a seller from the list to start chatting, negotiate prices, and close deals securely.
                        </p>
                        <div className="flex gap-2 text-xs bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span>Payments secured by Escrow</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
