import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

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
        const { messageId } = await req.json();

        // 1. Find & Update
        const originalMsg = await Chat.findById(messageId);
        if (!originalMsg) return NextResponse.json({ success: false });

        originalMsg.offerStatus = 'ACCEPTED';
        await originalMsg.save();

        // 2. Create Confirmation Message
        await Chat.create({
            sellerId: originalMsg.sellerId,
            userId: originalMsg.userId,
            sender: 'seller',
            message: `✅ **OFFER ACCEPTED**\n\nSeller agreed to ₹${originalMsg.offerAmount}.\nBuyer can now pay.`,
            type: 'OFFER',
            offerAmount: originalMsg.offerAmount,
            offerStatus: 'PENDING' // Pending Payment
        });

        // 3. Fetch Info
        const seller = await Seller.findById(originalMsg.sellerId).select('name phone');
        const buyer = await User.findById(originalMsg.userId).select('name phone');

        // 👮 ADMIN NOTIFICATION - ACCEPTED DEAL
        const adminMsg = `🤝 *MONITOR: DEAL ACCEPTED*

✅ Seller Accepted Buyer's Price!

💰 *Agreed Amount:* ₹${originalMsg.offerAmount}

Parties:
🏪 Seller: ${seller?.name} (${seller?.phone})
👤 Buyer: ${buyer?.name} (${buyer?.phone})

🚀 *Status:* Waiting for Payment via Razorpay.`;

        await notifyAdmin(adminMsg);

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false });
    }
}