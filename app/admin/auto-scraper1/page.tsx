"use client";

import React, { useState, useRef } from "react";
import { industrialProducts } from "@/lib/industrialData";
import { TARGET_CITIES } from "@/lib/locations";

// --- CONFIGURATION ---
const CONCURRENT_WORKERS = 4; 
const TARGET_PER_SEARCH = 300; 

// --- PRIORITY LOCATIONS (Tier 1 & Tier 2 Industrial Hubs) ---
// These will be scraped FIRST before moving to smaller towns.
const PRIORITY_CITIES = new Set([
  // Tier 1 (Metros)
  "Delhi", "New Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune",
  // NCR & Major Industrial Hubs
  "Gurgaon", "Noida", "Greater Noida", "Ghaziabad", "Faridabad", "Thane", "Navi Mumbai", "Pimpri-Chinchwad",
  // Tier 2 (Key Markets)
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", 
  "Ludhiana", "Agra", "Nashik", "Rajkot", "Varanasi", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad", 
  "Ranchi", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", 
  "Guwahati", "Chandigarh", "Mysore", "Jalandhar", "Bhubaneswar", "Dehradun"
]);

type Log = { message: string; type: "info" | "success" | "error"; timestamp: string };

export default function AutoScraperPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, success: 0, failed: 0 });
  
  const stopSignal = useRef(false);
  const queueRef = useRef<{ product: string; city: string; category: string }[]>([]); 

  // ✅ SMART QUEUE GENERATOR (Priority Logic)
  const generateQueue = () => {
    const priorityQueue: { product: string; city: string; category: string }[] = [];
    const standardQueue: { product: string; city: string; category: string }[] = [];

    industrialProducts.forEach((cat) => {
      cat.products.forEach((prod) => {
        TARGET_CITIES.forEach((city) => {
          const task = { product: prod, city, category: cat.category };
          
          // Check if city is in our Priority List
          if (PRIORITY_CITIES.has(city)) {
            priorityQueue.push(task);
          } else {
            standardQueue.push(task);
          }
        });
      });
    });

    // 1. Shuffle Priority Queue (Randomize within Tier 1/2)
    const shuffledPriority = priorityQueue.sort(() => Math.random() - 0.5);
    
    // 2. Shuffle Standard Queue (Randomize Tier 3/4)
    const shuffledStandard = standardQueue.sort(() => Math.random() - 0.5);

    // 3. Combine: Priority First, Standard Last
    return [...shuffledPriority, ...shuffledStandard];
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

    // Generate or Resume Queue
    if (queueRef.current.length === 0) {
        const newQueue = generateQueue();
        queueRef.current = newQueue;
        setProgress({ total: newQueue.length, completed: 0, success: 0, failed: 0 });
        
        // Count priority items for logging
        const priorityCount = newQueue.filter(t => PRIORITY_CITIES.has(t.city)).length;
        addLog(`🚀 Starting. Queue: ${newQueue.length} tasks (${priorityCount} High Priority).`);
    } else {
        addLog(`▶️ Resuming. Remaining: ${queueRef.current.length}`, "info");
    }

    setIsPaused(false);

    // Worker Function
    const worker = async (id: number) => {
      while (queueRef.current.length > 0 && !stopSignal.current) {
        const task = queueRef.current.shift(); // Use shift() to take from FRONT (Priority first)
        if (!task) break;

        const isPriority = PRIORITY_CITIES.has(task.city);
        const query = `Wholesale ${task.product} in ${task.city}`;
        
        try {
          addLog(`[W${id}] ⏳ Scraping: ${query} ${isPriority ? '⭐' : ''}`, "info");
          
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

    const workers = Array.from({ length: CONCURRENT_WORKERS }, (_, i) => worker(i + 1));
    await Promise.all(workers);

    setIsRunning(false);

    if (queueRef.current.length === 0) {
        addLog("🏁 All tasks completed.", "success");
        setIsPaused(false);
    } else {
        addLog(`⏸️ Paused. ${queueRef.current.length} tasks remaining.`, "info");
        setIsPaused(true);
    }
  };

  const pauseScraping = () => {
    stopSignal.current = true;
    addLog("⏸️ Pausing...", "info");
  };

  const stopScraping = () => {
    stopSignal.current = true;
    queueRef.current = []; 
    setIsPaused(false);
    addLog("🛑 Stopped and Queue Cleared.", "error");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚡ Smart Auto-Scraper</h1>
            <p className="text-sm text-gray-500">Prioritizes Tier 1 & 2 Industrial Hubs</p>
          </div>
          <div className="flex space-x-4">
            {!isRunning && (
              <button
                onClick={startScraping}
                className={`${isPaused ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg font-bold shadow-lg transition flex items-center gap-2`}
              >
                {isPaused ? "▶️ RESUME" : "🚀 START SMART SCRAPE"}
              </button>
            )}

            {isRunning && (
               <button onClick={pauseScraping} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition">
                 ⏸️ PAUSE
               </button>
            )}

            {(isRunning || isPaused) && (
              <button onClick={stopScraping} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition">
                🛑 RESET
              </button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Queue Remaining" value={progress.total - progress.completed} color="blue" />
          <StatCard label="Completed" value={progress.completed} color="gray" />
          <StatCard label="Successful" value={progress.success} color="green" />
          <StatCard label="Failures" value={progress.failed} color="red" />
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden relative">
            <div
              className={`h-4 transition-all duration-500 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Logs Console */}
        <div className="bg-black text-green-400 p-4 rounded-lg shadow-inner h-96 overflow-y-auto font-mono text-sm border border-gray-700">
          {logs.length === 0 && <p className="text-gray-500 italic">Ready. Priority cities will be scraped first.</p>}
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