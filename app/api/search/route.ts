import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service'; // Import the scraper service

// Allow up to 60 seconds for scraping operations
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        // Pagination Setup
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!query) {
            return NextResponse.json({ success: false, error: "Query 'q' is required" }, { status: 400 });
        }

        console.log(`🔍 [API] Searching for: "${query}"`);

        // Escape special characters for Regex
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        // Standard Filter
        const filter = {
            $or: [
                { name: regex },
                { category: regex },
                { tags: { $in: [regex] } },
                { city: regex }
            ]
        };

        // 1. Initial Database Search
        let sellers = await Seller.find(filter)
            .select('name phone category city tags isVerified')
            .sort({ isVerified: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        let total = await Seller.countDocuments(filter);

        // 2. 🚀 JIT SCRAPING LOGIC (If results are low)
        if (total < 5) {
            console.log(`📉 Low results (${total}) for "${query}". Triggering Auto-Scraper...`);
            
            // Construct a specific query for Google Maps
            // If the user's query doesn't have a city, default to "India" or a specific hub
            const locationContext = query.toLowerCase().includes("in ") ? "" : " in India";
            const scrapeQuery = `Wholesale ${query}${locationContext}`;

            // Run scraper (This will save new sellers to DB)
            const newSellers = await scrapeAndSaveSellers(scrapeQuery, query);

            if (newSellers.length > 0) {
                console.log(`✅ Scraper found ${newSellers.length} new sellers. Refreshing list...`);
                
                // Re-run the search to include new data
                sellers = await Seller.find(filter)
                    .select('name phone category city tags isVerified')
                    .sort({ createdAt: -1 }) // Show newest (scraped) first
                    .skip(skip)
                    .limit(limit);
                
                total = await Seller.countDocuments(filter);
            }
        }

        console.log(`✅ [API] Returning ${sellers.length} sellers.`);

        return NextResponse.json({
            success: true,
            data: sellers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalResults: total
            },
            source: total < 5 ? 'hybrid_scraped' : 'database'
        });

    } catch (error: any) {
        console.error("❌ Search API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}