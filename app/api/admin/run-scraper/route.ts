import { NextResponse } from 'next/server';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import dbConnect from '@/lib/db';
import SearchQueue from '@/lib/models/SearchQueue';

// 5 Minutes Timeout (Localhost can handle this easily)
export const maxDuration = 300; 

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if(!query) return NextResponse.json({ error: "No query provided" }, { status: 400 });

        console.log(`🚀 [Local Worker] Starting scrape for "${query}"...`);
        await dbConnect();

        // 1. Mark as Processing
        await SearchQueue.findOneAndUpdate({ query }, { status: 'PROCESSING' });

        // 2. Run the Infinite Scraper (Target: 300 items)
        const scrapedItems = await scrapeAndSaveSellers(query, query, 300);

        // 3. Mark as Completed
        await SearchQueue.findOneAndUpdate({ query }, { 
            status: 'COMPLETED',
            itemsFound: scrapedItems.length || 0,
            completedAt: new Date()
        });

        return NextResponse.json({ success: true, count: scrapedItems.length });

    } catch (error: any) {
        console.error("❌ Worker Failed:", error);
        // Mark as Failed so we can retry later
        await SearchQueue.findOneAndUpdate(
            { query: (req as any).query }, // Safe fallback
            { status: 'FAILED', error: error.message }
        );
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}