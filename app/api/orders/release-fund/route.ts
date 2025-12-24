import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { orderId } = await req.json(); // Razorpay Order ID

        // 1. Find Order
        const order = await Order.findOne({ orderId });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // 2. Prevent Double Payout
        if (order.paymentStatus === 'RELEASED_TO_SELLER') {
            return NextResponse.json({ message: "Funds already released" });
        }

        // 3. Find Seller
        // FIX: Cast to 'any' to ensure TypeScript allows access to 'totalDealsCompleted'
        const seller = await Seller.findById(order.sellerId) as any;
        if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        // 4. ESCROW LOGIC: Release 95% to Seller Wallet
        // The 5% (order.commissionAmount) stays in your Razorpay/Bank account as profit.

        const payoutAmount = order.sellerAmount; // This is pre-calculated 95%

        const balanceBefore = seller.walletBalance;
        seller.walletBalance += payoutAmount;
        seller.totalEarnings += payoutAmount;
        // Use safe increment and bypass type check via 'any' cast above
        seller.totalDealsCompleted = (seller.totalDealsCompleted || 0) + 1;

        await seller.save();

        // 5. Update Order Status
        order.paymentStatus = 'RELEASED_TO_SELLER';
        order.deliveryStatus = 'DELIVERED';
        await order.save();

        // 6. Log Transaction for Ledger
        await Transaction.create({
            sellerId: seller._id.toString(), 
            type: 'DEAL_EARNING',
            amount: payoutAmount,
            balanceBefore: balanceBefore,
            balanceAfter: seller.walletBalance,
            description: `Escrow Release for Order ${order.orderId} (5% Comm. Deducted)`,
            relatedId: order.orderId,
            status: 'COMPLETED'
        });

        return NextResponse.json({
            success: true,
            message: "Funds released to seller wallet successfully."
        });

    } catch (error) {
        console.error("Fund Release Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}