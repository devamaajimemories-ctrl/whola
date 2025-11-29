"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Square, Download, Database, Search, RotateCcw, Plus } from 'lucide-react';
import { industrialProducts } from '@/lib/industrialData';

// Define types
interface ScrapedSeller {
    name: string;
    phone: string;
    category: string;
    city: string;
    tags: string[];
    address?: string;
}

const TARGET_CITIES = [
    // North India
    "Delhi, Delhi", "New Delhi, Delhi", "Noida, Uttar Pradesh", "Gurgaon, Haryana", "Ghaziabad, Uttar Pradesh", "Faridabad, Haryana", "Chandigarh, Punjab",
    "Ludhiana, Punjab", "Amritsar, Punjab", "Jalandhar, Punjab", "Patiala, Punjab",
    "Jaipur, Rajasthan", "Jodhpur, Rajasthan", "Kota, Rajasthan", "Udaipur, Rajasthan", "Bikaner, Rajasthan",
    "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Agra, Uttar Pradesh", "Varanasi, Uttar Pradesh", "Meerut, Uttar Pradesh", "Prayagraj, Uttar Pradesh", "Bareilly, Uttar Pradesh", "Aligarh, Uttar Pradesh",
    "Dehradun, Uttarakhand", "Haridwar, Uttarakhand", "Jammu, Jammu & Kashmir", "Srinagar, Jammu & Kashmir", "Shimla, Himachal Pradesh",

    // West India
    "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra", "Nashik, Maharashtra", "Thane, Maharashtra", "Aurangabad, Maharashtra", "Solapur, Maharashtra", "Kolhapur, Maharashtra",
    "Ahmedabad, Gujarat", "Surat, Gujarat", "Vadodara, Gujarat", "Rajkot, Gujarat", "Gandhinagar, Gujarat", "Bhavnagar, Gujarat", "Jamnagar, Gujarat",
    "Indore, Madhya Pradesh", "Bhopal, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Jabalpur, Madhya Pradesh", "Ujjain, Madhya Pradesh",
    "Panaji, Goa",

    // South India
    "Bangalore, Karnataka", "Mysore, Karnataka", "Hubli, Karnataka", "Mangalore, Karnataka", "Belgaum, Karnataka",
    "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Tiruchirappalli, Tamil Nadu", "Salem, Tamil Nadu", "Tiruppur, Tamil Nadu", "Erode, Tamil Nadu",
    "Hyderabad, Telangana", "Warangal, Telangana", "Nizamabad, Telangana", "Karimnagar, Telangana",
    "Visakhapatnam, Andhra Pradesh", "Vijayawada, Andhra Pradesh", "Guntur, Andhra Pradesh", "Nellore, Andhra Pradesh", "Kurnool, Andhra Pradesh",
    "Kochi, Kerala", "Thiruvananthapuram, Kerala", "Kozhikode, Kerala", "Thrissur, Kerala", "Kannur, Kerala",

    // East India
    "Kolkata, West Bengal", "Howrah, West Bengal", "Siliguri, West Bengal", "Durgapur, West Bengal", "Asansol, West Bengal",
    "Patna, Bihar", "Gaya, Bihar", "Muzaffarpur, Bihar", "Bhagalpur, Bihar",
    "Bhubaneswar, Odisha", "Cuttack, Odisha", "Rourkela, Odisha", "Berhampur, Odisha",
    "Ranchi, Jharkhand", "Jamshedpur, Jharkhand", "Dhanbad, Jharkhand", "Bokaro, Jharkhand",
    "Guwahati, Assam", "Silchar, Assam", "Dibrugarh, Assam",
    "Raipur, Chhattisgarh", "Bhilai, Chhattisgarh", "Bilaspur, Chhattisgarh"
];

