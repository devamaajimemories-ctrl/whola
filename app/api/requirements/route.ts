import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import RequestModel from "@/lib/models/Request";
import User from "@/lib/models/User"; 

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // 1. AUTH
        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
             return NextResponse.json({ success: false, error: "Please Login to post a requirement." }, { status: 401 });
        }

        const buyer = await User.findById(userId);
        if (!buyer) {
            return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
        }

        if (!body.product) {
             return NextResponse.json({ success: false, error: "Product name is missing" }, { status: 400 });
        }

        // 2. SAVE REQ
        const newRequest = await RequestModel.create({ 
             ...body,
             buyerName: buyer.name,
             buyerPhone: buyer.phone,
             category: body.category || "General",
             status: 'OPEN',
             createdAt: new Date()
        });

        // 3. NOTIFY ADMIN
        const adminMsg = `👮 *PENDING APPROVAL: NEW REQUIREMENT*
        
📦 Product: ${body.product}
💰 Budget: ${body.estimatedPrice}
👤 Buyer: ${buyer.name} (${buyer.phone})
📍 City: ${body.city || 'India'}

👇 Login to Admin Dashboard to Approve & Connect Sellers.`;

        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ADMIN_PHONE, message: adminMsg })
        }).catch(err => console.error("Admin Notify Error:", err));

        return NextResponse.json({
            success: true,
            message: "Requirement posted! Waiting for admin approval.",
            data: newRequest
        });

    } catch (error: any) {
        console.error("Req Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
    }
}