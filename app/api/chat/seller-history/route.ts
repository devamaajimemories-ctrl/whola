import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const buyerId = searchParams.get('buyerId');

        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!buyerId) {
            return NextResponse.json({ success: false, error: "Buyer ID is required" }, { status: 400 });
        }

        // Fetch chat history between this seller and buyer
        const chats = await Chat.find({
            sellerId: sellerId,
            userId: buyerId
        }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: chats });

    } catch (error) {
        console.error("Seller History Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
