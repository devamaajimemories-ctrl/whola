"use client";

import React, { useState, useRef } from "react";
import { industrialProducts } from "@/lib/industrialData";
import { TARGET_CITIES } from "@/lib/locations";

// --- CONFIGURATION ---
const CONCURRENT_WORKERS = 4; 
const TARGET_PER_SEARCH = 300; 

type Log = { message: string; type: "info" | "success" | "error"; timestamp: string };

export default function AutoScraperPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // ✅ Track Pause State
  const [logs, setLogs] = useState<Log[]>([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, success: 0, failed: 0 });
  
  const stopSignal = useRef(false);
  const queueRef = useRef<{ product: string; city: string; category: string }[]>([]); // ✅ Persist Queue

  // Flatten Data: Combine All Products with All Target Cities
  const generateQueue = () => {
    const queue: { product: string; city: string; category: string }[] = [];
    industrialProducts.forEach((cat) => {
      cat.products.forEach((prod) => {
        TARGET_CITIES.forEach((city) => {
          queue.push({ product: prod, city, category: cat.category });
        });
      });
    });
    // Shuffle queue for better distribution
    return queue.sort(() => Math.random() - 0.5);
  };

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [
      { message, type, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 99), 
    ]);
  };

  const startScraping = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    stopSignal.current = false;

    // ✅ LOGIC: If queue is empty (fresh start), generate it. 
    // If not empty (resuming), use existing queueRef.
    if (queueRef.current.length === 0) {
        const newQueue = generateQueue();
        queueRef.current = newQueue;
        setProgress({ total: newQueue.length, completed: 0, success: 0, failed: 0 });
        addLog(`🚀 Starting Auto-Scraper. Queue size: ${newQueue.length}. Workers: ${CONCURRENT_WORKERS}`);
    } else {
        addLog(`▶️ Resuming Scraper. Remaining Tasks: ${queueRef.current.length}`, "info");
    }

    setIsPaused(false);

    // Worker Function
    const worker = async (id: number) => {
      // ✅ Read directly from Ref so all workers share the same persisting queue
      while (queueRef.current.length > 0 && !stopSignal.current) {
        const task = queueRef.current.pop();
        if (!task) break;

        const query = `Wholesale ${task.product} in ${task.city}`;
        
        try {
          addLog(`[W${id}] ⏳ Scraping: ${query}...`, "info");
          
          const res = await fetch("/api/admin/run-scraper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }), 
          });

          const data = await res.json();

          if (data.success) {
            addLog(`[W${id}] ✅ Found ${data.count} items for ${query}`, "success");
            setProgress((prev) => ({ ...prev, completed: prev.completed + 1, success: prev.success + 1 }));
          } else {
            throw new Error(data.error || "Unknown error");
          }
        } catch (error: any) {
          addLog(`[W${id}] ❌ Failed: ${query} - ${error.message}`, "error");
          setProgress((prev) => ({ ...prev, completed: prev.completed + 1, failed: prev.failed + 1 }));
        }
      }
    };

    // Launch Workers
    const workers = Array.from({ length: CONCURRENT_WORKERS }, (_, i) => worker(i + 1));
    await Promise.all(workers);

    setIsRunning(false);

    // ✅ Logic to differentiate between "Finished" and "Paused"
    if (queueRef.current.length === 0) {
        addLog("🏁 All tasks completed successfully.", "success");
        setIsPaused(false);
    } else {
        addLog(`⏸️ Paused. ${queueRef.current.length} tasks remaining in queue.`, "info");
        setIsPaused(true);
    }
  };

  // ✅ New Pause Function
  const pauseScraping = () => {
    stopSignal.current = true;
    // Note: The loop in 'worker' will break, Promise.all will resolve, 
    // and startScraping will finish, setting isRunning to false automatically.
  };

  // ✅ Updated Stop Function (Resets everything)
  const stopScraping = () => {
    stopSignal.current = true;
    queueRef.current = []; // Clear queue
    setIsPaused(false);
    addLog("🛑 Hard Stop triggered. Queue cleared.", "error");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">⚡ Turbo Auto-Scraper</h1>
          <div className="flex space-x-4">
            
            {/* START / RESUME BUTTON */}
            {!isRunning && (
              <button
                onClick={startScraping}
                className={`${isPaused ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-bold shadow-lg transition flex items-center gap-2`}
              >
                {isPaused ? "▶️ RESUME ENGINE" : "🚀 START ENGINE"}
              </button>
            )}

            {/* PAUSE BUTTON (Only visible when running) */}
            {isRunning && (
               <button
               onClick={pauseScraping}
               className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition"
             >
               ⏸️ PAUSE
             </button>
            )}

            {/* STOP BUTTON (Always visible if running or paused) */}
            {(isRunning || isPaused) && (
              <button
                onClick={stopScraping}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition"
              >
                🛑 STOP (RESET)
              </button>
            )}

          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Queue Size" value={progress.total - progress.completed} color="blue" />
          <StatCard label="Completed" value={progress.completed} color="gray" />
          <StatCard label="Successful Scrapes" value={progress.success} color="green" />
          <StatCard label="Failures" value={progress.failed} color="red" />
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden relative">
            <div
              className={`h-4 transition-all duration-500 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            ></div>
            {isPaused && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 tracking-widest">PAUSED</div>}
          </div>
        )}

        {/* Logs Console */}
        <div className="bg-black text-green-400 p-4 rounded-lg shadow-inner h-96 overflow-y-auto font-mono text-sm border border-gray-700">
          {logs.length === 0 && <p className="text-gray-500 italic">Ready to scrape. Waiting for command...</p>}
          {logs.map((log, i) => (
            <div key={i} className="mb-1 border-b border-gray-800 pb-1">
              <span className="text-gray-500">[{log.timestamp}]</span>{" "}
              <span className={log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-300" : "text-blue-300"}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Stat Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <div className={`p-4 rounded-lg shadow ${colors[color] || colors.gray}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wider">{label}</h3>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}