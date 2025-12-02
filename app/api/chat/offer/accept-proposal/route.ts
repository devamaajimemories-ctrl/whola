import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

async function sendNotification(phone: string, message: string) {
    if(!phone) return;
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(console.error);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { messageId } = await req.json();

        // 1. Update Chat
        const originalMsg = await Chat.findById(messageId);
        if (!originalMsg) return NextResponse.json({ success: false });

        originalMsg.offerStatus = 'ACCEPTED';
        await originalMsg.save();

        // 2. Create Confirmation Msg
        await Chat.create({
            sellerId: originalMsg.sellerId,
            userId: originalMsg.userId,
            sender: 'seller',
            message: `✅ **OFFER ACCEPTED**\n\nSeller agreed to ₹${originalMsg.offerAmount}.\nBuyer can now pay.`,
            type: 'OFFER',
            offerAmount: originalMsg.offerAmount,
            offerStatus: 'PENDING'
        });

        // 3. Fetch Info
        const seller = await Seller.findById(originalMsg.sellerId).select('name phone');
        const buyer = await User.findById(originalMsg.userId).select('name phone');

        // 4. NOTIFICATIONS

        // A. Buyer Notification
        const chatLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/messages?sellerId=${originalMsg.sellerId}`;
        const buyerMsg = `🤝 *Proposal Accepted!*

The Seller (${seller?.name}) has accepted your price of ₹${originalMsg.offerAmount}.

👇 *Click below to Pay & Seal the Deal:*
${chatLink}`;

        if(buyer?.phone) {
            await sendNotification(buyer.phone, buyerMsg);
        }

        // B. Admin Notification
        const adminMsg = `🤝 *MONITOR: SELLER ACCEPTED PROPOSAL*

✅ Seller agreed to Buyer's price.
Amount: ₹${originalMsg.offerAmount}

Seller: ${seller?.name}
Buyer: ${buyer?.name}

Status: Waiting for Buyer payment.`;

        await sendNotification(ADMIN_PHONE, adminMsg);

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false });
    }
}