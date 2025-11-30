import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkPII } from '@/lib/utils/pii-filter';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller'; // Added for admin monitoring

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

        // 1. NOTIFICATION TO BUYER
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
        const chatLink = `${websiteUrl}/buyer/messages?sellerId=${sellerId}`;

        try {
            const buyer = await User.findById(buyerId);
            if (buyer && buyer.phone) {
                const buyerMessage = `📢 *New Reply from Seller!*

A seller has replied to your inquiry.

👤 *Seller Message:* "${message}"

👇 *Click below to Reply:*
${chatLink}

_Note: Please continue on the website to have the deal._
_Tip: If the link is not clickable, please reply "Hi" to this message._`;

                sendChatNotification(buyer.phone, buyerMessage);
                console.log(`📨 Notification sent to Buyer ${buyer.phone}`);
            }
        } catch (err) {
            console.error('Error sending buyer notification:', err);
        }

        // 3. Admin Monitoring (ENHANCED - Send seller reply to admin with full details)
        const seller = await Seller.findById(sellerId);
        const sellerName = seller?.name || "Unknown Seller";
        const sellerPhone = seller?.phone || "N/A";

        const buyerInfo = await User.findById(buyerId);
        const buyerName = buyerInfo?.name || "Unknown Buyer";
        const buyerPhone = buyerInfo?.phone || "N/A";

        // Admin monitoring link (no login required)
        const adminToken = process.env.ADMIN_MONITOR_TOKEN || 'admin123secure';
        const adminMonitorLink = `${websiteUrl}/admin/monitor?token=${adminToken}&buyerId=${buyerId}&sellerId=${sellerId}`;

        const adminMessage = `👮 *CHAT MONITOR: Seller → Buyer*

🏪 *SELLER INFO:*
• Name: ${sellerName}
• WhatsApp: ${sellerPhone}

📱 *BUYER INFO:*
• Name: ${buyerName}
• WhatsApp: ${buyerPhone}

💬 *MESSAGE:* "${message}"

🔗 *Monitor Live:* ${adminMonitorLink}`;

        sendChatNotification(ADMIN_PHONE, adminMessage);
        console.log(`📨 Admin notification sent to ${ADMIN_PHONE}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Seller Send Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
