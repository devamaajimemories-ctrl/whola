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

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const { event: eventType, payload } = event;

        // ✅ UPDATED: Listen for 'order.paid' and 'payment.captured'
        if (eventType === 'order.paid' || eventType === 'payment.captured') {
            
            // In 'order.paid' and 'payment.captured', the payment entity is usually present
            const payment = payload.payment.entity;
            const orderEntity = payload.order ? payload.order.entity : null;

            // Use the order_id from the payment or the order entity
            const razorpayOrderId = payment.order_id || (orderEntity ? orderEntity.id : null);
            
            if (!razorpayOrderId) {
                 console.error("No Order ID found in webhook payload");
                 return NextResponse.json({ status: 'ignored' });
            }

            // Find order by Razorpay Order ID
            const order = await Order.findOne({ orderId: razorpayOrderId });

            if (!order) {
                console.error(`Order not found for ID: ${razorpayOrderId}`);
                return NextResponse.json({ status: 'ignored' });
            }

            // 🚨 FRAUD CHECK: Ensure Paid Amount matches Database Amount
            const paidAmount = payment.amount / 100; // Convert paise to rupees
            if (paidAmount < order.amount) {
                console.error(`🚨 FRAUD ALERT: Partial payment detected for Order ${order.orderId}`);
                return NextResponse.json({ status: 'fraud_alert' });
            }

            // 3. Mark as Paid
            if (order.paymentStatus !== 'PAID') {
                order.paymentStatus = 'PAID';
                order.razorpayPaymentId = payment.id;
                await order.save();
                console.log(`✅ Order ${order.orderId} successfully PAID: ₹${paidAmount}`);
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
}