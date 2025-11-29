"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, CheckCircle, Clock, DollarSign, Loader2, Users, ShieldCheck } from 'lucide-react';

interface Conversation {
    _id: string; // buyerId
    lastMessage: string;
    lastDate: string;
    buyer: {
        name: string; // Only name, NO phone/email for PII protection
    };
}

interface Message {
    _id: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    type: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
    offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

export default function SellerMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversation List (Seller's Inbox)
    useEffect(() => {
        fetch('/api/chat/seller-conversations')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConversations(data.data);
                }
                setLoading(false);
            });
    }, []);

    // 2. Fetch Messages for Selected Buyer
    useEffect(() => {
        if (selectedBuyerId) {
            fetchMessages(selectedBuyerId);
            const interval = setInterval(() => fetchMessages(selectedBuyerId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedBuyerId]);

    // 3. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async (buyerId: string) => {
        const res = await fetch(`/api/chat/seller-history?buyerId=${buyerId}`);
        const data = await res.json();
        if (data.success) {
            setMessages(data.data);
        }
    };

    // 4. Send Text Message
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedBuyerId) return;

        await fetch('/api/chat/seller-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerId: selectedBuyerId, message: newMessage })
        });

        setNewMessage("");
        fetchMessages(selectedBuyerId);
    };

    // 5. ACCEPT BUYER PROPOSAL (Seller Action)
    const handleAcceptProposal = async (messageId: string) => {
        if (!confirm("Accept this buyer's proposal?")) return;
        setProcessingId(messageId);

        const res = await fetch('/api/chat/offer/accept-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
        });

        if (res.ok) {
            fetchMessages(selectedBuyerId!);
        }
        setProcessingId(null);
    };

    const selectedConversation = conversations.find(c => c._id === selectedBuyerId);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6 shadow-md">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle size={28} />
                        Seller Messages
                    </h1>
                    <p className="text-green-100 text-sm mt-1">Manage buyer inquiries and proposals</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4">
                <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">

                    {/* LEFT: Conversation List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <Users size={18} />
                                Buyer Chats ({conversations.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin text-gray-400" size={32} />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center text-gray-400 p-8">
                                    <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No buyer messages yet</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv._id}
                                        onClick={() => setSelectedBuyerId(conv._id)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedBuyerId === conv._id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                                {conv.buyer.name}
                                                {/* NO phone/email shown for PII protection */}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {new Date(conv.lastDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Chat Window */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        {selectedBuyerId ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-sm">
                                    <h3 className="font-bold text-lg">{selectedConversation?.buyer.name}</h3>
                                    <p className="text-xs text-green-100 flex items-center gap-1">
                                        <ShieldCheck size={12} />
                                        Verified Trade Chat
                                    </p>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.map((msg) => (
                                        <div key={msg._id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.type === 'OFFER' ? (
                                                <div className={`w-4/5 border rounded-xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                                                    }`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                            {msg.sender === 'user' ? 'Buyer Proposal' : 'Your Offer'}
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            ₹{msg.offerAmount}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{msg.message}</p>

                                                    {/* SELLER: Accept Buyer Proposal */}
                                                    {msg.sender === 'user' && msg.offerStatus === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleAcceptProposal(msg._id)}
                                                            disabled={!!processingId}
                                                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center shadow-md disabled:opacity-50 mt-2 transition-colors"
                                                        >
                                                            {processingId === msg._id ? (
                                                                <Loader2 className="animate-spin" size={16} /> 
                                                            ) : (
                                                                `✅ Accept & Finalize Offer ₹${msg.offerAmount}`
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Waiting States */}
                                                    {msg.sender === 'seller' && msg.offerStatus === 'PENDING' && (
                                                        <p className="text-xs text-center text-gray-500 italic">Waiting for buyer...</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'seller' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                    }`}>
                                                    {msg.message}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Bar */}
                                <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Type message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="bg-green-600 text-white p-2 rounded-full shadow-sm hover:bg-green-700 transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MessageCircle size={64} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Select a conversation to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}