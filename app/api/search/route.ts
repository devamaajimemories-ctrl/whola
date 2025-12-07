import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!query) return NextResponse.json({ success: false, error: "Query 'q' is required" }, { status: 400 });

        console.log(`🔍 [API] Searching for: "${query}"`);

        // Standard Regex for DB Search
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        // 1. Find matching products first
        const matchingProducts = await Product.find({
            $or: [{ name: regex }, { category: regex }, { description: regex }],
            status: 'APPROVED'
        }).select('sellerId');
        const sellerIdsFromProducts = matchingProducts.map(p => p.sellerId);

        // 2. Main Seller Filter
        const filter = {
            $or: [
                { name: regex },
                { category: regex },
                { tags: { $in: [regex] } },
                { city: regex },
                { _id: { $in: sellerIdsFromProducts } }
            ]
        };

        let sellers = await Seller.find(filter)
            .select('name phone category city tags isVerified')
            .sort({ isVerified: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        let total = await Seller.countDocuments(filter);

        // 3. SMART JIT SCRAPING LOGIC
        if (total < 5) {
            console.log(`📉 Low results (${total}) for "${query}". Triggering Smart Scraper...`);

            // --- DETECT INTENT: SERVICE vs PRODUCT ---
            const lowerQ = query.toLowerCase();
            const isService = ["repair", "service", "doctor", "consultant", "clinic", "class", "mover", "transport", "gym", "saloon", "parlour"].some(k => lowerQ.includes(k));
            
            let scrapeQuery = "";
            // If query already has "in City", use it. Else append "in India"
            const locationContext = lowerQ.includes("in ") ? "" : " in India";

            if (isService) {
                // For services (e.g. "Dentist"), search directly. Don't add "Wholesale".
                scrapeQuery = `${query}${locationContext}`;
            } else {
                // For products (e.g. "Shirts"), look for "Wholesale".
                scrapeQuery = `Wholesale ${query}${locationContext}`;
            }

            console.log(`🤖 Scraping Google Maps for: "${scrapeQuery}"`);

            // Run scraper
            const newSellers = await scrapeAndSaveSellers(scrapeQuery, query);

            if (newSellers.length > 0) {
                console.log(`✅ Scraper found ${newSellers.length} new items. Refreshing list...`);
                
                // Re-run DB search to include new data
                sellers = await Seller.find(filter)
                    .select('name phone category city tags isVerified')
                    .sort({ createdAt: -1 }) 
                    .skip(skip)
                    .limit(limit);

                total = await Seller.countDocuments(filter);
            }
        }

        return NextResponse.json({
            success: true,
            data: sellers,
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalResults: total },
            source: total < 5 ? 'hybrid_scraped' : 'database'
        });

    } catch (error: any) {
        console.error("❌ Search API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}