export default function BulkScrapePage() {
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [scrapedData, setScrapedData] = useState<ScrapedSeller[]>([]);
    const [currentTask, setCurrentTask] = useState("");
    const [totalSaved, setTotalSaved] = useState(0);
    const [progress, setProgress] = useState<{ index: number, total: number } | null>(null);

    // Manual Search State
    const [customQuery, setCustomQuery] = useState("");
    const [targetCategory, setTargetCategory] = useState("General");

    // Refs to control the loop
    const stopRef = useRef(false);

    useEffect(() => {
        // Load saved progress on mount
        const savedIndex = localStorage.getItem('scrapeIndex');
        if (savedIndex) {
            const total = calculateTotalTasks();
            setProgress({ index: parseInt(savedIndex), total });
        }
    }, []);

    // Extract all available categories from data file for dropdown
    const allCategories = useMemo(() => {
        const mainCats = industrialProducts.map(c => c.category.split(':')[0].trim());
        const products = industrialProducts.flatMap(c => c.products);
        return [...new Set([...mainCats, ...products])].sort();
    }, []);

    const calculateTotalTasks = () => {
        let count = 0;
        for (const category of industrialProducts) {
            for (const product of category.products) {
                count += TARGET_CITIES.length;
            }
        }
        return count;
    };

    const addToLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    // --- MANUAL SEARCH FUNCTION (Fixed for City & Category) ---
    const handleManualScrape = async (e?: React.FormEvent, isMore: boolean = false) => {
        if (e) e.preventDefault();
        if (!customQuery.trim()) return;

        setIsScraping(true);
        setCurrentTask(isMore ? `Searching More: "${customQuery}"` : `Searching: "${customQuery}"`);

        addToLog(isMore
            ? `🔎 Searching for more results: "${customQuery}"...`
            : `🔎 Starting Manual Search: "${customQuery}" in category "${targetCategory}"...`
        );

        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: customQuery,
                    config: { headless: true, optimize: false } // Changed to TRUE for background scraping
                })
            });

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                // Deduplicate against existing data using Phone Number
                let newCount = 0;
                setScrapedData(prev => {
                    const existingPhones = new Set(prev.map(p => p.phone));

                    // --- CITY DETECTION LOGIC ---
                    let inferredCity = "India";
                    const lowerQuery = customQuery.toLowerCase();
                    if (lowerQuery.includes(" in ")) {
                        const parts = customQuery.split(/ in /i);
                        if (parts.length > 1) {
                            const rawCity = parts[parts.length - 1].trim();
                            inferredCity = rawCity.replace(/\b\w/g, l => l.toUpperCase());
                        }
                    }

                    const uniqueNewSellers = result.data
                        .filter((s: any) => !existingPhones.has(s.phone))
                        .map((s: any) => ({
                            name: s.name,
                            phone: s.phone,
                            category: targetCategory, // <--- Use Selected Category
                            city: inferredCity,       // <--- Use Detected City
                            tags: [customQuery, "Manual", "Scraped", targetCategory, inferredCity]
                        }));

                    newCount = uniqueNewSellers.length;
                    return [...prev, ...uniqueNewSellers];
                });

                const debugMsg = result.debug ? ` (Raw: ${result.debug.totalFound})` : "";

                if (newCount > 0) {
                    addToLog(`✅ Added ${newCount} new unique sellers${debugMsg}.`);
                } else {
                    addToLog(`⚠️ Scraper found ${result.data.length} results, but all were duplicates.`);
                }
            } else {
                addToLog(`⚠️ No results found for "${customQuery}"`);
            }
        } catch (error) {
            console.error(error);
            addToLog(`❌ Error during manual scrape.`);
        }

        setIsScraping(false);
        setCurrentTask("Idle");
    };

    // --- BULK SCRAPE FUNCTIONS ---
    const startScraping = async (resume: boolean = false) => {
        setIsScraping(true);
        stopRef.current = false;

        if (!resume) {
            setLogs([]);
            setScrapedData([]);
            setTotalSaved(0);
            localStorage.setItem('scrapeIndex', '0'); // Reset progress
            addToLog("🚀 Starting Fresh Bulk Scrape...");
        } else {
            addToLog("▶️ Resuming Bulk Scrape...");
        }

        // 1. Build the Queue
        const queue = [];
        for (const category of industrialProducts) {
            for (const product of category.products) {
                for (const city of TARGET_CITIES) {
                    queue.push({ category: category.category, product, city });
                }
            }
        }

        const startIndex = resume ? parseInt(localStorage.getItem('scrapeIndex') || '0') : 0;
        addToLog(`📋 Queue has ${queue.length} tasks. Starting from #${startIndex + 1}`);

        // 2. Process Queue
        for (let i = startIndex; i < queue.length; i++) {
            if (stopRef.current) {
                addToLog("🛑 Scraping Stopped by User.");
                break;
            }

            const task = queue[i];
            const { category, product, city } = task;

            // Update Progress
            localStorage.setItem('scrapeIndex', i.toString());
            setProgress({ index: i, total: queue.length });

            // Randomize search query
            const prefixes = ["Wholesale", "Manufacturers of", "Suppliers of", "Dealers of", "Distributors of"];
            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const cleanProduct = product.replace(/\([^)]*\)/g, '').trim();
            const queryText = `${randomPrefix} ${cleanProduct} in ${city}`;

            setCurrentTask(`${queryText} (${i + 1}/${queue.length})`);

            try {
                const response = await fetch('/api/scraper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: queryText,
                        config: { headless: true, optimize: false } // Changed to TRUE for background scraping
                    })
                });

                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    setScrapedData(prev => {
                        const existingPhones = new Set(prev.map(p => p.phone));
                        const newSellers = result.data
                            .filter((s: any) => !existingPhones.has(s.phone))
                            .map((s: any) => ({
                                name: s.name,
                                phone: s.phone,
                                category: category,
                                city: city,
                                tags: [product, category, city, "Wholesaler", "Scraped"]
                            }));

                        if (newSellers.length > 0) {
                            addToLog(`✅ Found ${newSellers.length} new sellers for ${product} in ${city}`);
                            return [...prev, ...newSellers];
                        } else {
                            addToLog(`⚠️ Found duplicates only for ${product} in ${city}`);
                            return prev;
                        }
                    });
                } else {
                    addToLog(`⚠️ No data found for ${product} in ${city}`);
                }

            } catch (error) {
                console.error(error);
                addToLog(`❌ Error scraping ${product} in ${city}`);
            }

            // Delay
            await new Promise(r => setTimeout(r, 2000));
        }

        setIsScraping(false);
        if (!stopRef.current) {
            setCurrentTask("Completed");
            addToLog("🎉 Bulk Scraping Finished.");
            localStorage.setItem('scrapeIndex', '0');
        }
    };

    const stopScraping = () => {
        stopRef.current = true;
    };

    const downloadCSV = () => {
        if (scrapedData.length === 0) return;
        const headers = ["Name", "Phone", "Category", "City"];
        const csvContent = [
            headers.join(","),
            ...scrapedData.map(row => [
                `"${row.name}"`, `"${row.phone}"`, `"${row.category}"`, `"${row.city}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Scrape_Data_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveToDatabase = async () => {
        if (scrapedData.length === 0) return;

        const confirmSave = confirm(`Add ${scrapedData.length} sellers to Database?`);
        if (!confirmSave) return;

        addToLog("💾 Saving to Database...");
        try {
            const res = await fetch('/api/seed/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellers: scrapedData })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                addToLog(`✅ ${data.message}`);
                setTotalSaved(prev => prev + scrapedData.length);
                alert("Successfully saved to database!");
            } else {
                addToLog(`❌ Save Failed: ${data.error || "Unknown Error"}`);
            }
        } catch (e) {
            addToLog(`❌ Network Error saving to Database.`);
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Bulk Scraper & Manual Search</h1>
                    <p className="text-gray-600">Scrape Industrial Data from Google Maps (Background Mode)</p>
                    {progress && (
                        <p className="text-xs text-blue-600 mt-1 font-mono">
                            Auto-Progress: {progress.index} / {progress.total} ({(progress.index / progress.total * 100).toFixed(1)}%)
                        </p>
                    )}
                </div>
                <div className="space-x-2 flex">
                    {!isScraping ? (
                        <>
                            {progress && progress.index > 0 && (
                                <button
                                    onClick={() => startScraping(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition-all text-sm"
                                >
                                    <RotateCcw className="mr-2" size={16} /> Resume Auto
                                </button>
                            )}
                            <button
                                onClick={() => startScraping(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition-all text-sm"
                            >
                                <Play className="mr-2" size={16} /> {progress && progress.index > 0 ? "Restart Auto" : "Start Auto-Scrape"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={stopScraping}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition-all text-sm"
                        >
                            <Square className="mr-2" size={16} /> Stop
                        </button>
                    )}
                </div>
            </div>

            {/* MANUAL SEARCH CARD */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Manual Custom Search</h3>
                <form onSubmit={(e) => handleManualScrape(e, false)} className="flex flex-col md:flex-row gap-4 items-center">

                    {/* CATEGORY INPUT WITH DATALIST */}
                    <div className="w-full md:w-1/3">
                        <input
                            list="category-options"
                            type="text"
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            placeholder="Select or Type Category"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 text-sm"
                        />
                        <datalist id="category-options">
                            <option value="General" />
                            {allCategories.map((cat, i) => (
                                <option key={i} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div className="flex-1 relative w-full">
                        <input
                            type="text"
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            placeholder="Enter query (e.g. 'Wholesale Rice in Mumbai')"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            disabled={isScraping}
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>

                    <button
                        type="submit"
                        disabled={isScraping || !customQuery.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full md:w-auto justify-center"
                    >
                        {isScraping ? "Running..." : "Search"}
                    </button>

                    {/* Search More Button */}
                    {scrapedData.length > 0 && customQuery && (
                        <button
                            type="button"
                            onClick={() => handleManualScrape(undefined, true)}
                            disabled={isScraping}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg font-bold flex items-center shadow-md transition-all disabled:opacity-50 whitespace-nowrap w-full md:w-auto justify-center"
                            title="Search again to find more results"
                        >
                            <Plus className="mr-1" size={18} /> More
                        </button>
                    )}
                </form>
                <p className="text-xs text-gray-400 mt-2 ml-1">
                    Tip: You can select an existing category or type a new one to group your results.
                </p>
            </div>

            {/* STATUS CARD */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase">Current Task</h3>
                        <p className="text-xl font-mono text-blue-600 mt-1">{currentTask || "Idle"}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-bold text-gray-500 uppercase">Total Found</h3>
                        <p className="text-3xl font-bold text-green-600">{scrapedData.length}</p>
                        {totalSaved > 0 && <p className="text-sm text-gray-500 mt-1">Saved: {totalSaved}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LOGS */}
                <div className="lg:col-span-1 bg-black text-green-400 p-4 rounded-xl h-96 overflow-y-auto font-mono text-xs shadow-inner">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0">{log}</div>
                    ))}
                    {logs.length === 0 && <span className="text-gray-600">Logs will appear here...</span>}
                </div>

                {/* DATA TABLE */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-96">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 className="font-bold text-gray-700">Scraped Data</h3>
                        <div className="space-x-2">
                            <button onClick={downloadCSV} disabled={scrapedData.length === 0} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-bold hover:bg-green-200 disabled:opacity-50">
                                <Download size={14} className="inline mr-1" /> CSV
                            </button>
                            <button onClick={saveToDatabase} disabled={scrapedData.length === 0} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold hover:bg-blue-200 disabled:opacity-50">
                                <Database size={14} className="inline mr-1" /> Save to DB
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 font-bold text-gray-600">Name</th>
                                    <th className="p-3 font-bold text-gray-600">Phone</th>
                                    <th className="p-3 font-bold text-gray-600">City</th>
                                    <th className="p-3 font-bold text-gray-600">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {scrapedData.slice().reverse().map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-3">{row.name}</td>
                                        <td className="p-3 font-mono">{row.phone}</td>
                                        <td className="p-3">{row.city}</td>
                                        <td className="p-3 text-gray-500">{row.category}</td>
                                    </tr>
                                ))}
                                {scrapedData.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">No data scraped yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}