"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Menu, MessageSquare, DollarSign, CheckCircle, Loader2, X, AlertTriangle } from 'lucide-react';

// Interfaces (Assuming they exist or are imported correctly, defined here for context)
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
    _id: string;
    partnerId: string;
    partnerName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function MessagesPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showMobileConversations, setShowMobileConversations] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Logic to find the latest pending seller offer (for the persistent button)
    const latestPendingOffer = useMemo(() => {
        return messages
            .slice()
            .reverse()
            .find(msg => msg.type === 'OFFER' && msg.sender === 'seller' && msg.offerStatus === 'PENDING');
    }, [messages]);

    // New handler to trigger the payment action on the latest pending offer
    const handlePersistentApprovePay = () => {
        if (latestPendingOffer && selectedSellerId) {
            handleApprovePay(latestPendingOffer._id, selectedSellerId, latestPendingOffer.offerAmount);
        }
    };

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
                if (data.data.length > 0 && !selectedSellerId) {
                    setSelectedSellerId(data.data[0].partnerId);
                }
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (sellerId: string) => {
        if (!sellerId) return;
        setLoadingMessages(true);
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

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedSellerId) {
            fetchMessages(selectedSellerId);
            const interval = setInterval(() => fetchMessages(selectedSellerId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedSellerId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConversation = (sellerId: string) => {
        setSelectedSellerId(sellerId);
        setMessages([]);
        setNewMessage("");
        fetchMessages(sellerId);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedSellerId) return;

        const messageToSend = newMessage;
        setNewMessage("");

        // Optimistic update
        setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            sender: 'user',
            message: messageToSend,
            type: 'TEXT',
            createdAt: new Date().toISOString()
        }]);

        const res = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: selectedSellerId, message: messageToSend })
        });

        if (res.ok) {
            // Re-fetch to get server-validated message and update conversations
            fetchConversations();
            fetchMessages(selectedSellerId);
        } else {
            // Rollback optimistic update if needed, or just rely on the next fetch
            console.error("Failed to send message");
        }
    };

    const handleApprovePay = async (messageId: string, sellerId: string, offerAmount: number | undefined) => {
        if (!confirm(`Approve this deal of ₹${offerAmount} and proceed to payment via Razorpay? This will initiate the escrow process.`)) return;
        if (!offerAmount) return alert("Offer amount is missing.");

        setProcessingId(messageId);

        const res = await fetch('/api/chat/offer/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, sellerId, amount: offerAmount })
        });

        const data = await res.json();

        if (res.ok && data.link) {
            window.open(data.link, '_blank');
            // Optimistically update status to show 'Payment Pending'
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, offerStatus: 'ACCEPTED' } : msg
            ));
        } else {
            alert(data.error || "Failed to generate payment link.");
        }
        setProcessingId(null);
        fetchMessages(sellerId);
    };


    const selectedConversation = conversations.find(c => c.partnerId === selectedSellerId);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    }

    return (
        <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
            <header className="bg-white shadow-md p-4 flex-shrink-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center">
                        <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
                        My Messages (Buyer)
                    </h1>
                    <button
                        onClick={() => setShowMobileConversations(!showMobileConversations)}
                        className="text-gray-600 hover:text-indigo-600 lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="container mx-auto p-0 sm:p-4 flex gap-4 flex-1 overflow-hidden h-full">
                {/* LEFT COLUMN: Conversations List */}
                <div className={`${showMobileConversations ? 'fixed inset-0 z-50 bg-white' : 'hidden'
                    } lg:block lg:relative lg:w-80 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-y-auto flex-shrink-0`}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Active Chats
                        </h2>
                        <button
                            onClick={() => setShowMobileConversations(false)}
                            className="lg:hidden text-gray-600 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {loadingConversations ? (
                        <div className="p-4 text-center text-gray-500 flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2 w-4 h-4" /> Loading...
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => {
                                    handleSelectConversation(conv.partnerId);
                                    setShowMobileConversations(false);
                                }}
                                className={`flex items-center p-4 cursor-pointer border-b border-gray-100 transition-colors ${conv.partnerId === selectedSellerId ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{conv.partnerName}</h3>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* RIGHT COLUMN: Chat Window */}
                <div className="flex-1 bg-white sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                    {selectedSellerId && selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center flex-shrink-0">
                                <h3 className="text-lg font-bold text-gray-900">{selectedConversation.partnerName}</h3>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <Loader2 className="animate-spin mr-2 w-5 h-5" /> Loading Messages...
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.type === 'OFFER' || msg.type === 'PAYMENT_LINK' ? (
                                                <div className={`max-w-[80%] border rounded-xl p-4 shadow-sm ${msg.sender === 'seller' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                            {msg.sender === 'seller' ? 'Seller Offer' : 'Your Proposal'}
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-800 text-sm px-2 py-0.5 rounded-full font-bold">
                                                            ₹{msg.offerAmount}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{msg.message}</p>

                                                    {/* BUYER'S VIEW: Approve & Pay (Inline) */}
                                                    {msg.sender === 'seller' && msg.offerStatus === 'PENDING' && msg.type === 'OFFER' && (
                                                        <button
                                                            onClick={() => handleApprovePay(msg._id, selectedSellerId, msg.offerAmount)}
                                                            disabled={!!processingId}
                                                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center shadow-md disabled:opacity-50 mt-2"
                                                        >
                                                            {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : "✅ Approve Deal & Pay"}
                                                        </button>
                                                    )}

                                                    {/* PAYMENT LINK */}
                                                    {msg.type === 'PAYMENT_LINK' && msg.paymentLink && (
                                                        <a
                                                            href={msg.paymentLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-full bg-indigo-600 text-white text-center font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-2"
                                                        >
                                                            💳 Complete Secure Payment
                                                        </a>
                                                    )}

                                                    {/* Status Indicator */}
                                                    {msg.offerStatus === 'PENDING' && (
                                                        <p className="text-[10px] text-center text-gray-500 italic mt-2">
                                                            {msg.sender === 'seller' ? 'Awaiting your approval and payment...' : 'Awaiting seller action...'}
                                                        </p>
                                                    )}
                                                    {msg.offerStatus === 'ACCEPTED' && (
                                                        <p className="text-[10px] text-center text-green-600 font-semibold mt-2 flex items-center justify-center">
                                                            <CheckCircle size={12} className="mr-1" /> Deal Accepted. Payment initiated.
                                                        </p>
                                                    )}

                                                </div>
                                            ) : (
                                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                                    {msg.message}
                                                    <div className='text-[10px] opacity-70 mt-1'>
                                                        {formatTime(msg.createdAt)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area (MODIFIED: Removed old Propose button, added dynamic Approve & Pay button) */}
                            <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-shrink-0">
                                {/* NEW PERSISTENT BUTTON - Only shows if a PENDING seller offer exists */}
                                {latestPendingOffer && (
                                    <button
                                        onClick={handlePersistentApprovePay}
                                        disabled={!!processingId}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
                                        title={`Approve the latest offer of ₹${latestPendingOffer.offerAmount}`}
                                    >
                                        {processingId ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle size={16} />}
                                        Approve & Pay ₹{latestPendingOffer.offerAmount}
                                    </button>
                                )}

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message... (Negotiate here)"
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>

                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-500 p-8">
                            <MessageSquare className="w-12 h-12 mb-4 text-indigo-300" />
                            <h3 className="text-xl font-semibold mb-2">Select a Chat to Start Negotiating</h3>
                            <p className="text-center">Your conversations with sellers will appear here. Find a lead in your dashboard to start a chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}