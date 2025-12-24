"use client";

import React, { useState, useEffect } from 'react';
import { Users, Store, Phone, Calendar, Search, MapPin, Loader2, Download, MessageCircle, ExternalLink } from 'lucide-react';

interface Buyer {
    _id: string;
    name: string;
    phone: string;
    email: string;
    updatedAt: string;
}

interface Seller {
    _id: string;
    name: string;
    phone: string;
    city: string;
    category: string;
    updatedAt: string;
}

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<'buyers' | 'sellers'>('buyers');
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setBuyers(data.buyers);
                setSellers(data.sellers);
            }
        } catch (error) {
            console.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // Filter by Name or Phone
    const filteredData = activeTab === 'buyers' 
        ? buyers.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()) || b.phone?.includes(search))
        : sellers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search));

    const exportData = () => {
        const dataToExport = activeTab === 'buyers' ? buyers : sellers;
        const csvContent = "data:text/csv;charset=utf-8," 
            + Object.keys(dataToExport[0] || {}).join(",") + "\n"
            + dataToExport.map(row => Object.values(row).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeTab}_data.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Helper to format phone for WhatsApp (Assumes India +91 if missing)
    const getWhatsAppLink = (phone: string) => {
        let cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500 mt-1">Directly contact Buyers & Sellers</p>
                    </div>
                    <button 
                        onClick={exportData}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-gray-200"
                    >
                        <Download size={18} /> Export Data
                    </button>
                </div>

                {/* TABS & SEARCH */}
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden mb-8">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('buyers')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'buyers'
                                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                        >
                            <Users size={20} /> Buyers <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs ml-1">{buyers.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('sellers')}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'sellers'
                                    ? 'text-purple-600 bg-purple-50/50 border-b-2 border-purple-600'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                        >
                            <Store size={20} /> Sellers <span className="bg-purple-100 text-purple-700 py-0.5 px-2 rounded-full text-xs ml-1">{sellers.length}</span>
                        </button>
                    </div>
                    
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                        <div className="relative max-w-lg mx-auto">
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder={`Search ${activeTab} by Name or Phone...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-sm text-gray-400 animate-pulse">Loading users...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-5">User Profile</th>
                                        <th className="p-5">Contact Info</th>
                                        <th className="p-5 text-center">Admin Actions</th> 
                                        {activeTab === 'sellers' && <th className="p-5">Details</th>}
                                        <th className="p-5 text-right">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((user: any) => (
                                            <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${activeTab === 'buyers' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'}`}>
                                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{user.name || "Unknown User"}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{user._id.slice(-6)}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-gray-700 font-mono text-sm">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {user.phone}
                                                        </div>
                                                        {user.email && (
                                                            <div className="text-xs text-gray-400 pl-6 truncate max-w-[150px]" title={user.email}>
                                                                {user.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* --- NEW ADMIN CONTACT SECTION --- */}
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <a 
                                                            href={getWhatsAppLink(user.phone)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors border border-green-200"
                                                        >
                                                            <MessageCircle size={16} /> WhatsApp
                                                        </a>
                                                        <a 
                                                            href={`tel:${user.phone}`}
                                                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200"
                                                        >
                                                            <Phone size={16} /> Call
                                                        </a>
                                                    </div>
                                                </td>

                                                {activeTab === 'sellers' && (
                                                    <td className="p-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-gray-800">{user.category}</span>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <MapPin size={12} /> {user.city || "Pan India"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="p-5 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                            {new Date(user.updatedAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {new Date(user.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                                    <Users size={48} className="opacity-20" />
                                                    <p>No users found matching "{search}"</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}