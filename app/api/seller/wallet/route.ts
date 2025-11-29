import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Get seller ID from secure header (set by middleware)
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                walletBalance: seller.walletBalance || 0,
                totalEarnings: seller.totalEarnings || 0,
                pendingPayouts: seller.pendingPayouts || 0,
                totalDealsCompleted: seller.totalDealsCompleted || 0
            }
        });

    } catch (error) {
        console.error("Wallet Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
