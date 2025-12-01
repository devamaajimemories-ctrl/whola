"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, MessageSquare, CheckCircle, Loader2, ArrowLeft, ShieldCheck, DollarSign } from 'lucide-react';

// --- Interfaces ---
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

interface Conversation {
    _id: string; // This is the Seller ID
    sellerName: string;
    sellerCity: string;
    lastMessage: string;
    lastDate: string;
    isVerified: boolean;
}

function MessagesContent() {
    const searchParams = useSearchParams();
    const urlSellerId = searchParams.get('sellerId');

    // --- State ---
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    
    // --- Loading States ---
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // --- Refs ---
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- 1. Fetch List of Sellers (Conversations) ---
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) {
                // 🚨 FIX: Correctly map the nested API response to flat UI structure
                const formatted: Conversation[] = data.data.map((item: any) => ({
                    _id: item._id, // This matches the sellerId
                    sellerName: item.seller?.name || "Unknown Seller",
                    sellerCity: item.seller?.city || "",
                    isVerified: item.seller?.isVerified || false,
                    lastMessage: item.lastMessage,
                    lastDate: item.lastDate
                }));
                setConversations(formatted);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    // --- 2. Fetch Chat History for a Seller ---
    const fetchMessages = async (sellerId: string) => {
        if (!sellerId) return;
        // Only show spinner if we don't have messages yet
        if (messages.length === 0) setLoadingMessages(true);
        
        try {
            const res = await fetch(`/api/chat/history?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // --- Effects ---
    
    // Initial Load & Polling for List
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Handle Deep Link from URL (e.g. coming from Dashboard)
    useEffect(() => {
        if (urlSellerId) {
            setSelectedSellerId(urlSellerId);
        }
    }, [urlSellerId]);

    // Poll Messages when a chat is active
    useEffect(() => {
        if (selectedSellerId) {
            fetchMessages(selectedSellerId);
            const interval = setInterval(() => fetchMessages(selectedSellerId), 3000); // Poll every 3s
            return () => clearInterval(interval);
        }
    }, [selectedSellerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loadingMessages, selectedSellerId]);


    // --- Actions ---

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedSellerId) return;

        const tempMessage = newMessage;
        setNewMessage(""); // Clear input immediately

        // Optimistic Update
        setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            sender: 'user',
            message: tempMessage,
            type: 'TEXT',
            createdAt: new Date().toISOString()
        }]);

        await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: selectedSellerId, message: tempMessage })
        });
        
        fetchMessages(selectedSellerId); // Sync with server
        fetchConversations(); // Update "Last Message" in list
    };

    const handleApprovePay = async (messageId: string, sellerId: string, amount: number | undefined) => {
        if (!confirm(`Proceed to payment of ₹${amount}?`)) return;
        setProcessingId(messageId);

        const res = await fetch('/api/chat/offer/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, sellerId })
        });

        const data = await res.json();
        if (res.ok && data.link) {
            window.open(data.link, '_blank');
        } else {
            alert(data.error || "Error generating link");
        }
        setProcessingId(null);
        fetchMessages(sellerId);
    };

    // --- Helper to get current active conversation details ---
    const activeConv = conversations.find(c => c._id === selectedSellerId);
    
    const formatTime = (iso: string) => {
        if(!iso) return "";
        const d = new Date(iso);
        return d.toLocaleDateString() === new Date().toLocaleDateString() 
            ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            : d.toLocaleDateString();
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
            
            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full bg-white md:my-4 md:rounded-xl shadow-xl border border-gray-200 relative">

                {/* ================= LEFT SIDE: SELLER LIST ================= */}
                {/* Logic: On Mobile, hide this list if a chat is selected */}
                <div className={`flex-col w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white ${selectedSellerId ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center h-16">
                        <h2 className="font-bold text-lg text-gray-800">My Chats</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                            {conversations.length}
                        </span>
                    </div>

                    {/* List Items */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (
                            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <MessageSquare className="mx-auto mb-2 opacity-20" size={40} />
                                No conversations yet. <br/> Contact a seller to start.
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedSellerId(conv._id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all ${
                                        selectedSellerId === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 truncate pr-2 flex items-center gap-1">
                                            {conv.sellerName}
                                            {conv.isVerified && <ShieldCheck size={14} className="text-green-600" />}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                            {formatTime(conv.lastDate)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ================= RIGHT SIDE: CHAT WINDOW ================= */}
                {/* Logic: On Mobile, hide this unless a chat is selected */}
                <div className={`flex-col w-full md:w-2/3 lg:w-3/4 bg-slate-50 ${selectedSellerId ? 'flex' : 'hidden md:flex'}`}>
                    
                    {selectedSellerId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 bg-white border-b border-gray-200 flex items-center shadow-sm z-10 h-16">
                                {/* BACK BUTTON (Mobile Only) */}
                                <button 
                                    onClick={() => setSelectedSellerId(null)}
                                    className="mr-3 md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {activeConv?.sellerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                                        {activeConv?.sellerName}
                                        {activeConv?.isVerified && <ShieldCheck size={16} className="text-green-500"/>}
                                    </h3>
                                    {activeConv?.sellerCity && (
                                        <p className="text-xs text-gray-500">{activeConv.sellerCity}</p>
                                    )}
                                </div>
                            </div>

                            {/* Messages Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ded8] bg-opacity-30">
                                {loadingMessages ? (
                                    <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400"/></div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.type === 'OFFER' || msg.type === 'PAYMENT_LINK' ? (
                                                // --- DEAL CARD ---
                                                <div className={`max-w-[85%] md:max-w-[60%] border rounded-xl p-4 shadow-sm bg-white border-l-4 ${msg.sender === 'seller' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                                                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                                                        <span className="text-xs font-bold uppercase text-gray-500">
                                                            {msg.sender === 'seller' ? 'Seller Offer' : 'Your Proposal'}
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-900 text-sm px-2 py-0.5 rounded font-bold">
                                                            ₹{msg.offerAmount}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{msg.message}</p>

                                                    {/* Action Buttons */}
                                                    {msg.sender === 'seller' && msg.offerStatus === 'PENDING' && msg.type === 'OFFER' && (
                                                        <button
                                                            onClick={() => handleApprovePay(msg._id, selectedSellerId, msg.offerAmount)}
                                                            disabled={!!processingId}
                                                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center shadow-md transition-all active:scale-95 gap-2"
                                                        >
                                                            {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
                                                            Accept & Pay
                                                        </button>
                                                    )}

                                                    {msg.type === 'PAYMENT_LINK' && msg.paymentLink && (
                                                        <a href={msg.paymentLink} target="_blank" className="block w-full bg-blue-600 text-white text-center font-bold py-2 rounded-lg mt-2 shadow hover:bg-blue-700 text-sm">
                                                            Pay Securely Now
                                                        </a>
                                                    )}

                                                    {msg.offerStatus === 'ACCEPTED' && (
                                                        <div className="mt-2 bg-green-50 text-green-700 text-xs font-bold p-2 rounded text-center flex items-center justify-center gap-1">
                                                            <CheckCircle size={14}/> Deal Accepted
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // --- TEXT MESSAGE ---
                                                <div className={`max-w-[80%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${
                                                    msg.sender === 'user' 
                                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                                }`}>
                                                    {msg.message}
                                                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {formatTime(msg.createdAt)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // --- EMPTY STATE (Desktop) ---
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">Your Messages</h3>
                            <p className="text-center mt-2 max-w-md text-sm">
                                Select a seller from the list to view chat history, negotiate prices, and make secure payments.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}