import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkPII } from '@/lib/utils/pii-filter';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User'; // Added for admin monitoring

// Direct external bot integration
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

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

        // 1. Save Message to Database
        const newChat = await Chat.create({
            sellerId,
            userId: userId,
            sender: sender || 'user',
            message: message,
            isBlocked: false,
            createdAt: new Date()
        });

        // 2. NOTIFICATION LOGIC
        // Send WhatsApp notification to Seller for EVERY message
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

        // This link opens the specific chat on your website
        const chatLink = `${websiteUrl}/seller/messages?buyerId=${userId}`;

        const whatsappMessage = `📢 *New Message from Buyer!*
        
A buyer has sent you a message.

👤 *Buyer Message:* "${message}"

👇 *Click below to Reply & Fix Price:*
${chatLink}

_Note: Please continue on the website to have the deal._
_Tip: If the link is not clickable, please reply "Hi" to this message._`;

        // Fire and forget (don't await) to Seller
        sendChatNotification(seller.phone, whatsappMessage);

        console.log(`📨 Message notification sent to Seller ${seller.phone}`);

        // 3. ADMIN MONITORING
        const buyer = await User.findById(userId);
        const buyerName = buyer?.name || "Unknown Buyer";
        const buyerPhone = buyer?.phone || "N/A";

        // Admin monitoring link (no login required)
        const adminToken = process.env.ADMIN_MONITOR_TOKEN || 'admin123secure';
        const adminMonitorLink = `${websiteUrl}/admin/monitor?token=${adminToken}&buyerId=${userId}&sellerId=${sellerId}`;

        const adminMessage = `👮 *CHAT MONITOR: Buyer → Seller*

📱 *BUYER INFO:*
• Name: ${buyerName}
• WhatsApp: ${buyerPhone}

🏪 *SELLER INFO:*
• Name: ${seller.name}
• WhatsApp: ${seller.phone}

💬 *MESSAGE:* "${message}"

🔗 *Monitor Live:* ${adminMonitorLink}`;

        sendChatNotification(ADMIN_PHONE, adminMessage);
        console.log(`📨 Admin monitoring notification sent to ${ADMIN_PHONE}`);
        // END admin monitoring

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}