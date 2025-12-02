import { NextResponse } from "next/server";
import { headers } from "next/headers"; // Import headers to get User ID
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User"; 
import { scrapeAndSaveSellers } from "@/lib/scraper-service";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809'; 

// Helper to send WhatsApp notification
async function notifySeller(seller: any, request: any, buyerId: string) {
    if (!seller.phone || seller.phone === "No Phone") return;

    const chatLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/messages?buyerId=${buyerId}`;

    const message = `🚨 *New Business Lead!*
    
📦 *Item:* ${request.product}
📍 *Location:* ${request.city || 'India'}
QTY: ${request.quantity}
💰 *Budget:* ₹${request.estimatedPrice || 'Best Price'}

✅ A buyer is waiting for your quote.
👇 *Click here to Chat directly:*
${chatLink}

_Note: Please chat on the website._`;

    try {
        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: seller.phone, message: message })
        });
    } catch (err) {
        console.error(`❌ Bot Notify Error for ${seller.phone}:`, err);
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // 1. AUTHENTICATION CHECK
        // We now require the user to be logged in. Guest logic is removed.
        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
             return NextResponse.json({ success: false, error: "Please Login to post a requirement." }, { status: 401 });
        }

        // 2. Fetch the Authenticated User
        // We use the User from DB to ensure the phone number is valid and exists
        const buyer = await User.findById(userId);
        
        if (!buyer) {
            return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
        }

        if (!body.product) {
             return NextResponse.json({ success: false, error: "Product name is missing" }, { status: 400 });
        }

        // 3. Save Buyer Requirement
        // We override buyerName and buyerPhone with the authenticated user's details
        // This prevents "Invalid No" from being saved.
        const newRequest = await Request.create({
             ...body,
             buyerName: buyer.name,  // Forced from Auth
             buyerPhone: buyer.phone,// Forced from Auth
             category: body.category || "General",
             status: 'OPEN',
             createdAt: new Date()
        });

        console.log(`📝 Requirement created by ${buyer.name}: ${body.product}`);

        // --- ADMIN NOTIFICATION ---
        const adminMsg = `🆕 *MONITOR: NEW REQUIREMENT*
        
📦 Product: ${body.product}
💰 Budget: ${body.estimatedPrice}
👤 Buyer: ${buyer.name} (${buyer.phone})
📍 City: ${body.city || 'India'}

ℹ️ System is broadcasting to sellers...`;

        fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ADMIN_PHONE, message: adminMsg })
        }).catch(err => console.error("Admin Notify Error:", err));

        // 4. FIND SELLERS (DB + Scraper Logic)
        let matchingSellers = await Seller.find({
            $or: [
                { category: { $regex: body.category || body.product, $options: 'i' } },
                { tags: { $in: [new RegExp(body.product, 'i')] } },
                { name: { $regex: body.product, $options: 'i' } }
            ]
        }).limit(15);

        // JIT Scraper fallback
        if (matchingSellers.length < 10) { 
             const location = body.city ? `${body.city}, India` : "India";
             const query = `Wholesale ${body.product} dealers in ${location}`;
             const scrapedSellers = await scrapeAndSaveSellers(query, body.category || body.product);
            
             if (scrapedSellers.length > 0) {
                 const existingIds = new Set(matchingSellers.map(s => s._id.toString()));
                 const newUniqueSellers = scrapedSellers.filter(s => !existingIds.has(s._id.toString()));
                 matchingSellers = [...matchingSellers, ...newUniqueSellers];
             }
        }

        // 5. BROADCAST
        console.log(`📢 Broadcasting to ${matchingSellers.length} sellers...`);
        const notificationPromises = matchingSellers.map(seller => 
            notifySeller(seller, newRequest, userId)
        );
        await Promise.allSettled(notificationPromises);

        return NextResponse.json({
            success: true,
            message: `Requirement live! Notified ${matchingSellers.length} suppliers.`,
            data: {
                count: matchingSellers.length
            }
        });

    } catch (error: any) {
        console.error("Req Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
    }
}