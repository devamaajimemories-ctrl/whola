import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ScrapeState from "@/lib/models/ScrapeState";
import { industrialProducts } from "@/lib/industrialData";
import { scrapeAndSaveSellers } from "@/lib/scraper-service"; // Re-use the robust service

// ✅ VERCEL PRO: 5 Minutes Timeout
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cronSecret = searchParams.get('secret');

        // Simple CRON authentication
        if (cronSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. BUILD PRODUCT LIST
        const allProducts = industrialProducts.flatMap(cat =>
            cat.products.map(prod => ({ product: prod, category: cat.category }))
        );

        // 2. GET CURRENT PROGRESS
        let state = await ScrapeState.findOne({ key: 'global_index' });
        if (!state) {
            state = await ScrapeState.create({ key: 'global_index', currentIndex: 0 });
        }

        // 3. SELECT BATCH (Increased for Pro Plan)
        // With 300s, we can safely process ~8-10 queries (assuming ~25s per query)
        const BATCH_SIZE = 8; 
        const startIndex = state.currentIndex;

        // Reset if finished
        if (startIndex >= allProducts.length) {
            state.currentIndex = 0;
            await state.save();
            return NextResponse.json({ message: "Cycle complete. Resetting to start." });
        }

        const itemsToScrape = allProducts.slice(startIndex, startIndex + BATCH_SIZE);
        const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur"];
        // Pick a random city for this batch to distribute data
        const randomCity = cities[Math.floor(Math.random() * cities.length)];

        console.log(`🤖 Auto-Scraper PRO running... Items ${startIndex} to ${startIndex + BATCH_SIZE} in ${randomCity}`);

        // 4. EXECUTE SCRAPES
        const results = [];
        for (const item of itemsToScrape) {
            try {
                // Construct a targeted query
                const query = `Wholesale ${item.product} in ${randomCity}`;
                
                // Use the centralized robust service
                const scraped = await scrapeAndSaveSellers(query, item.category);
                
                results.push({ 
                    product: item.product, 
                    count: scraped.length 
                });

                // Small cool-down between scrapes to be polite to Google
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`Failed to scrape ${item.product}`, err);
            }
        }

        // 5. UPDATE MEMORY
        state.currentIndex = startIndex + BATCH_SIZE;
        state.lastRun = new Date();
        await state.save();

        return NextResponse.json({
            success: true,
            message: `Processed ${itemsToScrape.length} keywords in ${randomCity}.`,
            results: results,
            nextIndex: state.currentIndex
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}