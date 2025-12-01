"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, Send, MapPin, Phone, User, RefreshCw } from "lucide-react";
import Link from 'next/link';

export default function AdminRequirementsPage() {
    const [requirements, setRequirements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequirements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/requirements");
            const data = await res.json();
            if (data.success) {
                setRequirements(data.data);
            }
        } catch (error) {
            console.error("Failed to load requirements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const handleForward = async (reqId: string) => {
        if (!confirm("Are you sure you want to approve and forward this lead?")) return;
        
        setProcessingId(reqId);
        try {
            const res = await fetch("/api/admin/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: reqId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchRequirements(); // Refresh list to show green "Sent" status
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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🛡️ Lead Approvals</h1>
                        <p className="text-gray-500">Review buyer requirements before sending to sellers.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors">
                            ← Back to Scraper
                        </Link>
                        <button onClick={fetchRequirements} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer Info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requirement</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requirements.map((req) => (
                                <tr key={req._id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {req.buyerName?.[0] || 'U'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{req.buyerName || 'Unknown Buyer'}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Phone size={12} /> {req.buyerPhone}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin size={12} /> {req.city || 'India'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{req.product}</div>
                                        <div className="text-sm text-gray-600">Qty: {req.quantity} {req.unit}</div>
                                        <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-block mt-1">
                                            ₹{req.estimatedPrice}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{req.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'FULFILLED' ? (
                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                FORWARDED
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                                                PENDING REVIEW
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleForward(req._id)}
                                            disabled={!!processingId || req.status === 'FULFILLED'}
                                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 ${
                                                req.status === 'FULFILLED' 
                                                ? 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0' 
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                            }`}
                                        >
                                            {processingId === req._id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : req.status === 'FULFILLED' ? (
                                                <> <CheckCircle size={16} /> Approved </>
                                            ) : (
                                                <> <Send size={16} /> Approve & Send </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}