import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// ✅ VERCEL PRO: 5 Minutes Timeout for Bulk Uploads
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { sellers } = body;

        console.log(`[API/SEED/UPLOAD] Received request with ${sellers?.length} sellers.`);

        if (!sellers || !Array.isArray(sellers)) {
            return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 });
        }

        if (sellers.length === 0) {
            return NextResponse.json({ success: true, message: "No sellers to save." });
        }

        // Bulk Upsert to avoid duplicates
        const operations = sellers.map((seller: any) => {
            // Ensure phone is present
            if (!seller.phone || seller.phone === "No Phone") return null;

            return {
                updateOne: {
                    filter: { phone: seller.phone },
                    update: {
                        $set: {
                            name: seller.name,
                            city: seller.city || 'Unknown',
                            category: seller.category || 'General',
                            tags: seller.tags && seller.tags.length > 0 ? seller.tags : [seller.category, seller.city, 'Scraped'],
                            isVerified: true
                        }
                    },
                    upsert: true
                }
            };
        }).filter(Boolean); // Remove nulls

        if (operations.length === 0) {
            return NextResponse.json({ success: false, error: "No valid sellers with phones found." });
        }

        console.log(`[API/SEED/UPLOAD] Performing ${operations.length} upsert operations...`);
        
        // This process can be slow for large datasets, so the 300s timeout protects it
        const result = await Seller.bulkWrite(operations as any);
        
        console.log(`[API/SEED/UPLOAD] Result:`, result);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${operations.length} sellers. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`,
            details: result
        });

    } catch (error) {
        console.error("[API/SEED/UPLOAD] Upload Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error: " + (error as Error).message }, { status: 500 });
    }
}