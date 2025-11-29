import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Get user ID from secure header
        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');

        if (orderId) {
            // Fetch specific order
            const order = await Order.findOne({ orderId });

            if (!order) {
                return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
            }

            // Check auth (buyer or seller can view)
            if (order.buyerId !== userId && order.sellerId !== userId) {
                return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
            }

            return NextResponse.json({ success: true, data: order });
        } else {
            // Fetch all orders for user (buyer or seller)
            const buyerOrders = await Order.find({ buyerId: userId }).sort({ createdAt: -1 });
            const sellerOrders = await Order.find({ sellerId: userId }).sort({ createdAt: -1 });

            return NextResponse.json({
                success: true,
                data: {
                    buyerOrders,
                    sellerOrders
                }
            });
        }

    } catch (error) {
        console.error("Track Order Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

// POST: Update order status (for sellers to upload tracking/delivery proof)
export async function POST(req: Request) {
    try {
        await dbConnect();

        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, deliveryStatus, trackingNumber, deliveryProof, sellerNotes } = await req.json();

        const order = await Order.findOne({ orderId, sellerId });

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Update order
        if (deliveryStatus) order.deliveryStatus = deliveryStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (deliveryProof) order.deliveryProof = deliveryProof;
        if (sellerNotes) order.sellerNotes = sellerNotes;

        await order.save();

        return NextResponse.json({ success: true, data: order });

    } catch (error) {
        console.error("Update Order Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
