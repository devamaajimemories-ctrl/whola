import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import { sendWhatsAppMessage } from '@/lib/utils/notification';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { orderId } = await request.json();

        // 1. Fetch Order Details
        const order = await Order.findOne({ orderId, buyerId: userId });
        if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

        if (order.deliveryStatus === 'DELIVERED') {
            return NextResponse.json({ success: false, error: "Already confirmed" }, { status: 400 });
        }

        // 2. Update Status
        order.deliveryStatus = 'DELIVERED';
        await order.save();

        // 3. Fetch Seller to Notify
        const seller = await Seller.findById(order.sellerId);
        if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        // 4. NOTIFICATION
        const grossAmount = order.amount;
        const netPayout = order.sellerAmount;
        const bankLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/add-bank-details?orderId=${orderId}`;

        const message = `✅ *Work Verified!*
    
📦 Order: ${orderId}
💰 Paid by Buyer: ₹${grossAmount}
💵 *Your Payout:* ₹${netPayout}

${!seller.bankAccountNumber ? `⚠️ *Action Required:* Add Bank Details: ${bankLink}` : `🚀 Payout processing...`}`;

        await sendWhatsAppMessage(seller.phone, message);

        return NextResponse.json({ success: true, message: "Delivery confirmed." });

    } catch (error) {
        console.error("Confirm Delivery Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}