import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
import { scrapeAndSaveSellers } from "@/lib/scraper-service";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

// Notification Helper
async function notifySeller(seller: any, request: any) {
    // ... (Keep notification logic same as before) ...
    const leadLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/dashboard/leads/${request._id}`;
    const message = `🚨 *New Business Opportunity!* ...`; // (Shortened for brevity)

    fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: seller.phone, message: message })
    }).catch(err => console.error(`❌ Bot Notify Error:`, err));
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // ... (Validation and Request Creation logic remains the same) ...
        
        if (!body.product || !body.buyerPhone) {
             return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        const newRequest = await Request.create({
             ...body,
             category: body.category || "General",
             verificationStatus: 'VERIFIED',
             status: 'OPEN',
             createdAt: new Date()
        });

        // 1. FETCH LOCAL SELLERS
        let matchingSellers = await Seller.find({
            $or: [
                { category: { $regex: body.category || body.product, $options: 'i' } },
                { tags: { $in: [body.product, body.category] } }
            ]
        }).sort({ walletBalance: -1 }).limit(10);

        // 2. HYBRID LOGIC (Scraping)
        if (matchingSellers.length < 5) {
             const location = body.city || "India";
             const query = `Wholesale ${body.product} in ${location}`;
             const scrapedSellers = await scrapeAndSaveSellers(query, body.category || body.product);
            
             if (scrapedSellers.length > 0) {
                 const existingIds = new Set(matchingSellers.map(s => s._id.toString()));
                 const newUniqueSellers = scrapedSellers.filter(s => !existingIds.has(s._id.toString()));
                 matchingSellers = [...matchingSellers, ...newUniqueSellers];
             }
        }

        // 3. Broadcast Notifications
        if (matchingSellers.length > 0) {
            matchingSellers.forEach(seller => notifySeller(seller, newRequest));
        }

        // 4. PRODUCTION RESPONSE (SECURE)
        // We return ONLY the count and names, NOT the phone numbers.
        return NextResponse.json({
            success: true,
            message: `Requirement live! Notified ${matchingSellers.length} suppliers.`,
            data: {
                count: matchingSellers.length,
                // Only show names, safer for display if needed
                matchedSellers: matchingSellers.map(s => ({
                    name: s.name,
                    city: s.city, 
                    // phone: s.phone <--- REMOVED THIS LINE
                }))
            }
        });

    } catch (error) {
        console.error("Req Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}