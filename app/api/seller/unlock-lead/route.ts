import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Request from '@/lib/models/Request';
import Transaction from '@/lib/models/Transaction';
import { headers } from 'next/headers';

const UNLOCK_COST = 50; // ₹50 to unlock one lead

export async function POST(req: Request) {
    try {
        await dbConnect();

        // Get seller ID from secure header
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { requestId } = await req.json();

        if (!requestId) {
            return NextResponse.json({ success: false, error: "Request ID required" }, { status: 400 });
        }

        // 1. Find Request First to check eligibility
        const buyerRequest = await Request.findById(requestId);
        if (!buyerRequest) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        // 2. Check if already unlocked (Read Check)
        if (buyerRequest.unlockedBy && buyerRequest.unlockedBy.includes(sellerId)) {
            return NextResponse.json({
                success: true,
                alreadyUnlocked: true,
                data: {
                    buyerPhone: buyerRequest.buyerPhone,
                    buyerName: buyerRequest.buyerName
                }
            });
        }

        // 3. 🚨 CRITICAL FIX: Atomic Transaction
        // Instead of "Read Balance -> Subtract -> Save", we use findOneAndUpdate.
        // This prevents race conditions where two requests happen at the exact same millisecond.
        const updatedSeller = await Seller.findOneAndUpdate(
            { 
                _id: sellerId, 
                walletBalance: { $gte: UNLOCK_COST } // Condition: Must have enough funds
            },
            { 
                $inc: { walletBalance: -UNLOCK_COST } // Operation: Atomic decrement
            },
            { new: true } // Return the updated document
        );

        if (!updatedSeller) {
            return NextResponse.json({
                success: false,
                error: "Insufficient credits or Seller not found."
            }, { status: 402 });
        }

        // 4. Record Transaction (Audit Log)
        await Transaction.create({
            sellerId: sellerId,
            type: 'LEAD_UNLOCK',
            amount: -UNLOCK_COST,
            balanceBefore: updatedSeller.walletBalance + UNLOCK_COST,
            balanceAfter: updatedSeller.walletBalance,
            description: `Unlocked lead: ${buyerRequest.product}`,
            relatedId: requestId,
            status: 'COMPLETED'
        });

        // 5. Update Request - Add seller to unlockedBy array
        // We use $addToSet to ensure no duplicates in the array
        await Request.findByIdAndUpdate(requestId, {
            $addToSet: { unlockedBy: sellerId }
        });

        // 6. Return Buyer Contact Info
        return NextResponse.json({
            success: true,
            unlocked: true,
            data: {
                buyerPhone: buyerRequest.buyerPhone,
                buyerName: buyerRequest.buyerName || "Anonymous Buyer",
                product: buyerRequest.product,
                quantity: buyerRequest.quantity,
                budget: buyerRequest.budget
            },
            newBalance: updatedSeller.walletBalance
        });

    } catch (error) {
        console.error("Unlock Lead Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}