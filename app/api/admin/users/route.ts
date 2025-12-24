import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // 1. Fetch the 1000 NEWEST Buyers
        // .sort({ updatedAt: -1 }) puts the most recent at the top
        // .limit(1000) ensures only the top 1000 are kept in the view
        const buyers = await User.find({ role: 'buyer' })
            .select('name phone email updatedAt createdAt') 
            .sort({ updatedAt: -1 }) 
            .limit(1000) 
            .lean();

        // 2. Fetch the 1000 NEWEST Sellers
        const sellers = await Seller.find({})
            .select('name phone city category businessType updatedAt createdAt') 
            .sort({ updatedAt: -1 })
            .limit(1000) 
            .lean();

        return NextResponse.json({
            success: true,
            buyers,
            sellers
        });

    } catch (error) {
        console.error("Admin Users Fetch Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
    }
}