import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

const LEAD_CHARGE = 50; // ₹50 per approved lead

export async function POST(req: Request) {
    try {
        await dbConnect();
        // In a real app, verify Buyer Auth here via headers/session
        const { requestId, sellerId } = await req.json();

        // 1. Fetch Data
        const lead = await Request.findById(requestId);
        const seller = await Seller.findById(sellerId);

        if (!lead || !seller) {
            return NextResponse.json({ success: false, error: "Invalid Lead or Seller" }, { status: 404 });
        }

        // 2. Check if Seller has Balance
        if (seller.walletBalance < LEAD_CHARGE) {
            return NextResponse.json({ 
                success: false, 
                error: "Seller has insufficient credits. Approval failed." 
            }, { status: 402 });
        }

        // 3. Execute Charge (The "Real World" logic)
        // Deduct from Seller
        seller.walletBalance -= LEAD_CHARGE;
        await seller.save();

        // 4. Record Transaction
        await Transaction.create({
            sellerId: seller._id.toString(), // <--- FIX: Convert ObjectId to String
            type: 'LEAD_UNLOCK',
            amount: -LEAD_CHARGE,
            balanceBefore: seller.walletBalance + LEAD_CHARGE,
            balanceAfter: seller.walletBalance,
            description: `Lead Charge: Buyer approved connection for ${lead.product}`,
            relatedId: requestId,
            status: 'COMPLETED'
        });

        // 5. Update Lead Status
        if (!lead.approvedSellers.includes(sellerId)) {
            lead.approvedSellers.push(sellerId);
            await lead.save();
        }

        // 6. Return Contact Details to Both (Unlock)
        return NextResponse.json({ 
            success: true, 
            message: "Seller approved and charged ₹50.",
            sellerPhone: seller.phone, // Send to Buyer
            buyerPhone: lead.buyerPhone // Usually sent via notification to Seller
        });

    } catch (error) {
        console.error("Approval Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}