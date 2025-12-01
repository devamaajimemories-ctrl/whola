import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809'; // Admin Number

export const dynamic = 'force-dynamic'; 

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const requestId = searchParams.get("requestId");

    if (!sellerId || !requestId) return NextResponse.json({ error: "Invalid Link" });

    try {
        await dbConnect();

        // 1. Fetch the Request
        const request = await Request.findById(requestId);
        if (!request) return NextResponse.json({ error: "Request not found" });

        // 2. Check if already taken
        if (request.status === "LOCKED") {
            return NextResponse.json({
                message: "❌ Too slow! Another seller already accepted this deal."
            });
        }

        // 3. Fetch the Real Seller
        const seller = await Seller.findById(sellerId);
        if (!seller) return NextResponse.json({ error: "Seller account not found" });

        // 4. Lock the Deal
        request.status = "LOCKED";
        request.lockedBy = sellerId;
        await request.save();

        // 5. Prepare Message for Seller
        const successMessage = `✅ *Deal Locked!*
    
You have secured the order for: ${request.product}
Buyer Name: ${request.buyerName || "Verified Buyer"}

DO NOT share personal numbers.
👉 *Reply to this message* to start chatting with the buyer instantly.`;

        // 6. Send to the REAL Seller
        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: seller.phone, 
                message: successMessage
            })
        });

        // --- ADMIN NOTIFICATION START ---
        const adminMsg = `🤝 *MONITOR: LEAD MATCHED*

A Seller has accepted a Lead!

📦 Product: ${request.product}
👤 Buyer: ${request.buyerName} (${request.buyerPhone})
🏪 Seller: ${seller.name} (${seller.phone})

🚀 Status: They are now connected. Monitor chat for disputes.`;

        fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ADMIN_PHONE, message: adminMsg })
        }).catch(err => console.error("Admin Notify Error:", err));
        // --- ADMIN NOTIFICATION END ---

        return NextResponse.json({
            success: true,
            message: "✅ Deal Locked! Check your WhatsApp to start chatting."
        });

    } catch (error) {
        console.error("Deal Accept Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}