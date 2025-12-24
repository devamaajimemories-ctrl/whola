import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Get seller ID from secure header
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Fetch transaction history
        const transactions = await Transaction.find({ sellerId })
            .sort({ createdAt: -1 })
            .limit(50); // Last 50 transactions

        return NextResponse.json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error("Wallet History Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
