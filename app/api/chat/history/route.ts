import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const sellerId = searchParams.get('sellerId');

        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Seller ID is required" }, { status: 400 });
        }

        // Fetch chat history for this seller and the current user
        const chats = await Chat.find({
            sellerId,
            userId: userId
        }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, data: chats });

    } catch (error) {
        console.error("Chat History Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
