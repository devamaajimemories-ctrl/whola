import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkPII } from '@/lib/utils/pii-filter';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { buyerId, message } = body;

        // Get Seller ID from headers (Secure)
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!buyerId || !message) {
            return NextResponse.json({ success: false, error: 'Buyer ID and message are required' }, { status: 400 });
        }

        // PII Check (Strict)
        const piiCheck = checkPII(message);
        if (!piiCheck.isSafe) {
            return NextResponse.json(
                { success: false, error: `Message content not allowed: ${piiCheck.detected} detected.` },
                { status: 400 }
            );
        }

        // Save Message to Database
        const newChat = await Chat.create({
            sellerId: sellerId,
            userId: buyerId,
            sender: 'seller',
            message: message,
            type: 'TEXT',
            isBlocked: false,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, data: newChat });

    } catch (error) {
        console.error('Error in seller send route:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
