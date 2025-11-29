"use client";
import React, { useState } from "react";
import Papa from "papaparse";

export default function ImportPage() {
    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLogs(["📂 Reading file...", "⏳ Parsing CSV data..."]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rawData = results.data; // Array of objects from CSV
                setLogs(prev => [...prev, `✅ Parsed ${rawData.length} rows.`]);

                // Transform CSV data to match your Database Schema
                const sellers = rawData.map((row: any, index) => ({
                    id: `csv_${Date.now()}_${index}`,
                    name: row.Name || "Unknown Seller",
                    phone: row.Phone || "No Phone",
                    category: row.Category || "General",
                    city: row.City || "India",
                    tags: [row.Category, row.City, "Imported"], // Auto-tagging
                    isVerified: true
                }));

                // Send to Server
                setLogs(prev => [...prev, "🚀 Uploading to Database..."]);

                try {
                    const res = await fetch("/api/seed/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sellers })
                    });

                    if (res.ok) {
                        setLogs(prev => [...prev, "🎉 SUCCESS: All sellers added to website!"]);
                    } else {
                        setLogs(prev => [...prev, "❌ Server Error: Failed to save."]);
                    }
                } catch (err) {
                    setLogs(prev => [...prev, "❌ Network Error."]);
                }

                setUploading(false);
            }
        });
    };

    return (
        <div className="p-10 max-w-2xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">📂 Import Scraped CSV</h1>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <label className="block mb-4 font-bold text-gray-700">Select your CSV File:</label>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-400 mt-2">
                    Expected Columns: Name, Phone, Category, City
                </p>
            </div>

            {/* Logs */}
            <div className="mt-8 bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
            </div>
        </div>
    );
}