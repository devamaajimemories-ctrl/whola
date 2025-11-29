import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// Force dynamic to ensure fresh results every time
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

        // ---------------------------------------------------------
        // ROBUST SEARCH STRATEGY (Standard Regex)
        // ---------------------------------------------------------
        // This works on Localhost AND Cloud without special indices.

        // Escape special characters to prevent regex errors
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i'); // 'i' = Case Insensitive

        // Search across multiple fields
        const filter = {
            $or: [
                { name: regex },
                { category: regex }, // Matches if scraper saved Query as Category
                { tags: { $in: [regex] } }, // Matches if scraper saved Query as a Tag
                { city: regex }
            ]
        };

        // 1. Get Data
        const sellers = await Seller.find(filter)
            .select('name phone category city tags isVerified') // Optimize: Only get needed fields
            .sort({ isVerified: -1, _id: -1 }) // Priority: Verified first, then Newest
            .skip(skip)
            .limit(limit);

        // 2. Get Total Count (for Pagination)
        const total = await Seller.countDocuments(filter);

        console.log(`✅ [API] Found ${sellers.length} sellers matching "${query}"`);

        return NextResponse.json({
            success: true,
            data: sellers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalResults: total
            },
            searchMethod: 'standard_regex'
        });

    } catch (error: any) {
        console.error("❌ Search API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
