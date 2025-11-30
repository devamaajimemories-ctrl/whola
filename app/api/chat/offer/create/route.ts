import { NextResponse } from "next/server";
import { headers } from "next/headers";
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
        // sellerId in body might be the partner ID depending on context
        const { sellerId, amount, description, sender } = await req.json(); // sender: 'user' or 'seller'

        // 1. Get User ID from headers (Secure)
        const headersList = await headers();
        const authUserId = headersList.get('x-user-id');

        if (!authUserId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!amount || isNaN(amount)) {
            return NextResponse.json({ success: false, error: "Invalid Amount" });
        }
        if (!description || description.trim().length === 0) {
            return NextResponse.json({ success: false, error: "Description is required" });
        }

        // 2. Resolve Real IDs based on Sender Context
        // The Chat Model enforces: sellerId = The Seller, userId = The Buyer
        let realSellerId = "";
        let realBuyerId = "";

        if (sender === 'seller') {
            // If Sender is Seller: AuthUser is Seller, Body's sellerId is actually the Buyer
            realSellerId = authUserId;
            realBuyerId = sellerId; 
        } else {
            // If Sender is User: AuthUser is Buyer, Body's sellerId is the Seller
            realSellerId = sellerId;
            realBuyerId = authUserId;
        }

        // Determine Message Text based on Sender
        let messageText = "";
        if (sender === 'seller') {
            messageText = `🤝 **SELLER OFFER**\n📦 Item: ${description}\n💰 Price: ₹${amount}\n\nBuyer, do you accept?`;
        } else {
            messageText = `🙋‍♂️ **BUYER PROPOSAL**\n📦 Item: ${description}\n💰 Proposed Price: ₹${amount}\n\nSeller, do you accept?`;
        }

        // 3. Save to DB
        const offerMessage = await Chat.create({
            sellerId: realSellerId,
            userId: realBuyerId,
            sender: sender,
            message: messageText,
            type: 'OFFER',
            offerAmount: amount,
            offerStatus: 'PENDING'
        });

        // 4. 👮 ADMIN MONITORING NOTIFICATION
        // Fetch Names for clear reporting
        const sellerDoc = await Seller.findById(realSellerId).select('name phone');
        const buyerDoc = await User.findById(realBuyerId).select('name phone');

        const typeLabel = sender === 'seller' ? "🆕 SELLER OFFER" : "✋ BUYER PROPOSAL";
        
        const adminMsg = `👮 *MONITOR: ${typeLabel}*

💰 *Amount:* ₹${amount}
📝 *Item:* ${description}

🏪 *Seller:* ${sellerDoc?.name || 'Unknown'} (${sellerDoc?.phone || 'N/A'})
👤 *Buyer:* ${buyerDoc?.name || 'Unknown'} (${buyerDoc?.phone || 'N/A'})

ℹ️ *Status:* Created (Pending Acceptance)`;

        notifyAdmin(adminMsg);

        return NextResponse.json({ success: true, data: offerMessage });

    } catch (error) {
        console.error("Offer Create Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}