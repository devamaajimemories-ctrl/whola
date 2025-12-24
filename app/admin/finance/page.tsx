"use client";
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, RefreshCcw, CheckCircle, Clock, Lock, CreditCard, X, AlertCircle } from 'lucide-react';

export default function AdminFinancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [filter, setFilter] = useState('ALL'); 
    
    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [payoutNote, setPayoutNote] = useState('');
    const [processingPayout, setProcessingPayout] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance');
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePayout = async () => {
        if (!selectedOrder) return;
        setProcessingPayout(true);
        
        try {
            const res = await fetch('/api/admin/finance/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId: selectedOrder.orderId,
                    adminNote: payoutNote 
                })
            });
            const result = await res.json();
            
            if (result.success) {
                alert("Payout recorded successfully!");
                setSelectedOrder(null);
                setPayoutNote('');
                fetchData(); // Refresh table
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            alert("Failed to connect to server");
        }
        setProcessingPayout(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredOrders = data?.orders.filter((o: any) => 
        filter === 'ALL' ? true : o.status === 'RELEASED_TO_SELLER'
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Financial Control Room</h1>
                        <p className="text-gray-500">Manage Manual Payouts & Commissions</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-green-100 text-xs uppercase font-bold mb-1">Realized Commission</p>
                                <h3 className="text-3xl font-extrabold">{data ? formatCurrency(data.summary.earnedCommission) : "..."}</h3>
                                <p className="text-xs text-green-200 mt-2 flex items-center gap-1">
                                    <CheckCircle size={14}/> {data?.summary.completedCount || 0} Settled Orders
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full h-fit"><Lock size={24} className="text-white" /></div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Pending Payouts</p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {data ? formatCurrency(data.orders.filter((o:any) => o.status === 'PAID').reduce((acc:number, curr:any) => acc + curr.sellerPayout, 0)) : "..."}
                                </h3>
                                <p className="text-xs text-orange-500 mt-1 font-medium">Needs Action</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg h-fit"><AlertCircle size={24} className="text-orange-600" /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Total GMV</p>
                                <h3 className="text-2xl font-bold text-gray-900">{data ? formatCurrency(data.summary.gmv) : "..."}</h3>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg h-fit"><TrendingUp size={24} className="text-purple-600" /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Total Payouts Sent</p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {data ? formatCurrency(data.orders.filter((o:any) => o.status === 'RELEASED_TO_SELLER').reduce((acc:number, curr:any) => acc + curr.sellerPayout, 0)) : "..."}
                                </h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg h-fit"><DollarSign size={24} className="text-blue-600" /></div>
                        </div>
                    </div>
                </div>

                {/* --- TRANSACTIONS TABLE --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex gap-3 bg-gray-50/50">
                        <button onClick={() => setFilter('ALL')} className={`text-sm font-bold px-4 py-2 rounded-lg ${filter === 'ALL' ? 'bg-white shadow border' : 'text-gray-500'}`}>All Orders</button>
                        <button onClick={() => setFilter('COMPLETED')} className={`text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' : 'text-gray-500'}`}>
                            <CheckCircle size={14}/> Completed
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                    <th className="p-4 border-b pl-6">Order ID</th>
                                    <th className="p-4 border-b">Buyer / Seller</th>
                                    <th className="p-4 border-b text-right">Commission</th>
                                    <th className="p-4 border-b text-right">Payout Amount</th>
                                    <th className="p-4 border-b text-center">Status</th>
                                    <th className="p-4 border-b text-center pr-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-gray-500">Loading...</td></tr>
                                ) : filteredOrders?.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-mono text-xs font-bold text-blue-600">{order.orderId}</div>
                                            <div className="text-xs text-gray-400 mt-1">{new Date(order.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-medium">B: {order.buyerName}</div>
                                            <div className="text-xs text-gray-500">S: {order.sellerName}</div>
                                        </td>
                                        <td className="p-4 text-right text-green-700 font-bold bg-green-50/30">+{formatCurrency(order.platformFee)}</td>
                                        <td className="p-4 text-right text-gray-900 font-medium">{formatCurrency(order.sellerPayout)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                order.status === 'RELEASED_TO_SELLER' ? 'bg-green-100 text-green-700 border-green-200' 
                                                : order.status === 'PAID' ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {order.status === 'RELEASED_TO_SELLER' ? 'PAID OUT' : order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center pr-6">
                                            {order.status === 'PAID' && (
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="bg-black text-white text-xs px-3 py-1.5 rounded hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1 mx-auto"
                                                >
                                                    <CreditCard size={12} /> Payout
                                                </button>
                                            )}
                                            {order.status === 'RELEASED_TO_SELLER' && (
                                                <span className="text-xs text-gray-400 flex items-center justify-center gap-1"><CheckCircle size={12}/> Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MANUAL PAYOUT MODAL --- */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Manual Payout</h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800">
                                    <strong className="block mb-1">⚠️ Action Required</strong>
                                    Please manually transfer the amount below to the seller using your banking app. Once done, confirm here.
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Amount to Transfer:</span>
                                        <span className="font-bold text-xl text-gray-900">{formatCurrency(selectedOrder.sellerPayout)}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Details</p>
                                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm space-y-1">
                                            <div className="flex justify-between"><span className="text-gray-500">Account Name:</span> <span className="font-medium">{selectedOrder.sellerBank.holderName}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Account No:</span> <span className="font-mono font-bold">{selectedOrder.sellerBank.accountNumber}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">IFSC Code:</span> <span className="font-mono font-bold">{selectedOrder.sellerBank.ifsc}</span></div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Reference Note (Optional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. UPI Ref: 123456789"
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                                            value={payoutNote}
                                            onChange={(e) => setPayoutNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handlePayout}
                                    disabled={processingPayout}
                                    className="flex-1 px-4 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg text-sm flex justify-center items-center gap-2"
                                >
                                    {processingPayout ? 'Processing...' : 'Confirm Transfer Done'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}