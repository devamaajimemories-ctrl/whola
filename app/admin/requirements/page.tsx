"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, Send, MapPin, Phone, User, RefreshCw, Database, Globe, UserPlus, X, Plus, Trash2, Unlock, Lock, FileText, Tag } from "lucide-react";

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

    // 3. DELETE LEAD
    const deleteRequest = async (reqId: string) => {
        if(!confirm("Are you sure you want to permanently delete this lead? It will be removed from all seller dashboards immediately.")) return;

        try {
            const res = await fetch("/api/admin/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: 'delete',
                    requestId: reqId
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchRequirements();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Failed to delete lead");
        }
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
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🛡️ Lead Manager</h1>
                        <p className="text-gray-500 mt-1">Review buyer requirements and connect sellers</p>
                    </div>
                    <button onClick={fetchRequirements} className="p-2 bg-white border rounded hover:bg-gray-50 shadow-sm text-gray-600">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-[20%]">Buyer Info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-[50%]">Requirement Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-[10%]">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase w-[20%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requirements.map((req) => (
                                <tr key={req._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            <User size={16} className="text-gray-400" /> {req.buyerName}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2 font-mono">
                                            <Phone size={14} /> {req.buyerPhone}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-bold text-blue-700 text-lg">{req.product}</div>
                                            <span className="text-[10px] uppercase font-bold tracking-wide bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                {req.category}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold border border-blue-100">
                                                <Database size={14} /> Qty: {req.quantity} {req.unit}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-sm font-semibold border border-green-100">
                                                Target: ₹{req.estimatedPrice}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-semibold border border-purple-100">
                                                <MapPin size={14} /> {req.city || 'India'}
                                            </span>
                                        </div>

                                        {req.description && (
                                            <div className="text-sm text-gray-700 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 relative">
                                                <FileText size={14} className="absolute top-3 left-2 text-yellow-600 opacity-50" />
                                                <div className="pl-5">
                                                    <span className="font-bold text-xs text-yellow-700 uppercase block mb-0.5">Description:</span>
                                                    {req.description}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        {req.status === 'FULFILLED' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle size={12}/> Fulfilled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                <Unlock size={12}/> Open
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 align-top text-right space-y-2">
                                        <button
                                            onClick={() => { setSelectedReq(req); setFulfillmentMode('manual'); setManualSellers([{name: '', phone: ''}]); }}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            Connect Sellers
                                        </button>

                                        {req.status === 'OPEN' ? (
                                            <button 
                                                onClick={() => toggleStatus(req, 'FULFILLED')}
                                                className="w-full border border-green-600 text-green-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-50 transition-all"
                                            >
                                                Mark Done
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => toggleStatus(req, 'OPEN')}
                                                className="w-full border border-yellow-600 text-yellow-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-50 transition-all"
                                            >
                                                Re-Open
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => deleteRequest(req._id)}
                                            className="w-full border border-red-200 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={12}/> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FULFILLMENT MODAL */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Connect Suppliers</h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                                        <Tag size={14}/> {selectedReq.product}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-3">
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {selectedReq.city || 'India'}</span>
                                        <span className="flex items-center gap-1"><Database size={12}/> {selectedReq.quantity} {selectedReq.unit}</span>
                                        <span className="font-bold text-green-600">₹{selectedReq.estimatedPrice}</span>
                                    </p>
                                    {selectedReq.description && (
                                        <p className="text-xs text-gray-400 italic border-l-2 border-gray-300 pl-2 mt-1 line-clamp-2">
                                            "{selectedReq.description}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="bg-gray-200 hover:bg-red-100 hover:text-red-600 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
                            {/* Mode Selection */}
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setFulfillmentMode('database')} className={`p-4 rounded-xl border-2 text-center text-sm font-bold transition-all flex flex-col items-center gap-2 ${fulfillmentMode === 'database' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <Database size={24} className={fulfillmentMode === 'database' ? "text-blue-600" : "text-gray-400"}/> 
                                    Database Match
                                </button>
                                <button onClick={() => setFulfillmentMode('jit')} className={`p-4 rounded-xl border-2 text-center text-sm font-bold transition-all flex flex-col items-center gap-2 ${fulfillmentMode === 'jit' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <Globe size={24} className={fulfillmentMode === 'jit' ? "text-purple-600" : "text-gray-400"}/> 
                                    Live Scrape
                                </button>
                                <button onClick={() => setFulfillmentMode('manual')} className={`p-4 rounded-xl border-2 text-center text-sm font-bold transition-all flex flex-col items-center gap-2 ${fulfillmentMode === 'manual' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <UserPlus size={24} className={fulfillmentMode === 'manual' ? "text-orange-600" : "text-gray-400"}/> 
                                    Manual Input
                                </button>
                            </div>

                            {/* Manual Inputs */}
                            {fulfillmentMode === 'manual' && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-gray-800">Seller Details</label>
                                        <button onClick={addManualRow} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold transition-colors">
                                            <Plus size={14}/> Add Row
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {manualSellers.map((seller, idx) => (
                                            <div key={idx} className="flex gap-3 items-center">
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <input 
                                                        type="text" placeholder="Seller Name" 
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        value={seller.name}
                                                        onChange={(e) => updateManualRow(idx, 'name', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" placeholder="Phone (10 digits)" 
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        value={seller.phone}
                                                        onChange={(e) => updateManualRow(idx, 'phone', e.target.value)}
                                                    />
                                                </div>
                                                {manualSellers.length > 1 && (
                                                    <button onClick={() => removeManualRow(idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-orange-50 text-orange-800 text-xs p-3 rounded-lg border border-orange-100">
                                        <p>ℹ️ These sellers will receive an instant WhatsApp notification with a link to chat with the buyer.</p>
                                    </div>
                                </div>
                            )}
                            
                            {fulfillmentMode === 'jit' && (
                                <div className="bg-purple-50 text-purple-800 text-sm p-4 rounded-lg border border-purple-100 text-center">
                                    <Globe className="mx-auto mb-2 text-purple-500" size={32}/>
                                    <p>System will search Google Maps for <strong>"Wholesalers of {selectedReq.product} in {selectedReq.city || 'India'}"</strong> and auto-connect the top 15 results.</p>
                                </div>
                            )}

                            {fulfillmentMode === 'database' && (
                                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg border border-blue-100 text-center">
                                    <Database className="mx-auto mb-2 text-blue-500" size={32}/>
                                    <p>System will match sellers from your existing database based on tags and categories related to <strong>{selectedReq.product}</strong>.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0 flex gap-3">
                            <button 
                                onClick={handleProcess} 
                                disabled={!!processingId}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg transition-all transform active:scale-[0.98]"
                            >
                                {processingId ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Launch Connection Campaign</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}