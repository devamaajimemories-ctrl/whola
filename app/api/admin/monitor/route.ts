import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const buyerId = searchParams.get('buyerId');
        const sellerId = searchParams.get('sellerId');

        if (!buyerId || !sellerId) {
            return NextResponse.json({ success: false, error: "Missing IDs" }, { status: 400 });
        }

        // 1. Fetch Messages
        const messages = await Chat.find({ 
            sellerId: sellerId,
            userId: buyerId 
        }).sort({ createdAt: 1 }).lean();

        // 2. Fetch Details for Header
        const seller = await Seller.findById(sellerId).select('name phone').lean();
        
        let buyerName = "Guest";
        // Check if buyerId is a MongoDB ID (24 hex characters)
        if (buyerId.match(/^[0-9a-fA-F]{24}$/)) {
             const user = await User.findById(buyerId).select('name').lean();
             if (user) buyerName = user.name;
        } else {
             // It's likely a phone number or guest ID
             buyerName = "Guest (" + buyerId + ")";
        }

        return NextResponse.json({
            success: true,
            messages,
            meta: {
                buyerName,
                sellerName: seller?.name || "Unknown Seller"
            }
        });

    } catch (error) {
        console.error("Monitor API Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}