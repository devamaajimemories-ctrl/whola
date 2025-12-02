import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

// Notification Helper
async function notifyAdmin(message: string) {
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: ADMIN_PHONE, message })
    }).catch(console.error);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sellerId, amount, description, sender } = await req.json();

        // Auth
        const headersList = await headers();
        const authUserId = headersList.get('x-user-id');
        if (!authUserId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Resolve IDs
        let realSellerId = sender === 'seller' ? authUserId : sellerId;
        let realBuyerId = sender === 'seller' ? sellerId : authUserId;

        // Fetch Names for Admin Log
        const sellerDoc = await Seller.findById(realSellerId).select('name phone');
        const buyerDoc = await User.findById(realBuyerId).select('name phone');

        // Create Message
        const messageText = sender === 'seller' 
            ? `🤝 **SELLER OFFER**\n📦 Item: ${description}\n💰 Final Price: ₹${amount}\n\nWaiting for Buyer to Approve & Pay.`
            : `🙋‍♂️ **BUYER PROPOSAL**\n📦 Item: ${description}\n💰 Proposed Price: ₹${amount}\n\nWaiting for Seller to Accept.`;

        const offerMessage = await Chat.create({
            sellerId: realSellerId,
            userId: realBuyerId,
            sender: sender,
            message: messageText,
            type: 'OFFER',
            offerAmount: amount,
            offerStatus: 'PENDING' // Indicates NOT ACCEPTED YET
        });

        // 👮 ADMIN NOTIFICATION - PENDING DEAL
        const adminMsg = `👮 *MONITOR: PENDING DEAL (Not Accepted Yet)*

💰 *Proposed Amount:* ₹${amount}
📝 *Status:* Waiting for ${sender === 'seller' ? 'Buyer' : 'Seller'} acceptance.

Details:
🏪 Seller: ${sellerDoc?.name} (${sellerDoc?.phone})
👤 Buyer: ${buyerDoc?.name} (${buyerDoc?.phone})

⚠️ *Action:* Monitor chat for disputes.`;

        await notifyAdmin(adminMsg);

        return NextResponse.json({ success: true, data: offerMessage });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}