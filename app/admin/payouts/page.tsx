"use client";
import React, { useEffect, useState } from 'react';
import { DollarSign, Send, CheckCircle, AlertCircle, Phone, CreditCard, Copy } from 'lucide-react';

export default function AdminPayoutsPage() {
    const [loading, setLoading] = useState(true);
    const [sellers, setSellers] = useState<any[]>([]);
    const [processing, setProcessing] = useState<string | null>(null);

    // Modal State
    const [selectedSeller, setSelectedSeller] = useState<any>(null);
    const [bankRef, setBankRef] = useState('');
    const [amountToPay, setAmountToPay] = useState('');

    const fetchPendingPayouts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/payouts/pending');
            const json = await res.json();
            if (json.success) setSellers(json.sellers);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingPayouts();
    }, []);

    const handleProcessPayout = async () => {
        if (!selectedSeller || !amountToPay || !bankRef) return;
        setProcessing(selectedSeller._id);

        try {
            const res = await fetch('/api/admin/payouts/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: selectedSeller._id,
                    amount: parseFloat(amountToPay),
                    notes: bankRef
                })
            });
            const data = await res.json();

            if (data.success) {
                alert("Payout Recorded Successfully!");
                setSelectedSeller(null);
                setBankRef('');
                setAmountToPay('');
                fetchPendingPayouts(); // Refresh list to show new balances
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Failed to process");
        }
        setProcessing(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Optional: you can show a small toast here if you have one
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Payout Manager</h1>
                <p className="text-gray-500 mb-8">Transfer funds via your Bank, then record it here.</p>

                {/* --- TABLE OF SELLERS OWED MONEY --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 pl-6">Seller Identity</th>
                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Bank Account (For Transfer)</th>
                                <th className="p-4 text-right">Wallet Balance (Owed)</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                            ) : sellers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-green-600 font-medium"><CheckCircle className="inline mr-2"/>All sellers are paid up!</td></tr>
                            ) : (
                                sellers.map((seller) => (
                                    <tr key={seller._id} className="hover:bg-gray-50">
                                        {/* 1. Identity */}
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-gray-900">{seller.name}</div>
                                            <div className="text-sm text-gray-500">{seller.email}</div>
                                        </td>

                                        {/* 2. Contact (Phone) */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Phone size={16} className="text-blue-500" />
                                                {seller.phone}
                                            </div>
                                        </td>

                                        {/* 3. Bank Details */}
                                        <td className="p-4 text-sm text-gray-600">
                                            {seller.bankAccountNumber ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold w-12 text-xs uppercase text-gray-400">Name</span> 
                                                        {seller.bankAccountHolderName}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold w-12 text-xs uppercase text-gray-400">A/C</span> 
                                                        <span className="font-mono bg-gray-100 px-1 rounded select-all">{seller.bankAccountNumber}</span>
                                                        <button onClick={() => copyToClipboard(seller.bankAccountNumber)} title="Copy A/C">
                                                            <Copy size={12} className="text-gray-400 hover:text-blue-600 cursor-pointer"/>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold w-12 text-xs uppercase text-gray-400">IFSC</span> 
                                                        <span className="font-mono bg-gray-100 px-1 rounded select-all">{seller.bankIFSC}</span>
                                                        <button onClick={() => copyToClipboard(seller.bankIFSC)} title="Copy IFSC">
                                                            <Copy size={12} className="text-gray-400 hover:text-blue-600 cursor-pointer"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded w-fit text-xs font-bold">
                                                    <AlertCircle size={14}/> NO BANK INFO
                                                </span>
                                            )}
                                        </td>

                                        {/* 4. Balance */}
                                        <td className="p-4 text-right font-mono font-bold text-lg text-gray-900">
                                            {formatCurrency(seller.walletBalance)}
                                        </td>

                                        {/* 5. Pay Button */}
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedSeller(seller);
                                                    setAmountToPay(seller.walletBalance.toString());
                                                }}
                                                disabled={!seller.bankAccountNumber}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <DollarSign size={16} /> Pay
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PAYOUT MODAL --- */}
            {selectedSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                            <button onClick={() => setSelectedSeller(null)} className="text-gray-400 hover:text-red-600 transition-colors">✕</button>
                        </div>
                        
                        {/* Bank Details Card in Modal */}
                        <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm mb-6 border border-blue-100 shadow-inner">
                            <h4 className="font-bold flex items-center gap-2 mb-3 text-blue-700"><CreditCard size={16}/> Transfer To:</h4>
                            
                            <div className="grid grid-cols-[80px_1fr] gap-y-2">
                                <span className="text-blue-600/70 text-xs uppercase font-semibold mt-0.5">Holder</span>
                                <span className="font-medium text-gray-900">{selectedSeller.bankAccountHolderName}</span>
                                
                                <span className="text-blue-600/70 text-xs uppercase font-semibold mt-0.5">Account</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg text-gray-900 select-all">{selectedSeller.bankAccountNumber}</span>
                                    <Copy size={14} className="cursor-pointer text-blue-400 hover:text-blue-700" onClick={() => copyToClipboard(selectedSeller.bankAccountNumber)}/>
                                </div>
                                
                                <span className="text-blue-600/70 text-xs uppercase font-semibold mt-0.5">IFSC</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-gray-900 select-all">{selectedSeller.bankIFSC}</span>
                                    <Copy size={14} className="cursor-pointer text-blue-400 hover:text-blue-700" onClick={() => copyToClipboard(selectedSeller.bankIFSC)}/>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount Transferred (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={amountToPay} 
                                        onChange={(e) => setAmountToPay(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-8 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-xl text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank UTR / Reference ID</label>
                                <input 
                                    type="text" 
                                    value={bankRef} 
                                    onChange={(e) => setBankRef(e.target.value)}
                                    placeholder="Enter IMPS/UPI Ref No."
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={() => setSelectedSeller(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleProcessPayout}
                                disabled={processing === selectedSeller._id || !bankRef}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait flex justify-center items-center gap-2 shadow-lg shadow-green-200 transition-all"
                            >
                                {processing === selectedSeller._id ? "Saving..." : "Confirm Payment"} <Send size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}