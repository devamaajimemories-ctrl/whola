import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { headers } from 'next/headers';

// Helper API to check if there is an active order for the chat UI
export async function GET(req: Request) {
    try {
        await dbConnect();
        const headersList = await headers();
        const userId = headersList.get('x-user-id');
        const { searchParams } = new URL(req.url);
        const sellerId = searchParams.get('sellerId');

        if (!userId || !sellerId) {
            return NextResponse.json({ activeOrder: null });
        }

        // Find an order that is PAID but NOT YET DELIVERED/CANCELLED
        const activeOrder = await Order.findOne({
            buyerId: userId,
            sellerId: sellerId,
            paymentStatus: 'PAID', 
            deliveryStatus: { $in: ['PENDING', 'SHIPPED'] }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, activeOrder });

    } catch (error) {
        return NextResponse.json({ success: false, activeOrder: null });
    }
}