import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

// Notification Helper
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
        const { sellerId, amount, description, sender } = await req.json();

        // Auth
        const headersList = await headers();
        const authUserId = headersList.get('x-user-id');
        if (!authUserId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Resolve IDs
        let realSellerId = sender === 'seller' ? authUserId : sellerId;
        let realBuyerId = sender === 'seller' ? sellerId : authUserId;

        // Fetch Names
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
            offerStatus: 'PENDING' 
        });

        // --- NOTIFICATIONS ---

        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

        // 1. If BUYER proposes -> Notify SELLER
        if (sender === 'user' && sellerDoc?.phone) {
            const link = `${websiteUrl}/seller/messages?buyerId=${realBuyerId}`;
            const msg = `📢 *New Price Proposal!*
            
Buyer (${buyerDoc?.name}) proposed: ₹${amount}
 for ${description}.

👇 *Click to Accept or Counter:*
${link}`;
            await sendNotification(sellerDoc.phone, msg);
        }

        // 2. If SELLER offers -> Notify BUYER
        if (sender === 'seller' && buyerDoc?.phone) {
            const link = `${websiteUrl}/buyer/messages?sellerId=${realSellerId}`;
            const msg = `🏷️ *New Offer from Seller!*
            
Seller (${sellerDoc?.name}) offered: ₹${amount}
 for ${description}.

👇 *Click to Approve & Pay:*
${link}`;
            await sendNotification(buyerDoc.phone, msg);
        }

        // 3. Notify ADMIN
        const adminMsg = `👮 *MONITOR: NEW ${sender === 'seller' ? 'OFFER' : 'PROPOSAL'}*

💰 Amount: ₹${amount}
📝 Status: Pending Acceptance

Seller: ${sellerDoc?.name}
Buyer: ${buyerDoc?.name}`;

        await sendNotification(ADMIN_PHONE, adminMsg);

        return NextResponse.json({ success: true, data: offerMessage });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}