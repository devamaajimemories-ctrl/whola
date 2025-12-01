"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, MessageSquare, CheckCircle, Loader2, ArrowLeft, ShieldCheck, User } from 'lucide-react';

// --- Types ---
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
    _id: string; // The Seller ID
    sellerName: string;
    sellerCity: string;
    lastMessage: string;
    lastDate: string;
    unreadCount: number;
    isVerified: boolean;
}

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSellerId = searchParams.get('sellerId');

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    
    // Loading States
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Scroll & Refs
    const [shouldScroll, setShouldScroll] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations (The List on the Left)
    const fetchConversations = async () => {
        // Don't set loading true on every poll to prevent flickering
        if (conversations.length === 0) setLoadingConversations(true);
        
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) {
                // Map API response to our UI structure
                const formatted: Conversation[] = data.data.map((item: any) => ({
                    _id: item._id, // This is the sellerId
                    sellerName: item.seller?.name || "Unknown Seller",
                    sellerCity: item.seller?.city || "",
                    isVerified: item.seller?.isVerified || false,
                    lastMessage: item.lastMessage,
                    lastDate: item.lastDate,
                    unreadCount: 0 // API can be updated to provide this later
                }));
                setConversations(formatted);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    // 2. Fetch Chat History (The Messages on the Right)
    const fetchMessages = async (sellerId: string) => {
        if (!sellerId) return;
        // Only show loading spinner on first load of a specific chat
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

    // Initial Load & Polling
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    // Handle URL Parameter (Deep Linking)
    useEffect(() => {
        if (urlSellerId) {
            setSelectedSellerId(urlSellerId);
            setShouldScroll(true);
        }
    }, [urlSellerId]);

    // Poll Messages when a chat is selected
    useEffect(() => {
        if (selectedSellerId) {
            fetchMessages(selectedSellerId);
            const interval = setInterval(() => fetchMessages(selectedSellerId), 3000); // Poll chat every 3s
            return () => clearInterval(interval);
        }
    }, [selectedSellerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (shouldScroll || (messages.length > 0 && !loadingMessages)) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShouldScroll(false);
        }
    }, [messages, shouldScroll, loadingMessages]);

    const handleSelectConversation = (sellerId: string) => {
        setSelectedSellerId(sellerId);
        setMessages([]); // Clear previous chat immediately
        setLoadingMessages(true);
        setShouldScroll(true);
        fetchMessages(sellerId);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedSellerId) return;

        const messageToSend = newMessage;
        setNewMessage("");
        setShouldScroll(true);

        // Optimistic UI Update
        const optimisiticMsg: Message = {
            _id: Date.now().toString(),
            sender: 'user',
            message: messageToSend,
            type: 'TEXT',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisiticMsg]);

        await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: selectedSellerId, message: messageToSend })
        });
        
        fetchMessages(selectedSellerId); // Refresh to get server timestamp/ID
        fetchConversations(); // Refresh list to update "Last Message"
    };

    // Payment Logic
    const handleApprovePay = async (messageId: string, sellerId: string, offerAmount: number | undefined) => {
        if (!confirm(`Proceed to payment of ₹${offerAmount}?`)) return;
        if (!offerAmount) return alert("Error: Offer amount missing.");

        setProcessingId(messageId);
        try {
            const res = await fetch('/api/chat/offer/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, sellerId })
            });
            const data = await res.json();

            if (res.ok && data.link) {
                window.open(data.link, '_blank');
            } else {
                alert(data.error || "Failed to generate payment link.");
            }
        } catch(e) { alert("Network Error"); }
        setProcessingId(null);
        fetchMessages(sellerId);
    };

    const selectedConversation = conversations.find(c => c._id === selectedSellerId);
    
    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString() === new Date().toLocaleDateString() 
            ? d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
            : d.toLocaleDateString();
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 overflow-hidden">
            
            {/* Main Container */}
            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full shadow-xl bg-white md:my-4 md:rounded-xl border border-gray-200">

                {/* LEFT SIDEBAR: Conversations List */}
                {/* Hidden on mobile if a chat is selected */}
                <div className={`flex-col w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white ${selectedSellerId ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-800">Active Chats</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                            {conversations.length}
                        </span>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (
                            <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-blue-600"/></div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No conversations yet. <br/> Post a requirement to get started.
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv._id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all ${
                                        selectedSellerId === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 truncate pr-2 flex items-center gap-1">
                                            {conv.sellerName}
                                            {conv.isVerified && <ShieldCheck size={14} className="text-green-600" />}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {formatTime(conv.lastDate)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                    {conv.sellerCity && (
                                        <span className="text-[10px] text-gray-400 mt-1 block">{conv.sellerCity}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Chat Window */}
                {/* Hidden on mobile if NO chat is selected */}
                <div className={`flex-col w-full md:w-2/3 lg:w-3/4 bg-gray-50 ${selectedSellerId ? 'flex' : 'hidden md:flex'}`}>
                    
                    {selectedSellerId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
                                {/* Back Button (Mobile Only) */}
                                <button 
                                    onClick={() => setSelectedSellerId(null)}
                                    className="mr-3 md:hidden p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow">
                                    {selectedConversation?.sellerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        {selectedConversation?.sellerName}
                                        {selectedConversation?.isVerified && <ShieldCheck size={16} className="text-green-500"/>}
                                    </h3>
                                    <p className="text-xs text-green-600 flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online
                                    </p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/50">
                                {loadingMessages ? (
                                    <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-400"/></div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.type === 'OFFER' || msg.type === 'PAYMENT_LINK' ? (
                                                // Deal/Offer Card
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
                                                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center shadow-md transition-all active:scale-95"
                                                        >
                                                            {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : "Accept & Pay"}
                                                        </button>
                                                    )}

                                                    {msg.type === 'PAYMENT_LINK' && msg.paymentLink && (
                                                        <a href={msg.paymentLink} target="_blank" className="block w-full bg-blue-600 text-white text-center font-bold py-2 rounded-lg mt-2 shadow hover:bg-blue-700">
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
                                                // Standard Text Message
                                                <div className={`max-w-[80%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
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

                            {/* Input Area */}
                            <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your message..."
                                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Empty State
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">Your Messages</h3>
                            <p className="text-center mt-2 max-w-md">
                                Select a conversation from the list to view chat history and negotiate with sellers.
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
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}