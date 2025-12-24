import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { sendWhatsAppMessage } from '@/lib/utils/notification'; 
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const headersList = await headers();
        const userId = headersList.get('x-user-id'); // Seller ID

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status, courierName, trackingNumber } = await request.json();

        // Find the order ensuring it belongs to this seller
        const order = await Order.findOne({ orderId, sellerId: userId });
        
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Update Status
        order.deliveryStatus = status;
        
        // If Shipping, save courier details
        if (status === 'SHIPPED') {
            if (courierName) order.courierName = courierName;
            if (trackingNumber) order.trackingNumber = trackingNumber;
        }

        // If Delivering (Seller marks as delivered manually, though usually Buyer does this)
        if (status === 'DELIVERED') {
            order.paymentStatus = 'RELEASED_TO_SELLER';
        }

        await order.save();

        // 🔔 OPTIONAL: Notify Buyer via WhatsApp
        // Fetch Buyer Phone
        try {
            const buyer = await User.findById(order.buyerId);
            if (buyer && buyer.phone) {
                let msg = `📦 Order Update: ${orderId}\nStatus: ${status}`;
                if (status === 'SHIPPED') {
                    msg += `\nCourier: ${courierName}\nTracking: ${trackingNumber}`;
                }
                await sendWhatsAppMessage(buyer.phone, msg);
            }
        } catch (err) {
            console.error("Failed to send WhatsApp notification", err);
        }
        
        return NextResponse.json({ success: true, message: "Order status updated" });

    } catch (error) {
        console.error("Update Status Error:", error);
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}