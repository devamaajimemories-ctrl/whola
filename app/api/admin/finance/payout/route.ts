import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { orderId, adminNote } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
        }

        // 1. Find the Order
        const order = await Order.findOne({ orderId });
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // 2. Validate Status (Must be PAID by buyer, but not yet released to seller)
        if (order.paymentStatus !== 'PAID') {
            return NextResponse.json({ 
                success: false, 
                error: `Invalid status for payout. Current status: ${order.paymentStatus}. Buyer must pay first.` 
            }, { status: 400 });
        }

        // 3. Update Order Status
        order.paymentStatus = 'RELEASED_TO_SELLER';
        order.sellerNotes = adminNote || "Manual Payout by Admin";
        await order.save();

        // 4. Update Seller Statistics
        const seller = await Seller.findById(order.sellerId);
        if (seller) {
            seller.pendingPayouts = Math.max(0, (seller.pendingPayouts || 0) - order.sellerAmount);
            seller.totalEarnings = (seller.totalEarnings || 0) + order.sellerAmount;
            seller.totalDealsCompleted = (seller.totalDealsCompleted || 0) + 1;
            await seller.save();

            // 5. Create Transaction Record
            await Transaction.create({
                sellerId: seller._id.toString(), // ✅ FIX: Added .toString()
                type: 'PAYOUT',
                amount: order.sellerAmount,
                balanceBefore: seller.walletBalance || 0,
                balanceAfter: seller.walletBalance || 0,
                description: `Payout for Order #${order.orderId} (Manual Transfer)`,
                relatedId: order.orderId,
                status: 'COMPLETED'
            });
        }

        return NextResponse.json({ success: true, message: "Payout recorded successfully" });

    } catch (error) {
        console.error("Payout API Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}