"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, Send, MapPin, Phone, User, RefreshCw, Database, Globe, UserPlus, X } from "lucide-react";
import Link from 'next/link';

export default function AdminRequirementsPage() {
    const [requirements, setRequirements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [fulfillmentMode, setFulfillmentMode] = useState<'database' | 'jit' | 'manual'>('database');
    const [manualSeller, setManualSeller] = useState({ name: '', phone: '' });

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

    const handleProcess = async () => {
        if (!selectedReq) return;
        setProcessingId(selectedReq._id);
        
        try {
            const res = await fetch("/api/admin/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    requestId: selectedReq._id,
                    mode: fulfillmentMode,
                    manualData: fulfillmentMode === 'manual' ? manualSeller : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchRequirements();
                setSelectedReq(null); // Close Modal
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Network error");
        }
        setProcessingId(null);
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
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
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
                                        <div className="text-sm text-gray-500">{req.city}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedReq(req); setFulfillmentMode('database'); }}
                                            disabled={req.status === 'FULFILLED'}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:bg-gray-300"
                                        >
                                            {req.status === 'FULFILLED' ? 'Sent' : 'Process'}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Fulfill Lead: {selectedReq.product}</h3>
                            <button onClick={() => setSelectedReq(null)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-500 mb-4">How do you want to fulfill this requirement?</p>
                            
                            {/* Option 1: Database */}
                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${fulfillmentMode === 'database' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                <input type="radio" name="mode" value="database" checked={fulfillmentMode === 'database'} onChange={() => setFulfillmentMode('database')} className="hidden" />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fulfillmentMode === 'database' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}><Database size={20} /></div>
                                <div>
                                    <div className="font-bold text-gray-900">Database Match</div>
                                    <div className="text-xs text-gray-500">Find existing sellers in your DB</div>
                                </div>
                            </label>

                            {/* Option 2: JIT Scraper */}
                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${fulfillmentMode === 'jit' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                                <input type="radio" name="mode" value="jit" checked={fulfillmentMode === 'jit'} onChange={() => setFulfillmentMode('jit')} className="hidden" />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fulfillmentMode === 'jit' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}><Globe size={20} /></div>
                                <div>
                                    <div className="font-bold text-gray-900">JIT Scraper</div>
                                    <div className="text-xs text-gray-500">Live search on Google Maps</div>
                                </div>
                            </label>

                            {/* Option 3: Manual */}
                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${fulfillmentMode === 'manual' ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                                <input type="radio" name="mode" value="manual" checked={fulfillmentMode === 'manual'} onChange={() => setFulfillmentMode('manual')} className="hidden" />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fulfillmentMode === 'manual' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}><UserPlus size={20} /></div>
                                <div>
                                    <div className="font-bold text-gray-900">Manual Entry</div>
                                    <div className="text-xs text-gray-500">Enter seller details manually</div>
                                </div>
                            </label>

                            {/* Manual Inputs */}
                            {fulfillmentMode === 'manual' && (
                                <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <input 
                                        type="text" placeholder="Seller Name" 
                                        className="w-full p-2 border rounded"
                                        value={manualSeller.name}
                                        onChange={(e) => setManualSeller({...manualSeller, name: e.target.value})}
                                    />
                                    <input 
                                        type="text" placeholder="Phone (e.g., 919876543210)" 
                                        className="w-full p-2 border rounded"
                                        value={manualSeller.phone}
                                        onChange={(e) => setManualSeller({...manualSeller, phone: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setSelectedReq(null)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button 
                                onClick={handleProcess} 
                                disabled={!!processingId}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex justify-center gap-2"
                            >
                                {processingId ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Process Lead</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}