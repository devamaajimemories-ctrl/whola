"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, SendHorizontal, ShieldCheck, DollarSign, CheckCircle, Loader2, Truck, Gavel } from 'lucide-react';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    sellerName: string;
    sellerId: string;
    isSellerView?: boolean;
}

interface Message {
    _id: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    type: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
    offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    paymentLink?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, sellerName, sellerId, isSellerView = false }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [dealAmount, setDealAmount] = useState("");
    const [dealDesc, setDealDesc] = useState("");
    const [showDealInput, setShowDealInput] = useState(false);
    const [showQuickOffer, setShowQuickOffer] = useState(false);
    const [quickOfferAmount, setQuickOfferAmount] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchHistory = () => {
        if (sellerId) {
            const endpoint = isSellerView
                ? `/api/chat/seller-history?buyerId=${sellerId}`
                : `/api/chat/history?sellerId=${sellerId}`;

            fetch(endpoint)
                .then(res => res.json())
                .then(data => { if (data.success) setMessages(data.data); });
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, sellerId, isSellerView]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const endpoint = isSellerView ? '/api/chat/seller-send' : '/api/chat/send';
        const body = isSellerView
            ? { buyerId: sellerId, message: newMessage }
            : { sellerId, message: newMessage };

        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        setNewMessage("");
        fetchHistory();
    };

    const handleCreateProposal = async () => {
        if (!dealAmount || isNaN(Number(dealAmount))) return alert("Invalid Price");
        if (!dealDesc.trim()) return alert("Please enter a description");

        const res = await fetch('/api/chat/offer/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sellerId,
                amount: Number(dealAmount),
                description: dealDesc,
                sender: isSellerView ? 'seller' : 'user'
            })
        });

        if (res.ok) {
            setShowDealInput(false);
            setDealAmount("");
            setDealDesc("");
            fetchHistory();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to create offer.");
        }
    };

    const handleSellerAccept = async (messageId: string) => {
        if (!confirm("Accept this buyer's proposal and convert it into a final offer?")) return;
        setProcessingId(messageId);

        const res = await fetch('/api/chat/offer/accept-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
        });

        if (res.ok) {
            alert("Proposal accepted. Waiting for the buyer to Approve & Pay.");
            fetchHistory();
        } else {
            alert("Failed to accept proposal.");
        }
        setProcessingId(null);
    };

    const handleApprovePay = async (messageId: string) => {
        if (!confirm("Approve this deal and proceed to payment via Razorpay? This will initiate the escrow process.")) return;
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
            alert(data.error || "Failed to generate payment link.");
        }
        setProcessingId(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[650px] max-h-screen">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-4 flex justify-between items-center text-white shadow-md flex-shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">{sellerName}</h3>
                        <p className="text-xs text-blue-200 flex items-center opacity-80">
                            <ShieldCheck size={12} className="mr-1" /> Verified Trade Chat
                        </p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.sender === (isSellerView ? 'seller' : 'user') ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'OFFER' || msg.type === 'PAYMENT_LINK' ? (
                                <div className={`w-4/5 border rounded-xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-blue-50 border-blue-200' : 'bg-white border-green-200'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            {msg.sender === 'user' ? 'Buyer Proposal' : 'Seller Offer'}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            ₹{msg.offerAmount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{msg.message}</p>

                                    {/* SELLER'S VIEW: Accept Buyer Proposal */}
                                    {isSellerView && msg.sender === 'user' && msg.offerStatus === 'PENDING' && (
                                        <button
                                            onClick={() => handleSellerAccept(msg._id)}
                                            disabled={!!processingId}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center shadow-sm disabled:opacity-50"
                                        >
                                            {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : "🤝 Accept Proposal & Finalize Offer"}
                                        </button>
                                    )}

                                    {/* BUYER'S VIEW: Approve & Pay */}
                                    {!isSellerView && msg.sender === 'seller' && msg.offerStatus === 'PENDING' && msg.type === 'OFFER' && (
                                        <button
                                            onClick={() => handleApprovePay(msg._id)}
                                            disabled={!!processingId}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center shadow-sm disabled:opacity-50"
                                        >
                                            {processingId === msg._id ? <Loader2 className="animate-spin" size={16} /> : "✅ Approve Deal & Pay via Razorpay"}
                                        </button>
                                    )}

                                    {/* PAYMENT LINK */}
                                    {msg.type === 'PAYMENT_LINK' && msg.paymentLink && (
                                        <a
                                            href={msg.paymentLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-green-600 text-white text-center font-bold py-2 rounded-lg hover:bg-green-700 transition-colors mt-2"
                                        >
                                            💳 Proceed to Secure Payment (Escrow)
                                        </a>
                                    )}

                                    {/* Waiting Status */}
                                    {msg.offerStatus === 'PENDING' && (
                                        <p className="text-[10px] text-center text-gray-500 italic mt-2">
                                            {msg.sender === 'user' && isSellerView ? 'Awaiting your acceptance...' : ''}
                                            {msg.sender === 'user' && !isSellerView ? 'Awaiting seller acceptance...' : ''}
                                            {msg.sender === 'seller' && isSellerView ? 'Awaiting buyer approval and payment...' : ''}
                                            {msg.sender === 'seller' && !isSellerView ? 'Awaiting your payment...' : ''}
                                        </p>
                                    )}

                                </div>
                            ) : (
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === (isSellerView ? 'seller' : 'user') ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    {msg.message}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Deal Creator Inputs */}
                {showDealInput && (
                    <div className="p-4 bg-white border-t border-gray-200 shadow-up z-10">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                                {isSellerView ? "Create Official Offer" : "Propose a Price"}
                            </p>
                            <button onClick={() => setShowDealInput(false)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Description (e.g. 500kg Rice Grade A)"
                                value={dealDesc}
                                onChange={(e) => setDealDesc(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-black"
                            />
                            <div className="flex gap-3">
                                <div className="relative w-1/2">
                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={dealAmount}
                                        onChange={(e) => setDealAmount(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:border-blue-500 text-black"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateProposal}
                                    className="flex-1 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Offer Input */}
                {showQuickOffer && !isSellerView && (
                    <div className="p-4 bg-green-50 border-t border-green-200">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold text-gray-700 uppercase">Enter Your Offer</p>
                            <button onClick={() => setShowQuickOffer(false)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">₹</span>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={quickOfferAmount}
                                    onChange={(e) => setQuickOfferAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none text-black"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (!quickOfferAmount || isNaN(Number(quickOfferAmount))) {
                                        alert("Please enter a valid amount");
                                        return;
                                    }

                                    // Step 1: Create the offer
                                    const offerRes = await fetch('/api/chat/offer/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            sellerId,
                                            amount: Number(quickOfferAmount),
                                            description: `Buyer's offer: ₹${quickOfferAmount}`,
                                            sender: 'user'
                                        })
                                    });

                                    if (!offerRes.ok) {
                                        const data = await offerRes.json();
                                        alert(data.error || "Failed to create offer");
                                        return;
                                    }

                                    const offerData = await offerRes.json();
                                    const messageId = offerData.data._id;

                                    // Step 2: Immediately generate payment link
                                    const paymentRes = await fetch('/api/chat/offer/approve', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ messageId, sellerId })
                                    });

                                    setQuickOfferAmount("");
                                    setShowQuickOffer(false);
                                    fetchHistory();

                                    if (paymentRes.ok) {
                                        const paymentData = await paymentRes.json();
                                        if (paymentData.link) {
                                            setTimeout(() => {
                                                alert("Payment link generated! Check the chat.");
                                            }, 500);
                                        }
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                            >
                                Send Offer
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat Input Bar */}
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2 items-center flex-shrink-0">
                    {!isSellerView && (
                        <button
                            onClick={() => setShowQuickOffer(!showQuickOffer)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
                            title="Make an offer to the seller"
                        >
                            {showQuickOffer ? 'Cancel' : 'Approve & Pay'}
                        </button>
                    )}
                    <input
                        type="text"
                        placeholder="Type message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-600 text-white p-2 rounded-full shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        <SendHorizontal size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;