import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
        }

        // 1. Find Order
        const order = await Order.findOne({ orderId });
        if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

        // 2. 🚨 IDEMPOTENCY CHECK: Stop if already paid
        if (order.paymentStatus === 'RELEASED_TO_SELLER') {
            return NextResponse.json({ success: true, message: "Payment already released", data: order });
        }

        // 3. Calculate Payout
        const totalAmount = order.amount;
        const commission = totalAmount * 0.05;
        const payoutAmount = totalAmount - commission;

        // 4. 🚨 ATOMIC WALLET CREDIT
        const updatedSeller = await Seller.findByIdAndUpdate(
            order.sellerId,
            {
                $inc: {
                    walletBalance: payoutAmount,
                    totalEarnings: payoutAmount,
                    totalDealsCompleted: 1,
                    pendingPayouts: -payoutAmount // Reduce from escrow
                }
            },
            { new: true }
        );

        if (!updatedSeller) {
            return NextResponse.json({ success: false, error: "Seller not found for payout" }, { status: 500 });
        }

        // 5. Update Order Status
        order.deliveryStatus = 'DELIVERED';
        order.paymentStatus = 'RELEASED_TO_SELLER';
        await order.save();

        // 6. Record Transaction
        await Transaction.create({
            sellerId: order.sellerId,
            type: 'DEAL_EARNING',
            amount: payoutAmount,
            balanceBefore: updatedSeller.walletBalance - payoutAmount,
            balanceAfter: updatedSeller.walletBalance,
            description: `Earnings for Order #${orderId} (5% Comm. Deducted)`,
            relatedId: orderId,
            status: 'COMPLETED'
        });

        // 7. Send Notification (Non-blocking)
        const withdrawLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/payouts`;
        const whatsappMessage = `💰 *Payment Received!*
Order #${orderId} marked Complete.
💵 *Order Value:* ₹${totalAmount}
✅ *Credited:* ₹${payoutAmount}
👉 *Withdraw:* ${withdrawLink}`;

        fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: updatedSeller.phone, message: whatsappMessage })
        }).catch(err => console.error("WhatsApp Notification Failed:", err));

        return NextResponse.json({ success: true, message: "Order completed successfully.", data: order });

    } catch (error) {
        console.error("Complete Order Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}