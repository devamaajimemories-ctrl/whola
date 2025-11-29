import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const orders = await Order.find({ buyerId: userId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: orders });

    } catch (error) {
        console.error("My Orders Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
