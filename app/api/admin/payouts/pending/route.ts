import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Find sellers who have money in their wallet (> 1 INR)
        // 2. We explicitly SELECT the phone number and the specific bank fields
        const sellers = await Seller.find({ 
            walletBalance: { $gt: 1 } 
        }).select('name email phone walletBalance bankAccountNumber bankIFSC bankAccountHolderName');

        return NextResponse.json({
            success: true,
            sellers
        });

    } catch (error) {
        console.error("Fetch Payouts Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}