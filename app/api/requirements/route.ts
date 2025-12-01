import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
import { scrapeAndSaveSellers } from "@/lib/scraper-service";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809'; // Admin Number

// Helper to send WhatsApp notification
async function notifySeller(seller: any, request: any) {
    if (!seller.phone || seller.phone === "No Phone") return;

    const leadLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/dashboard/leads`;
    const message = `🚨 *New Business Lead!*
    
📦 *Item:* ${request.product}
📍 *Location:* ${request.city || 'India'}
QTY: ${request.quantity}
💰 *Budget:* ₹${request.estimatedPrice || 'Best Price'}

Someone is looking for this product. Reply or click to unlock details:
${leadLink}`;

    console.log(`📤 Notifying ${seller.name} (${seller.phone})...`);

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

        if (!body.product || !body.buyerPhone) {
             return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        // 1. Save Buyer Requirement
        const newRequest = await Request.create({
             ...body,
             category: body.category || "General",
             status: 'OPEN',
             createdAt: new Date()
        });

        console.log(`📝 Requirement created: ${body.product} in ${body.city || 'India'}`);

        // --- ADMIN NOTIFICATION START ---
        const adminMsg = `🆕 *MONITOR: NEW REQUIREMENT*
        
📦 Product: ${body.product}
💰 Budget: ${body.estimatedPrice}
👤 Buyer: ${body.buyerName} (${body.buyerPhone})
📍 City: ${body.city || 'India'}

ℹ️ System is now searching for sellers...`;

        // Fire and forget admin alert
        fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ADMIN_PHONE, message: adminMsg })
        }).catch(err => console.error("Admin Notify Error:", err));
        // --- ADMIN NOTIFICATION END ---

        // 2. SEARCH: Find existing sellers in DB
        // We use regex to match category OR product name tags
        let matchingSellers = await Seller.find({
            $or: [
                { category: { $regex: body.category || body.product, $options: 'i' } },
                { tags: { $in: [new RegExp(body.product, 'i')] } },
                { name: { $regex: body.product, $options: 'i' } } // Also check seller names
            ]
        }).limit(15);

        // 3. 🚀 SCRAPE: If not enough local sellers, go to Google Maps
        if (matchingSellers.length < 10) { 
             const location = body.city ? `${body.city}, India` : "India";
             const query = `Wholesale ${body.product} dealers in ${location}`;
             
             console.log(`⚡ Shortage of sellers. Scraping Maps for: "${query}"`);
             
             const scrapedSellers = await scrapeAndSaveSellers(query, body.category || body.product);
            
             if (scrapedSellers.length > 0) {
                 // Merge new sellers into the notification list, avoiding ID duplicates
                 const existingIds = new Set(matchingSellers.map(s => s._id.toString()));
                 const newUniqueSellers = scrapedSellers.filter(s => !existingIds.has(s._id.toString()));
                 matchingSellers = [...matchingSellers, ...newUniqueSellers];
             }
        }

        // 4. BROADCAST: Send WhatsApp to ALL found sellers (DB + Scraped)
        console.log(`📢 Broadcasting to ${matchingSellers.length} sellers...`);
        
        const notificationPromises = matchingSellers.map(seller => notifySeller(seller, newRequest));
        await Promise.allSettled(notificationPromises);

        return NextResponse.json({
            success: true,
            message: `Requirement live! Notified ${matchingSellers.length} suppliers (including new finds).`,
            data: {
                count: matchingSellers.length,
                matchedSellers: matchingSellers.map(s => ({
                    name: s.name,
                    city: s.city
                }))
            }
        });

    } catch (error: any) {
        console.error("Req Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
    }
}