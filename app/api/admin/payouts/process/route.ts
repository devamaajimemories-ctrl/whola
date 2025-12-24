import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // notes = Your bank reference number (e.g., IMPS Ref ID)
        const { sellerId, amount, notes } = await req.json();

        const seller = await Seller.findById(sellerId);
        if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        if (seller.walletBalance < amount) {
            return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }

        const balanceBefore = seller.walletBalance;
        
        // 1. Deduct from Wallet
        seller.walletBalance -= amount;
        seller.pendingPayouts = 0; // Clear any pending flags
        await seller.save();

        // 2. Log the 'PAYOUT' Transaction
        // This matches your Transaction.ts model exactly
        await Transaction.create({
            sellerId: seller._id.toString(), // ✅ FIX: Added .toString()
            type: 'PAYOUT', 
            amount: amount,
            balanceBefore: balanceBefore,
            balanceAfter: seller.walletBalance,
            description: `Manual Payout: ${notes}`,
            relatedId: `MANUAL_${Date.now()}`, 
            status: 'COMPLETED'
        });

        return NextResponse.json({
            success: true,
            newBalance: seller.walletBalance
        });

    } catch (error) {
        console.error("Process Payout Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}