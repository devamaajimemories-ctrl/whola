"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, SendHorizontal, ShieldCheck, Loader2 } from 'lucide-react';

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
    
    // New Deal States
    const [showInput, setShowInput] = useState(false);
    const [amount, setAmount] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchHistory = () => {
        if (sellerId) {
            const endpoint = isSellerView ? `/api/chat/seller-history?buyerId=${sellerId}` : `/api/chat/history?sellerId=${sellerId}`;
            fetch(endpoint).then(res => res.json()).then(data => { if (data.success) setMessages(data.data); });
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, sellerId]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const endpoint = isSellerView ? '/api/chat/seller-send' : '/api/chat/send';
        const body = isSellerView ? { buyerId: sellerId, message: newMessage } : { sellerId, message: newMessage };
        await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        setNewMessage("");
        fetchHistory();
    };

    // Handles both "Approve & Pay" (Buyer) and "Accept Deal" (Seller) actions
    const handleDealAction = async () => {
        if (!amount || isNaN(Number(amount))) return alert("Invalid Amount");

        await fetch('/api/chat/offer/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sellerId, // Target ID
                amount: Number(amount),
                description: isSellerView ? `Seller Accepted: ₹${amount}` : `Buyer Proposed: ₹${amount}`,
                sender: isSellerView ? 'seller' : 'user'
            })
        });
        setAmount("");
        setShowInput(false);
        fetchHistory();
    };

    // Buyer pays for a confirmed deal
    const handlePay = async (messageId: string) => {
        const res = await fetch('/api/chat/offer/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, sellerId })
        });
        const data = await res.json();
        if (data.link) window.open(data.link, '_blank');
    };

    // Seller confirms a buyer's proposal
    const handleAcceptProposal = async (messageId: string) => {
        await fetch('/api/chat/offer/accept-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
        });
        fetchHistory();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[650px]">
                
                {/* Header */}
                <div className="bg-blue-900 p-4 flex justify-between items-center text-white shadow-md shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">{sellerName}</h3>
                        <p className="text-xs text-blue-200 flex items-center gap-1"><ShieldCheck size={12}/> Verified Trade</p>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.sender === (isSellerView ? 'seller' : 'user') ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'OFFER' || msg.type === 'PAYMENT_LINK' ? (
                                <div className="w-4/5 border rounded-xl p-3 bg-white shadow-sm border-l-4 border-l-yellow-400">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                        {msg.sender === 'user' ? 'Buyer Proposal' : 'Seller Offer'}
                                    </p>
                                    <p className="font-bold text-lg">₹{msg.offerAmount}</p>
                                    <p className="text-xs text-gray-600 mb-2">{msg.message}</p>
                                    
                                    {/* Action Buttons inside Bubble */}
                                    {!isSellerView && msg.sender === 'seller' && msg.offerStatus === 'PENDING' && (
                                        <button onClick={() => handlePay(msg._id)} className="w-full bg-green-600 text-white text-xs font-bold py-1.5 rounded">Approve & Pay</button>
                                    )}
                                    {isSellerView && msg.sender === 'user' && msg.offerStatus === 'PENDING' && (
                                        <button onClick={() => handleAcceptProposal(msg._id)} className="w-full bg-blue-600 text-white text-xs font-bold py-1.5 rounded">Accept Proposal</button>
                                    )}
                                    {msg.type === 'PAYMENT_LINK' && msg.paymentLink && (
                                        <a href={msg.paymentLink} target="_blank" className="block text-center bg-green-600 text-white text-xs font-bold py-1.5 rounded">Pay Now</a>
                                    )}
                                </div>
                            ) : (
                                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[80%] ${msg.sender === (isSellerView ? 'seller' : 'user') ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                    {msg.message}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {showInput && (
                    <div className="p-3 bg-gray-100 border-t flex gap-2 animate-in slide-in-from-bottom-2">
                        <input type="number" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm outline-none" autoFocus />
                        <button onClick={handleDealAction} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">Send</button>
                        <button onClick={() => setShowInput(false)}><X size={20} className="text-gray-500 mt-2"/></button>
                    </div>
                )}

                <div className="p-3 bg-white border-t flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => setShowInput(!showInput)}
                        className={`px-3 py-2 rounded-full text-xs font-bold border shadow-sm whitespace-nowrap ${isSellerView ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}`}
                    >
                        {isSellerView ? 'Accept Deal' : 'Approve & Pay'}
                    </button>
                    <input 
                        type="text" placeholder="Type message..." 
                        value={newMessage} onChange={e => setNewMessage(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"><SendHorizontal size={18}/></button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
