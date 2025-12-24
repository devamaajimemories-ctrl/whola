import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SearchQueue from '@/lib/models/SearchQueue';

// Force dynamic to ensure it doesn't cache empty results
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        
        // Fetch PENDING and PROCESSING items first, then recent COMPLETED ones
        const queue = await SearchQueue.find({})
            .sort({ status: 1, requestedAt: -1 }) 
            .limit(50);
            
        return NextResponse.json({ queue });
    } catch (error) {
        console.error("Queue Fetch Error:", error);
        // Return empty queue on error instead of crashing
        return NextResponse.json({ queue: [] });
    }
}