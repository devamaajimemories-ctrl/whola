import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";

// Admin Config
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

        // 1. Find the Buyer's Proposal
        const originalMsg = await Chat.findById(messageId);
        if (!originalMsg || originalMsg.sender !== 'user') {
            return NextResponse.json({ success: false, error: "Invalid proposal" });
        }

        // 2. Mark Original as Accepted
        originalMsg.offerStatus = 'ACCEPTED';
        await originalMsg.save();

        // 3. Create a New "Confirmed Deal" Offer from Seller
        const confirmedMsg = await Chat.create({
            sellerId: originalMsg.sellerId,
            userId: originalMsg.userId,
            sender: 'seller', // Now it's a Seller-endorsed offer
            message: `✅ **PROPOSAL ACCEPTED**\n\nThe seller accepted your price.\n\n📦 ${originalMsg.message.split('\n')[1] || 'Deal'}\n💰 Final Price: ₹${originalMsg.offerAmount}`,
            type: 'OFFER',
            offerAmount: originalMsg.offerAmount,
            offerStatus: 'PENDING' // Pending Buyer Payment
        });

        // 4. 👮 ADMIN MONITORING
        const seller = await Seller.findById(originalMsg.sellerId).select('name phone');
        const buyer = await User.findById(originalMsg.userId).select('name phone');

        const adminMsg = `🤝 *MONITOR: DEAL AGREED*

The Seller has ACCEPTED a Buyer's proposal.

💰 *Agreed Price:* ₹${originalMsg.offerAmount}

🏪 *Seller:* ${seller?.name || 'Unknown'} (${seller?.phone})
👤 *Buyer:* ${buyer?.name || 'Unknown'} (${buyer?.phone})

⏳ *Next Step:* Waiting for Buyer to Pay.`;

        notifyAdmin(adminMsg);

        return NextResponse.json({ success: true, data: confirmedMsg });

    } catch (error) {
        console.error("Accept Proposal Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}