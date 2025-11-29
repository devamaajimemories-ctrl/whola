import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import { checkPII } from '@/lib/utils/pii-filter';

// This endpoint simulates a Webhook receiving a message FROM the Seller (via WhatsApp)
export async function POST(req: Request) {
    try {
        await dbConnect();
        // Note: We extract senderName from the body but don't save it to the Chat model
        // because the schema doesn't support it.
        const { sellerId, message, senderName } = await req.json();

        if (!message || !sellerId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check Incoming Message for PII
        const piiCheck = checkPII(message);

        let finalMessage = message;
        let isBlocked = false;

        if (!piiCheck.isSafe) {
            // Option B: Redact and Notify (Better for "Trust-First" visibility)
            finalMessage = `[BLOCKED SYSTEM MESSAGE]: The seller tried to share ${piiCheck.detected}. This is not allowed.`;
            isBlocked = true;
        }

        // 2. Save Message to MongoDB
        const newMessage = await Chat.create({
            sellerId,
            userId: 'guest', // Placeholder
            sender: 'seller', // It's coming FROM the seller
            // REMOVED: senderName: senderName || 'Seller', (Not in Schema)
            message: finalMessage,
            isBlocked
        });

        return NextResponse.json({
            success: true,
            data: newMessage,
            warning: isBlocked ? "Message contained PII and was redacted." : null
        });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}