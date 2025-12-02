import { NextResponse } from "next/server";
import { headers } from "next/headers"; 
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import User from "@/lib/models/User";
import Seller from "@/lib/models/Seller";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

async function notifyBuyer(phone: string, sellerName: string, message: string) {
    if (!phone) return;
    try {
        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone, 
                message: `💬 *Message from ${sellerName}*\n\n"${message}"\n\n👉 Reply on Website: ${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/messages` 
            })
        });
    } catch (e) {
        console.error("Failed to notify buyer:", e);
    }
}

// POST: Seller sends a message to a Buyer
export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // 1. Authenticate Seller
        const headersList = await headers();
        const userId = headersList.get("x-user-id"); 
        
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { buyerId, message, buyerName } = await req.json();

        // 2. Find the Seller Profile
        const seller = await Seller.findById(userId);
        if (!seller) {
             return NextResponse.json({ success: false, error: "Seller profile not found" }, { status: 404 });
        }
        const sellerId = userId;

        // 3. Handle Buyer ID (Phone vs MongoID)
        let targetUserId = buyerId;
        let buyerPhone = "";
        const isPhone = /^\d+$/.test(buyerId); 

        if (isPhone) {
            // Buyer ID is a phone number (Guest/Legacy)
            buyerPhone = buyerId;
            let user = await User.findOne({ phone: buyerId });
            if (!user) {
                user = await User.create({
                    name: buyerName || "Guest Buyer",
                    phone: buyerId,
                    role: 'buyer',
                    email: `guest-${buyerId}@temp.whola.in` 
                });
            }
            targetUserId = user._id.toString();
        } else {
            // Buyer ID is MongoID (Registered User)
            const user = await User.findById(buyerId);
            if (user) buyerPhone = user.phone || "";
        }

        // 4. Create New Chat Message
        const chat = await Chat.create({
            sellerId: sellerId,
            userId: targetUserId,
            sender: 'seller',
            message: message,
            type: 'TEXT',
            isBlocked: false,
        });

        // 5. [NEW] Notify Buyer via WhatsApp
        if (buyerPhone) {
            notifyBuyer(buyerPhone, seller.name, message);
        }

        return NextResponse.json({ success: true, data: chat });

    } catch (error: any) {
        console.error("Seller Send Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}