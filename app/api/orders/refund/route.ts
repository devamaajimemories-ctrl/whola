import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { orderId, reason } = await req.json();

        // 1. Find Order
        const order = await Order.findOne({ orderId });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Check Refund Eligibility
        if (order.paymentStatus === 'REFUNDED') {
            return NextResponse.json({ message: "Already refunded" });
        }

        if (order.deliveryStatus === 'DELIVERED') {
            return NextResponse.json({
                error: "Cannot refund delivered orders. Please raise a dispute."
            }, { status: 400 });
        }

        if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'RELEASED_TO_SELLER') {
            return NextResponse.json({
                error: "No payment to refund"
            }, { status: 400 });
        }

        // 3. Process Razorpay Refund
        let refundId = null;
        try {
            const refund = await razorpay.payments.refund(order.razorpayPaymentId!, {
                amount: order.amount * 100, // Full refund in paise
                notes: {
                    reason: reason || 'Order cancelled',
                    orderId: order.orderId
                }
            });
            refundId = refund.id;
            console.log(`✅ Razorpay refund initiated: ${refundId}`);
        } catch (razorpayError: any) {
            console.error("Razorpay refund failed:", razorpayError);
            return NextResponse.json({
                error: "Refund failed: " + razorpayError.error?.description
            }, { status: 500 });
        }

        // Capture previous status before update
        const previousStatus = order.paymentStatus;

        // 4. Update Order Status
        order.paymentStatus = 'REFUNDED';
        order.deliveryStatus = 'CANCELLED';
        order.buyerNotes = reason || 'Refund processed';
        await order.save();

        // 5. Handle Seller Wallet (if funds already released)
        if (previousStatus === 'RELEASED_TO_SELLER') {
            const seller = await Seller.findById(order.sellerId);
            if (seller) {
                const balanceBefore = seller.walletBalance;
                seller.walletBalance -= order.sellerAmount; // Deduct seller's share
                await seller.save();

                // Log Transaction
                await Transaction.create({
                    sellerId: seller._id.toString(), // <--- FIX: Convert ObjectId to String
                    type: 'REFUND',
                    amount: -order.sellerAmount,
                    balanceBefore: balanceBefore,
                    balanceAfter: seller.walletBalance,
                    description: `Refund: Order ${order.orderId} cancelled`,
                    relatedId: order.orderId,
                    status: 'COMPLETED'
                });

                console.log(`💰 Deducted ₹${order.sellerAmount} from seller wallet`);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Refund processed successfully",
            refundId: refundId
        });

    } catch (error) {
        console.error("Refund Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}