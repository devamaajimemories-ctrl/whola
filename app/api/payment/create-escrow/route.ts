import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/db";
import Order from "@/lib/models/Order";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sellerId, buyerId, requestId, amount } = await req.json();

        // 1. Calculate Split
        const commission = Math.round(amount * 0.05); // 5%
        const sellerShare = amount - commission;      // 95%

        // 2. Create Razorpay Order
        const options = {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
            notes: {
                type: "ESCROW_PAYMENT", // Tag for webhook
                sellerId,
                buyerId,
                commission, // Store commission in metadata
                sellerShare
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Create Internal Order Record (Status: PENDING)
        await Order.create({
            orderId: razorpayOrder.id,
            requestId,
            sellerId,
            buyerId,
            amount: amount,
            commissionAmount: commission,
            sellerAmount: sellerShare,
            paymentStatus: 'PENDING', // Waiting for Buyer to Pay
            deliveryStatus: 'PENDING'
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            key: process.env.RAZORPAY_KEY_ID,
            amount: options.amount
        });

    } catch (error) {
        console.error("Escrow Creation Error:", error);
        return NextResponse.json({ success: false, error: "Payment Init Failed" }, { status: 500 });
    }
}
