"use client";

import React, { useState, useMemo } from 'react';
import { Download, Database, Search, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { industrialProducts } from '@/lib/industrialData'; // Import your categories

// Define types for the scraped data
interface ScrapedSeller {
    name: string;
    phone: string;
    category: string;
    city: string;
    tags: string[];
}

export default function ManualScrapePage() {
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [scrapedData, setScrapedData] = useState<ScrapedSeller[]>([]);
    const [totalSaved, setTotalSaved] = useState(0);

    // Search State
    const [customQuery, setCustomQuery] = useState("");
    const [lastSearchedQuery, setLastSearchedQuery] = useState("");

    // NEW: Category Selection State
    const [targetCategory, setTargetCategory] = useState("General");

    // Extract all available categories from your data file for the dropdown
    const allCategories = useMemo(() => {
        // Get main category names (e.g., "Electronics", "Fashion")
        const mainCats = industrialProducts.map(c => c.category.split(':')[0].trim());
        // Get sub-products (e.g., "Smartphones", "Laptops")
        const products = industrialProducts.flatMap(c => c.products);
        // Combine and remove duplicates
        return [...new Set([...mainCats, ...products])].sort();
    }, []);

    const addToLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    // --- CORE SCRAPE FUNCTION ---
    const handleScrape = async (e?: React.FormEvent, isMore: boolean = false) => {
        if (e) e.preventDefault();

        const queryToUse = isMore ? lastSearchedQuery : customQuery;

        if (!queryToUse.trim()) {
            alert("Please enter a search query first.");
            return;
        }

        setIsScraping(true);

        if (isMore) {
            addToLog(`🔎 Digging deeper for: "${queryToUse}"...`);
        } else {
            addToLog(`🚀 Starting New Search: "${queryToUse}"...`);
            addToLog(`📂 Assigning Category: "${targetCategory}"`); // Log the category
            setLastSearchedQuery(queryToUse);
        }

        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: queryToUse,
                    config: {
                        headless: true,
                        optimize: true
                    }
                })
            });

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                let newCount = 0;

                setScrapedData(prev => {
                    const existingPhones = new Set(prev.map(p => p.phone));

                    // --- CITY DETECTION LOGIC ---
                    // Tries to find "in CityName" inside the query
                    let inferredCity = "India"; // Default
                    const lowerQuery = queryToUse.toLowerCase();

                    // Only split if " in " exists to avoid breaking random queries
                    if (lowerQuery.includes(" in ")) {
                        // Take the part AFTER the last " in "
                        const parts = queryToUse.split(/ in /i);
                        if (parts.length > 1) {
                            const rawCity = parts[parts.length - 1].trim();
                            // Capitalize first letter of each word for better display
                            inferredCity = rawCity.replace(/\b\w/g, l => l.toUpperCase());
                        }
                    }

                    const uniqueNewSellers = result.data
                        .filter((s: any) => !existingPhones.has(s.phone))
                        .map((s: any) => ({
                            name: s.name,
                            phone: s.phone,
                            category: targetCategory, // <--- NOW USES SELECTED CATEGORY
                            city: inferredCity,       // <--- NOW USES DETECTED CITY
                            tags: [queryToUse, inferredCity, targetCategory, "Manual Scrape"]
                        }));

                    newCount = uniqueNewSellers.length;
                    return [...prev, ...uniqueNewSellers];
                });

                if (newCount > 0) {
                    addToLog(`✅ Found ${newCount} unique contacts.`);
                } else {
                    addToLog(`⚠️ Found ${result.data.length} results, but they were duplicates.`);
                }
            } else {
                addToLog(`⚠️ No results found on Maps.`);
            }
        } catch (error) {
            console.error(error);
            addToLog(`❌ Error occurred during scraping.`);
        }

        setIsScraping(false);
    };

    // --- DATA UTILS ---
    const clearData = () => {
        if (confirm("Clear the table?")) {
            setScrapedData([]);
            setLogs([]);
            addToLog("🧹 Workspace cleared.");
        }
    };

    const downloadCSV = () => {
        if (scrapedData.length === 0) return;
        const headers = ["Name", "Phone", "Category", "City", "Query"];
        const csvContent = [
            headers.join(","),
            ...scrapedData.map(row => [
                `"${row.name}"`, `"${row.phone}"`, `"${row.category}"`, `"${row.city}"`, `"${row.tags[0]}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Manual_Data_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const addToDatabase = async () => {
        if (scrapedData.length === 0) return;

        const confirmSave = confirm(`Add ${scrapedData.length} sellers to Database as "${scrapedData[0].category}"?`);
        if (!confirmSave) return;

        addToLog("💾 Uploading to Seller Database...");
        try {
            const res = await fetch('/api/seed/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellers: scrapedData })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                addToLog(`✅ Database Updated: ${data.message}`);
                setTotalSaved(prev => prev + scrapedData.length);
                alert("Success! Items are now live on the website.");
            } else {
                addToLog(`❌ Save Failed: ${data.error || "Unknown Error"}`);
                alert(`Failed: ${data.error}`);
            }
        } catch (e) {
            addToLog(`❌ Network Error saving to Database.`);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manual Scraper Tool 2.0</h1>
                <p className="text-gray-600">Target specific niches and map them to website categories.</p>
            </div>

            {/* SEARCH INTERFACE */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8">
                <form onSubmit={(e) => handleScrape(e, false)} className="flex flex-col gap-4">

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* CATEGORY SELECTOR WITH MANUAL TYPING */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Category</label>
                            <input
                                list="category-options-2"
                                type="text"
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                                placeholder="Type or Select Category"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium"
                            />
                            <datalist id="category-options-2">
                                <option value="General" />
                                {allCategories.map((cat, i) => (
                                    <option key={i} value={cat} />
                                ))}
                            </datalist>
                        </div>

                        {/* QUERY INPUT */}
                        <div className="flex-1 relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Query</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={customQuery}
                                    onChange={(e) => setCustomQuery(e.target.value)}
                                    placeholder="e.g., Wholesale Smartphone Dealers in Delhi"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg"
                                    disabled={isScraping}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isScraping || !customQuery.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition-all disabled:opacity-50 flex-1 md:flex-none"
                        >
                            {isScraping && !lastSearchedQuery ? <Loader2 className="animate-spin mr-2" size={20} /> : "Search Maps"}
                        </button>

                        {/* SEARCH MORE BUTTON */}
                        {scrapedData.length > 0 && (
                            <button
                                type="button"
                                onClick={() => handleScrape(undefined, true)}
                                disabled={isScraping}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                                title="Scroll further down on Google Maps for more results"
                            >
                                {isScraping ? <Loader2 className="animate-spin mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                                Search More
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LOGS CONSOLE */}
                <div className="lg:col-span-1 bg-gray-900 text-green-400 p-4 rounded-xl h-[500px] overflow-y-auto font-mono text-xs shadow-inner border border-gray-800 flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                        <span className="font-bold text-gray-300">Logs</span>
                        {isScraping && <span className="text-yellow-400 animate-pulse">● Running</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="break-words">{log}</div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-600 italic">Logs will appear here...</div>}
                    </div>
                </div>

                {/* DATA PREVIEW */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-800">Results <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{scrapedData.length}</span></h3>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={clearData} disabled={scrapedData.length === 0} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Clear All">
                                <Trash2 size={18} />
                            </button>

                            <button onClick={downloadCSV} disabled={scrapedData.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">
                                <Download size={16} /> CSV
                            </button>

                            <button
                                onClick={addToDatabase}
                                disabled={scrapedData.length === 0}
                                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all"
                            >
                                <Database size={16} /> Add to Database
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 shadow-sm">
                                <tr>
                                    <th className="p-3 w-1/3">Name</th>
                                    <th className="p-3 w-1/4">Mobile No</th>
                                    <th className="p-3 w-1/4">Category</th>
                                    <th className="p-3 w-1/4">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {scrapedData.slice().reverse().map((row, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="p-3 font-medium text-gray-900">{row.name}</td>
                                        <td className="p-3 font-mono text-gray-600">{row.phone}</td>
                                        <td className="p-3">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                                {row.category}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500">{row.city}</td>
                                    </tr>
                                ))}
                                {scrapedData.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-400">
                                            <p>No data yet.</p>
                                        </td>
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