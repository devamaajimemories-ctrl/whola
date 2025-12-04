'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Database, AlertTriangle, Terminal, Plus, Trash2, CheckCircle, Clock, Loader } from 'lucide-react';

// The major industrial hubs in India to cycle through
const TARGET_CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur",
    "Ludhiana", "Chandigarh", "Indore", "Coimbatore", "Vadodara"
];

type QueueItem = {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
};

export default function DataSeeder() {
    // Input & Queue State
    const [inputCategory, setInputCategory] = useState("");
    const [queue, setQueue] = useState<QueueItem[]>([]);
    
    // Execution State
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalSaved, setTotalSaved] = useState(0);
    
    // Refs for stopping execution without re-rendering issues
    const shouldStopRef = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // --- Queue Management ---

    const addToQueue = () => {
        if (!inputCategory.trim()) return;
        const newItem: QueueItem = {
            id: Date.now().toString(),
            name: inputCategory.trim(),
            status: 'pending'
        };
        setQueue(prev => [...prev, newItem]);
        setInputCategory("");
    };

    const removeFromQueue = (id: string) => {
        if (isRunning) return; // Prevent editing while running to avoid index errors
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const updateItemStatus = (id: string, status: QueueItem['status']) => {
        setQueue(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    // --- Core Logic ---

    const processBatch = async () => {
        if (queue.filter(q => q.status === 'pending').length === 0) {
            return alert("No pending items in the queue.");
        }

        shouldStopRef.current = false;
        setIsRunning(true);
        addLog(`🚀 Starting Batch Processing...`);

        // Iterate through the queue
        for (let qIndex = 0; qIndex < queue.length; qIndex++) {
            if (shouldStopRef.current) break;

            const item = queue[qIndex];
            if (item.status !== 'pending') continue; // Skip already done items

            // 1. Start Category
            updateItemStatus(item.id, 'processing');
            addLog(`📂 Processing Category: "${item.name}"`);

            let categorySuccess = true;

            // 2. City Loop (Inner Loop)
            for (let cIndex = 0; cIndex < TARGET_CITIES.length; cIndex++) {
                if (shouldStopRef.current) break;

                const city = TARGET_CITIES[cIndex];
                const query = `${item.name} in ${city}`;
                
                // Update Progress Bar (Global progress estimate)
                const totalSteps = queue.length * TARGET_CITIES.length;
                const currentStep = (qIndex * TARGET_CITIES.length) + cIndex + 1;
                setProgress((currentStep / totalSteps) * 100);

                addLog(`🔍 Scraping ${city} (${cIndex + 1}/${TARGET_CITIES.length})...`);

                try {
                    const response = await fetch('/api/scraper', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            query: query,
                            config: { headless: true }
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        const count = result.savedCount || 0;
                        setTotalSaved(prev => prev + count);
                        addLog(`✅ Saved ${count} suppliers in ${city}.`);
                    } else {
                        addLog(`⚠️ Warning: ${result.error}`);
                    }

                } catch (error) {
                    addLog(`❌ Error in ${city}: ${(error as Error).message}`);
                    categorySuccess = false;
                }

                // Inner Loop Delay (Rate Limit)
                if (cIndex < TARGET_CITIES.length - 1 && !shouldStopRef.current) {
                    addLog(`⏳ Waiting 12s (Rate Limit)...`);
                    await sleep(12000); 
                }
            }

            // 3. Finish Category
            if (shouldStopRef.current) {
                addLog(`🛑 Batch Stopped Manually.`);
                updateItemStatus(item.id, 'pending'); // Reset to pending so we can retry later
                break;
            } else {
                updateItemStatus(item.id, categorySuccess ? 'completed' : 'failed');
                addLog(`✨ Completed Category: ${item.name}`);
                
                // Outer Loop Delay (Safety buffer between categories)
                if (qIndex < queue.length - 1) {
                    addLog(`💤 Cooling down 30s before next category...`);
                    await sleep(30000);
                }
            }
        }

        setIsRunning(false);
        addLog(`🏁 Batch Processing Finished.`);
    };

    const stopBatch = () => {
        shouldStopRef.current = true;
        addLog(`🛑 Stopping... finishing current request...`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Database className="text-blue-500" /> 
                                Database Auto-Seeder
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Queue categories and auto-populate your database.
                            </p>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Add Category to Queue</label>
                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                value={inputCategory}
                                onChange={(e) => setInputCategory(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addToQueue()}
                                placeholder="e.g. Copper Wire Manufacturers"
                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={isRunning}
                            />
                            <button 
                                onClick={addToQueue}
                                disabled={isRunning || !inputCategory}
                                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                            >
                                <Plus size={20}/>
                            </button>
                        </div>
                    </div>

                    {/* Queue List */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" /> Execution Queue
                            </h3>
                            <span className="text-xs text-gray-500">{queue.length} items</span>
                        </div>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {queue.length === 0 && (
                                <p className="text-gray-500 text-center py-8 italic">Queue is empty. Add a category above.</p>
                            )}
                            {queue.map((item, idx) => (
                                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                    item.status === 'processing' ? 'bg-blue-900/20 border-blue-500/50' : 
                                    item.status === 'completed' ? 'bg-green-900/20 border-green-500/50' : 
                                    'bg-gray-900 border-gray-700'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-mono text-sm">#{idx + 1}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.status === 'pending' && <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Pending</span>}
                                        {item.status === 'processing' && <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded flex items-center gap-1"><Loader size={12} className="animate-spin"/> Processing</span>}
                                        {item.status === 'completed' && <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Done</span>}
                                        
                                        <button 
                                            onClick={() => removeFromQueue(item.id)}
                                            disabled={isRunning}
                                            className="text-gray-600 hover:text-red-400 disabled:opacity-30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="flex gap-4">
                        {!isRunning ? (
                            <button 
                                onClick={processBatch}
                                disabled={queue.length === 0}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-900/20"
                            >
                                <Play size={24} fill="currentColor" /> Start Auto-Seeding
                            </button>
                        ) : (
                            <button 
                                onClick={stopBatch}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all animate-pulse"
                            >
                                <Pause size={24} fill="currentColor" /> Stop Batch
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Col: Stats & Logs */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-900/20 text-white">
                        <h3 className="text-blue-100 text-sm font-medium mb-1">Total Suppliers Added</h3>
                        <div className="text-5xl font-bold mb-4">{totalSaved}</div>
                        <div className="h-1 bg-blue-400/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-blue-200">
                            <span>Batch Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex gap-3">
                        <AlertTriangle className="text-yellow-500 flex-shrink-0" />
                        <div className="text-xs text-yellow-200/80 space-y-1">
                            <p><strong>Do not close this tab.</strong></p>
                            <p>The system waits 12s between cities and 30s between categories to prevent IP blocking.</p>
                        </div>
                    </div>

                    {/* Console Logs */}
                    <div className="bg-black rounded-xl border border-gray-800 overflow-hidden font-mono text-xs h-[400px] flex flex-col">
                        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2 text-gray-400">
                            <Terminal size={12} /> System Logs
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-1.5 flex flex-col-reverse custom-scrollbar">
                            {logs.length === 0 && <span className="text-gray-600 italic">System ready...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className={`break-words ${
                                    log.includes("Error") ? "text-red-400" :
                                    log.includes("Success") || log.includes("Saved") ? "text-green-400" :
                                    log.includes("Processing") ? "text-blue-300" :
                                    "text-gray-500"
                                }`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}