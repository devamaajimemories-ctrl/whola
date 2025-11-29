import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { headers } from 'next/headers';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const headersList = await headers();
        const buyerId = headersList.get('x-user-id');

        if (!buyerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, cancellationReason } = await req.json();

        // 1. Find Order
        const order = await Order.findOne({ orderId, buyerId });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Check if Cancellation is Allowed
        if (order.deliveryStatus === 'DELIVERED') {
            return NextResponse.json({
                error: "Cannot cancel delivered orders"
            }, { status: 400 });
        }

        if (order.deliveryStatus === 'CANCELLED') {
            return NextResponse.json({
                message: "Order already cancelled"
            });
        }

        if (order.deliveryStatus === 'SHIPPED') {
            return NextResponse.json({
                error: "Cannot cancel shipped orders. Please wait for delivery or contact support."
            }, { status: 400 });
        }

        // 3. Update Order Status
        order.deliveryStatus = 'CANCELLED';
        order.buyerNotes = cancellationReason || 'Buyer cancelled order';
        await order.save();

        console.log(`📦 Order cancelled: ${order.orderId}`);

        // 4. Trigger Automatic Refund (if payment was made)
        let refundTriggered = false;
        if (order.paymentStatus === 'PAID') {
            try {
                const refundResponse = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/orders/refund`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order.orderId,
                        reason: `Order cancelled by buyer: ${cancellationReason || 'No reason provided'}`
                    })
                });

                if (refundResponse.ok) {
                    refundTriggered = true;
                    console.log(`💰 Automatic refund initiated for ${order.orderId}`);
                }
            } catch (refundError) {
                console.error('Auto-refund failed:', refundError);
            }
        }

        // 5. Notify Seller
        await sendCancellationNotification(order);

        return NextResponse.json({
            success: true,
            message: refundTriggered
                ? "Order cancelled. Refund initiated."
                : "Order cancelled successfully.",
            refundPending: refundTriggered
        });

    } catch (error) {
        console.error("Cancellation Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

// Send Cancellation Notification to Seller
async function sendCancellationNotification(order: any) {
    try {
        const message = `⚠️ *Order Cancelled*\n\nOrder ID: ${order.orderId}\nAmount: ₹${order.amount}\n\nReason: ${order.buyerNotes}\n\nPlease do not ship this order.`;

        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: order.sellerId, // Assuming this is seller's phone
                message: message
            })
        });

        console.log('📩 Cancellation notification sent to seller');
    } catch (err) {
        console.error('Notification failed:', err);
    }
}
