"use client";
import React, { useState, useEffect, useRef } from 'react';

type QueueItem = {
    _id: string;
    query: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    itemsFound?: number;
    requestedAt: string;
    error?: string;
};

export default function LiveScraperDashboard() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [autoMode, setAutoMode] = useState(false);
    
    // --- POWER SETTINGS ---
    // Concurrency = How many browser windows open at once
    const [concurrency, setConcurrency] = useState(3); 
    const [activeWorkers, setActiveWorkers] = useState(0);
    const workersRef = useRef(0);

    // 1. Fetch Queue from DB
    const fetchQueue = async () => {
        try {
            const res = await fetch('/api/admin/queue');
            const data = await res.json();
            if (data.queue) setQueue(data.queue);
        } catch (e) {
            console.error("Queue fetch error", e);
        }
    };

    // 2. Run a Single Worker
    const runWorker = async (item: QueueItem) => {
        // Optimistic UI update
        setQueue(prev => prev.map(q => q._id === item._id ? { ...q, status: 'PROCESSING' } : q));
        
        workersRef.current += 1;
        setActiveWorkers(workersRef.current);
        addLog(`⚡ [Starting] Query: "${item.query}"`);

        try {
            // Call the local API route
            const res = await fetch('/api/admin/run-scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: item.query })
            });
            const result = await res.json();

            if (result.success) {
                addLog(`✅ [Success] "${item.query}" (+${result.count} items)`);
            } else {
                addLog(`❌ [Failed] "${item.query}" - ${result.error}`);
            }
        } catch (e: any) {
            addLog(`❌ [Error] ${e.message}`);
        } finally {
            workersRef.current -= 1;
            setActiveWorkers(workersRef.current);
            fetchQueue(); // Sync with DB
        }
    };

    // 3. Auto-Loop (The Engine)
    useEffect(() => {
        if (!autoMode) return;

        const interval = setInterval(() => {
            if (workersRef.current < concurrency) {
                // Find next PENDING item
                const nextItem = queue.find(q => q.status === 'PENDING');
                if (nextItem) {
                    runWorker(nextItem);
                }
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, [autoMode, queue, concurrency]);

    // 4. Poll for new User Requests
    useEffect(() => {
        fetchQueue();
        const poll = setInterval(fetchQueue, 5000);
        return () => clearInterval(poll);
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🚀 Admin Live Scraper Node</h1>
                        <p className="text-gray-500 text-sm">
                            Workers: <span className="font-bold text-blue-600">{activeWorkers} / {concurrency}</span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border">
                            <span className="text-sm font-bold text-gray-600">Power Level:</span>
                            <input 
                                type="range" min="1" max="10" 
                                value={concurrency} 
                                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                                className="w-24 accent-blue-600 cursor-pointer"
                            />
                            <span className="font-bold w-6 text-center">{concurrency}</span>
                        </div>

                        <button 
                            onClick={() => setAutoMode(!autoMode)} 
                            className={`px-6 py-2 rounded-lg font-bold shadow-md transition-all ${
                                autoMode 
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}>
                            {autoMode ? '🛑 STOP' : '🚀 START AUTO'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: QUEUE */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[70vh]">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-700">Request Queue</h2>
                            <button onClick={fetchQueue} className="text-blue-600 text-sm font-semibold">Refresh</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {queue.length === 0 && (
                                <div className="text-center py-20 text-gray-400">No pending searches...</div>
                            )}
                            {queue.map((item) => (
                                <div key={item._id} className={`p-3 rounded border flex justify-between items-center ${
                                    item.status === 'PROCESSING' ? 'bg-blue-50 border-blue-300' : 
                                    item.status === 'COMPLETED' ? 'bg-green-50 border-green-200 opacity-60' : 
                                    'bg-white'
                                }`}>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.query}</p>
                                        <p className="text-xs text-gray-500">{item.status}</p>
                                    </div>
                                    {item.status === 'PENDING' && !autoMode && (
                                        <button onClick={() => runWorker(item)} className="bg-gray-800 text-white px-3 py-1 text-xs rounded">Run</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: TERMINAL */}
                    <div className="bg-gray-900 text-green-400 p-4 rounded-xl shadow-lg font-mono text-xs h-[70vh] overflow-y-auto border-4 border-gray-800">
                        <div className="mb-2 pb-2 border-b border-gray-700 font-bold text-white">TERMINAL OUTPUT</div>
                        {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}