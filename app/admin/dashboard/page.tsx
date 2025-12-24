"use client";

import React, { useEffect, useState } from 'react';
import { Users, Clock, RefreshCcw, Loader2, ArrowUpRight } from 'lucide-react';

export default function LiveDashboard() {
    const [stats, setStats] = useState({ dailyVisitors: 0, activeUsers: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats/visitors');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Traffic Monitor</h1>
                    <p className="text-gray-500">Real-time user insights</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
                >
                    <RefreshCcw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: Active Users (Present Moment) */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Users size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-100">Active Right Now</h2>
                        </div>
                        <div className="text-5xl font-extrabold mb-1">
                            {stats.activeUsers}
                        </div>
                        <p className="text-blue-200 text-sm">Users active in last 15 mins</p>
                    </div>
                </div>

                {/* Card 2: Daily Visitors */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <Clock size={16} /> Total Visits Today
                            </h2>
                            <div className="text-5xl font-extrabold text-gray-900 mt-2">
                                {stats.dailyVisitors}
                            </div>
                        </div>
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={14} /> Live
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Unique IPs recorded since 12:00 AM</p>

                    {/* Visual Bar (Decorative) */}
                    <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
