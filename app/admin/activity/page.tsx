"use client";

import React, { useState, useEffect } from 'react';
import { 
    Search, MessageSquare, ShoppingCart, User, Smartphone, Globe, 
    MapPin, RefreshCw 
} from 'lucide-react';

export default function UserActivityMonitor() {
    const [activeTab, setActiveTab] = useState<'REGISTERED' | 'GUESTS'>('REGISTERED');
    const [data, setData] = useState({ registered: [], guests: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/activity?q=${search}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search]); // Auto-refresh on search

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Live Activity Monitor</h1>
                    <p className="text-gray-400 text-sm">Track real-time searches, chats, and leads.</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('REGISTERED')}
                    className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'REGISTERED' 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Smartphone size={18} /> Logged In (Phone)
                </button>
                <button 
                    onClick={() => setActiveTab('GUESTS')}
                    className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors border-b-2 ${
                        activeTab === 'GUESTS' 
                        ? 'border-orange-500 text-orange-400' 
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Globe size={18} /> Guests (IP Only)
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <input 
                    type="text"
                    placeholder={activeTab === 'REGISTERED' ? "Search Name or Phone..." : "Search IP Address..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading data...</div>
            ) : (
                <div className="space-y-6">
                    {/* Render based on active tab */}
                    {/* @ts-ignore */}
                    {(activeTab === 'REGISTERED' ? data.registered : data.guests).map((item: any) => (
                        <div key={item._id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                            
                            {/* User Info Header */}
                            <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${activeTab === 'REGISTERED' ? 'bg-blue-900/50 text-blue-400' : 'bg-orange-900/50 text-orange-400'}`}>
                                        {activeTab === 'REGISTERED' ? <User size={24} /> : <Globe size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {activeTab === 'REGISTERED' ? item.name : `Guest (${item.ip})`}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            {activeTab === 'REGISTERED' ? (
                                                <>
                                                    <span className="flex items-center gap-1"><Smartphone size={14}/> {item.phone}</span>
                                                    {item.email && <span>• {item.email}</span>}
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1"><MapPin size={14}/> IP: {item.ip}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    Last Active: {new Date(item.joined || item.lastSeen).toLocaleString()}
                                </div>
                            </div>

                            {/* Activity Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-700 bg-gray-900/30">
                                
                                {/* 1. Search History */}
                                <div className="p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                        <Search size={16} className="text-blue-500" /> Recent Searches
                                    </h4>
                                    {(item.activity.searches || []).length > 0 ? (
                                        <ul className="space-y-2">
                                            {item.activity.searches.map((s: any, i: number) => {
                                                // Handle both string format (old data) and object format (new data)
                                                const queryText = typeof s === 'string' ? s : s.query;
                                                const locationText = typeof s === 'object' && s.location ? s.location : '';

                                                return (
                                                    <li key={i} className="text-sm bg-gray-800 px-3 py-2 rounded text-gray-300 flex justify-between items-center">
                                                        <span>"{queryText}"</span>
                                                        {locationText && (
                                                            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <MapPin size={10} /> {locationText}
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : <p className="text-xs text-gray-600 italic">No search history</p>}
                                </div>

                                {/* 2. Posted Requirements */}
                                <div className="p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                        <ShoppingCart size={16} className="text-green-500" /> Requirements
                                    </h4>
                                    {activeTab === 'REGISTERED' && item.activity.requests?.length > 0 ? (
                                        <ul className="space-y-2">
                                            {item.activity.requests.map((req: any) => (
                                                <li key={req._id} className="text-sm border-l-2 border-green-500 pl-3 py-1">
                                                    <div className="text-white font-medium">{req.product}</div>
                                                    <div className="text-xs text-gray-500">{req.quantity} {req.unit}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-600 italic">
                                            {activeTab === 'GUESTS' ? 'Guests cannot post requirements' : 'No requirements posted'}
                                        </p>
                                    )}
                                </div>

                                {/* 3. Chats */}
                                <div className="p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                        <MessageSquare size={16} className="text-purple-500" /> Recent Chats
                                    </h4>
                                    {(item.activity.chats || []).length > 0 ? (
                                        <ul className="space-y-2">
                                            {item.activity.chats.map((chat: any) => (
                                                <li key={chat._id} className="text-sm bg-gray-800 px-3 py-2 rounded">
                                                    <div className="text-gray-300 truncate">"{chat.message}"</div>
                                                    <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                                        <span>{chat.sender === 'user' ? 'Sent' : 'Received'}</span>
                                                        <span>{new Date(chat.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-xs text-gray-600 italic">No chat history</p>}
                                </div>

                            </div>
                        </div>
                    ))}
                    
                    {/* Empty State */}
                    {(activeTab === 'REGISTERED' ? data.registered : data.guests).length === 0 && (
                        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                            <p className="text-gray-400">No {activeTab.toLowerCase()} found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}