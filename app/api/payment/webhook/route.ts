import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) return NextResponse.json({ error: "Config Error" }, { status: 500 });

        // 1. Verify Signature (Security Check)
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const { event: eventType, payload } = event;

        // 2. Handle Payment Link Paid Event
        if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
            const payment = payload.payment.entity;
            const paymentLink = payload.payment_link?.entity;
            
            // Use reference_id (Our Internal Order ID) if available, otherwise Razorpay Order ID
            const trackingId = paymentLink?.reference_id || payment.order_id;
            
            const order = await Order.findOne({ orderId: trackingId });

            if (!order) {
                console.error(`Order not found for ID: ${trackingId}`);
                return NextResponse.json({ status: 'ignored' });
            }

            // 🚨 FRAUD CHECK: Ensure Paid Amount matches Database Amount
            const paidAmount = payment.amount / 100; // Convert paise to rupees
            if (paidAmount < order.amount) {
                console.error(`🚨 FRAUD ALERT: Partial payment detected for Order ${order.orderId}`);
                // Do NOT mark as PAID. Keep as PENDING or mark SUSPICIOUS.
                return NextResponse.json({ status: 'fraud_alert' });
            }

            // 3. Mark as Paid
            order.paymentStatus = 'PAID';
            order.razorpayPaymentId = payment.id;
            await order.save();

            console.log(`✅ Order ${order.orderId} successfully PAID: ₹${paidAmount}`);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
}