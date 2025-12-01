import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";

// Direct external bot integration
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

export const dynamic = 'force-dynamic';

// 1. GET: Fetch all buyer requirements (Newest first)
export async function GET() {
    try {
        await dbConnect();
        const requirements = await Request.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: requirements });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

// 2. POST: Admin manually forwards/broadcasts a requirement
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { requestId } = await req.json();

        const request = await Request.findById(requestId);
        if (!request) return NextResponse.json({ success: false, error: "Request not found" });

        // Find matching sellers
        let matchingSellers = await Seller.find({
            $or: [
                { category: { $regex: request.category || request.product, $options: 'i' } },
                { tags: { $in: [new RegExp(request.product, 'i')] } },
                // FIX: Added '$options:' below
                { name: { $regex: request.product, $options: 'i' } } 
            ]
        }).limit(15);

        if (matchingSellers.length === 0) {
            return NextResponse.json({ success: false, error: "No matching sellers found to forward to." });
        }

        // Send WhatsApp Broadcast
        const leadLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/dashboard/leads`;
        const message = `🚨 *Verified Business Lead!* (Admin Approved)
    
📦 *Item:* ${request.product}
📍 *Location:* ${request.city || 'India'}
QTY: ${request.quantity}
💰 *Budget:* ₹${request.estimatedPrice || 'Best Price'}

A verified buyer is looking for this product. Click to unlock details:
${leadLink}`;

        const promises = matchingSellers.map(seller => {
            if (!seller.phone || seller.phone === "No Phone") return Promise.resolve();
            return fetch(`${WHATSAPP_BOT_URL}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: seller.phone, message })
            });
        });

        await Promise.allSettled(promises);

        // Update status to indicate it was forwarded
        request.status = "FULFILLED"; 
        await request.save();

        return NextResponse.json({ 
            success: true, 
            message: `Successfully forwarded to ${matchingSellers.length} sellers.` 
        });

    } catch (error) {
        console.error("Forward Error:", error);
        return NextResponse.json({ success: false, error: "Failed to forward" }, { status: 500 });
    }
}