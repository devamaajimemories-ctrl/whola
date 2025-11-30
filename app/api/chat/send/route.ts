import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkPII } from '@/lib/utils/pii-filter';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Chat from '@/lib/models/Chat';

// Direct external bot integration
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

async function sendChatNotification(phone: string, message: string) {
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(err => {
        console.error(`❌ External Bot Failed to send chat notification to ${phone}:`, err);
    });
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { sellerId, message, sender } = body;

        // Get User ID from headers (Secure)
        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!sellerId || !message) {
            return NextResponse.json({ success: false, error: 'Seller ID and message are required' }, { status: 400 });
        }

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
        }

        // PII Check (Strict)
        const piiCheck = checkPII(message);
        if (!piiCheck.isSafe) {
            return NextResponse.json(
                { success: false, error: `Message content not allowed: ${piiCheck.detected} detected.` },
                { status: 400 }
            );
        }

        // 1. CHECK HISTORY: See if this is the VERY FIRST message
        const previousMessagesCount = await Chat.countDocuments({
            sellerId: sellerId,
            userId: userId
        });

        const isFirstMessage = previousMessagesCount === 0;

        // 2. Save Message to Database
        const newChat = await Chat.create({
            sellerId,
            userId: userId, 
            sender: sender || 'user',
            message: message,
            isBlocked: false,
            createdAt: new Date()
        });

        // 3. CONDITIONAL NOTIFICATION LOGIC
        // Only send WhatsApp notification if it is the FIRST message.
        if (isFirstMessage) {
            const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
            
            // This link opens the specific chat on your website
            const chatLink = `${websiteUrl}/seller/messages?buyerId=${userId}`;

            const whatsappMessage = `📢 *New Buyer Alert!*
            
A buyer is interested in your products and has sent a message.

👤 *Buyer Message:* "${message.substring(0, 100)}..."

👇 *Click below to Reply & Fix Price:*
${chatLink}

_Note: Please continue the conversation on the website to secure the deal._`;

            // Fire and forget (don't await)
            sendChatNotification(seller.phone, whatsappMessage);
            
            console.log(`📨 First message notification sent to ${seller.phone}`);
        } else {
            // It's not the first message, so we DO NOT send a notification.
            // This forces the seller to check the app/website for ongoing chats.
            console.log(`ziplog: Ongoing conversation. No WhatsApp notification sent.`);
        }

        return NextResponse.json({ success: true, data: newChat });

    } catch (error) {
        console.error('Error in chat send route:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}