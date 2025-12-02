"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, Send, MapPin, Phone, User, RefreshCw, Database, Globe, UserPlus, X, Plus, Trash2, Unlock, Lock } from "lucide-react";

export default function AdminRequirementsPage() {
    const [requirements, setRequirements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [fulfillmentMode, setFulfillmentMode] = useState<'database' | 'jit' | 'manual'>('database');
    
    // Manual Sellers State (Array)
    const [manualSellers, setManualSellers] = useState([{ name: '', phone: '' }]);

    const fetchRequirements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/requirements");
            const data = await res.json();
            if (data.success) setRequirements(data.data);
        } catch (error) {
            console.error("Failed to load", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequirements(); }, []);

    // 1. PROCESS LEAD (Send Notifications)
    const handleProcess = async () => {
        if (!selectedReq) return;
        setProcessingId(selectedReq._id);
        
        try {
            const res = await fetch("/api/admin/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: 'process',
                    requestId: selectedReq._id,
                    mode: fulfillmentMode,
                    manualData: fulfillmentMode === 'manual' ? manualSellers : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchRequirements();
                // Note: We don't close modal automatically so you can add more numbers if needed
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Network error");
        }
        setProcessingId(null);
    };

    // 2. TOGGLE STATUS (Open / Fulfilled)
    const toggleStatus = async (req: any, newStatus: string) => {
        if(!confirm(`Change status to ${newStatus}?`)) return;
        
        try {
            const res = await fetch("/api/admin/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: 'updateStatus',
                    requestId: req._id,
                    status: newStatus
                })
            });
            if(res.ok) fetchRequirements();
        } catch(e) { alert("Failed to update status"); }
    };

    // Manual Seller Input Helpers
    const addManualRow = () => setManualSellers([...manualSellers, { name: '', phone: '' }]);
    const removeManualRow = (index: number) => {
        const newRows = [...manualSellers];
        newRows.splice(index, 1);
        setManualSellers(newRows);
    };
    const updateManualRow = (index: number, field: 'name' | 'phone', value: string) => {
        const newRows = [...manualSellers];
        newRows[index][field] = value;
        setManualSellers(newRows);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">🛡️ Lead Manager</h1>
                    <button onClick={fetchRequirements} className="p-2 bg-white border rounded hover:bg-gray-50">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Buyer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Requirement</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requirements.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{req.buyerName}</div>
                                        <div className="text-sm text-gray-500">{req.buyerPhone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">{req.product}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded">Qty: {req.quantity}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded">₹{req.estimatedPrice}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'FULFILLED' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                <CheckCircle size={12}/> Fulfilled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                                <Unlock size={12}/> Open
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setSelectedReq(req); setFulfillmentMode('manual'); setManualSellers([{name: '', phone: ''}]); }}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700"
                                        >
                                            Connect Sellers
                                        </button>

                                        {req.status === 'OPEN' ? (
                                            <button 
                                                onClick={() => toggleStatus(req, 'FULFILLED')}
                                                className="border border-green-600 text-green-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-50"
                                            >
                                                Mark Done
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => toggleStatus(req, 'OPEN')}
                                                className="border border-yellow-600 text-yellow-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-50"
                                            >
                                                Re-Open
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FULFILLMENT MODAL */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-lg">Connect Suppliers</h3>
                                <p className="text-xs text-gray-500">For: {selectedReq.product}</p>
                            </div>
                            <button onClick={() => setSelectedReq(null)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Mode Selection */}
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setFulfillmentMode('database')} className={`p-3 rounded-lg border text-center text-sm font-bold transition-all ${fulfillmentMode === 'database' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                                    <Database size={18} className="mx-auto mb-1"/> DB Match
                                </button>
                                <button onClick={() => setFulfillmentMode('jit')} className={`p-3 rounded-lg border text-center text-sm font-bold transition-all ${fulfillmentMode === 'jit' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                    <Globe size={18} className="mx-auto mb-1"/> Web Scrape
                                </button>
                                <button onClick={() => setFulfillmentMode('manual')} className={`p-3 rounded-lg border text-center text-sm font-bold transition-all ${fulfillmentMode === 'manual' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                                    <UserPlus size={18} className="mx-auto mb-1"/> Manual
                                </button>
                            </div>

                            {/* Manual Inputs */}
                            {fulfillmentMode === 'manual' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-gray-700">Enter Seller Numbers</label>
                                        <button onClick={addManualRow} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                            <Plus size={14}/> Add Row
                                        </button>
                                    </div>
                                    <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 space-y-2">
                                        {manualSellers.map((seller, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    type="text" placeholder="Name" 
                                                    className="flex-1 p-2 border rounded text-sm"
                                                    value={seller.name}
                                                    onChange={(e) => updateManualRow(idx, 'name', e.target.value)}
                                                />
                                                <input 
                                                    type="text" placeholder="Phone" 
                                                    className="flex-1 p-2 border rounded text-sm"
                                                    value={seller.phone}
                                                    onChange={(e) => updateManualRow(idx, 'phone', e.target.value)}
                                                />
                                                {manualSellers.length > 1 && (
                                                    <button onClick={() => removeManualRow(idx)} className="text-red-500 hover:bg-red-100 p-2 rounded">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">These sellers will receive a WhatsApp link to chat with the buyer on the website.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
                            <button 
                                onClick={handleProcess} 
                                disabled={!!processingId}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex justify-center gap-2 shadow-lg"
                            >
                                {processingId ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Invites</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}