"use client";
import React, { useState } from "react";

// 1. TARGET CITIES (Major Industrial Hubs)
const TARGET_CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Ghaziabad"
];

// 2. PRODUCT LISTS
const ELECTRONICS_ITEMS = [
    "Mobile Phone Dealers", "Smartphone Wholesalers", "Refurbished Mobile Phones",
    "Laptop Dealers", "Gaming Laptops", "MacBook Dealers",
    "Mobile Accessories", "Headphones", "Power Banks",
    "DSLR Cameras", "Action Cameras", "Drones", "Smart Watches"
];

const FASHION_ITEMS = [
    "Winter Jackets", "Sweater", "Sweatshirt",
    "Ladies Woolen Kurti", "Palazzo Suit",
    "Scarves", "Pashmina Shawls", "Sarees", "Lehenga"
];

export default function BulkScraperPage() {
    const [selectedCities, setSelectedCities] = useState<string[]>(["Delhi"]); // Default 1 city
    const [logs, setLogs] = useState<string[]>([]);
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState("");

    const addToLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    // 3. THE ALL-INDIA ENGINE
    const scrapeCategory = async (categoryName: string, items: string[]) => {
        setIsScraping(true);
        setLogs([]);

        let totalOperations = items.length * selectedCities.length;
        let currentOp = 0;

        addToLog(`🚀 Starting PAN-INDIA Scrape for ${categoryName}...`);
        addToLog(`🌍 Cities Target: ${selectedCities.join(", ")}`);

        // LOOP 1: Go through every City
        for (const city of selectedCities) {
            addToLog(`\n📍 SWITCHING LOCATION TO: ${city.toUpperCase()}...`);

            // LOOP 2: Go through every Item in that City
            for (const item of items) {
                currentOp++;
                setProgress(`Processing: ${item} in ${city} (${Math.round((currentOp / totalOperations) * 100)}%)`);

                const query = `Wholesale ${item} in ${city}`;
                addToLog(`🔎 Searching: "${query}"...`);

                try {
                    const res = await fetch("/api/scraper", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query })
                    });

                    const result = await res.json();

                    if (result.success && result.data.length > 0) {
                        addToLog(`✅ Found ${result.data.length} sellers`);

                        // SAVE TO WEBSITE DATABASE IMMEDIATELY
                        await fetch("/api/seed/upload", {
                            method: "POST",
                            body: JSON.stringify({
                                sellers: result.data.map((s: any) => ({
                                    ...s,
                                    category: categoryName,
                                    tags: [categoryName, item, city, "Pan India"],
                                    city: city
                                }))
                            })
                        });
                    } else {
                        addToLog(`⚠️ No results found for ${item} in ${city}`);
                    }
                } catch (err) {
                    addToLog(`❌ Error: ${err}`);
                }

                // Wait 3 seconds between requests
                await new Promise(r => setTimeout(r, 3000));
            }
        }

        setIsScraping(false);
        setProgress("Completed");
        addToLog(`🎉 All India Scrape Finished for ${categoryName}!`);
    };

    const toggleCity = (city: string) => {
        if (selectedCities.includes(city)) {
            setSelectedCities(selectedCities.filter(c => c !== city));
        } else {
            setSelectedCities([...selectedCities, city]);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">🇮🇳 Pan-India Auto-Scraper</h1>
            <p className="mb-6 text-gray-500">Scrape data from multiple cities and publish directly to website.</p>

            {/* City Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">Select Target Cities:</h3>
                    <button
                        onClick={() => setSelectedCities(TARGET_CITIES)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                        Select All
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {TARGET_CITIES.map(city => (
                        <label key={city} className={`flex items-center space-x-2 p-2 rounded cursor-pointer border ${selectedCities.includes(city) ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent'}`}>
                            <input
                                type="checkbox"
                                checked={selectedCities.includes(city)}
                                onChange={() => toggleCity(city)}
                                className="rounded text-blue-600"
                            />
                            <span className="text-sm">{city}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                    onClick={() => scrapeCategory("Electronics", ELECTRONICS_ITEMS)}
                    disabled={isScraping}
                    className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all disabled:bg-gray-400"
                >
                    <div className="text-2xl font-bold flex items-center gap-2">
                        ⚡ Scrape Electronics
                        {isScraping && <span className="text-sm font-normal animate-pulse">Running...</span>}
                    </div>
                    <div className="text-blue-100 text-sm mt-1">Mobiles, Laptops across {selectedCities.length} cities</div>
                </button>

                <button
                    onClick={() => scrapeCategory("Fashion", FASHION_ITEMS)}
                    disabled={isScraping}
                    className="p-6 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-lg transition-all disabled:bg-gray-400"
                >
                    <div className="text-2xl font-bold flex items-center gap-2">
                        👗 Scrape Fashion
                        {isScraping && <span className="text-sm font-normal animate-pulse">Running...</span>}
                    </div>
                    <div className="text-pink-100 text-sm mt-1">Apparel, Kurtis across {selectedCities.length} cities</div>
                </button>
            </div>

            {/* Progress Bar */}
            {isScraping && (
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <div className="bg-green-500 h-4 rounded-full animate-pulse transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
            )}

            {/* Live Logs */}
            <div className="bg-black text-green-400 p-6 rounded-xl h-80 overflow-y-auto font-mono text-xs shadow-inner">
                <div className="sticky top-0 bg-black pb-2 border-b border-gray-800 flex justify-between">
                    <span>Terminal Output</span>
                    <span>{progress}</span>
                </div>
                {logs.map((log, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{log}</div>)}
            </div>
        </div>
    );
}