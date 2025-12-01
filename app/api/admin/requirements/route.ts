import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
// FIX: Import the correct function name from your existing file
import { scrapeAndSaveSellers } from "@/lib/scraper-service"; 

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    const requirements = await Request.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: requirements });
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { requestId, mode, manualData } = await req.json();

        const request = await Request.findById(requestId);
        if (!request) return NextResponse.json({ success: false, error: "Request not found" });

        let targetSellers = [];

        // --- MODE 1: DATABASE MATCH ---
        if (mode === 'database') {
            targetSellers = await Seller.find({
                $or: [
                    { category: { $regex: request.category || request.product, $options: 'i' } },
                    { tags: { $in: [new RegExp(request.product, 'i')] } },
                    { name: { $regex: request.product, $options: 'i' } }
                ]
            }).limit(15);
        }
        
        // --- MODE 2: JIT SCRAPER ---
        else if (mode === 'jit') {
            // Trigger Scraper dynamically
            const query = `Wholesalers of ${request.product} in ${request.city || 'India'}`;
            console.log("Running JIT Scraper for:", query);
            
            // FIX: Use the correct function 'scrapeAndSaveSellers'
            // Pass the product name as the second argument for 'categoryContext'
            const scrapedData = await scrapeAndSaveSellers(query, request.product); 

            // The scraper already saves to DB, so we just use the returned data
            targetSellers = scrapedData || [];
        }

        // --- MODE 3: MANUAL ENTRY ---
        else if (mode === 'manual') {
            if (!manualData?.phone) return NextResponse.json({ success: false, error: "Phone number required for manual entry" });
            
            targetSellers = [{
                name: manualData.name || 'Manual Seller',
                phone: manualData.phone
            }];
        }

        if (!targetSellers || targetSellers.length === 0) {
            return NextResponse.json({ success: false, error: `No sellers found using mode: ${mode}` });
        }

        // --- SEND WHATSAPP ---
        const leadLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/dashboard/leads`;
        const message = `🚨 *Verified Business Lead!* (Admin Approved)
    
📦 *Item:* ${request.product}
📍 *Location:* ${request.city || 'India'}
QTY: ${request.quantity}
💰 *Budget:* ₹${request.estimatedPrice || 'Best Price'}

A verified buyer is looking for this product. Click to unlock details:
${leadLink}`;

        const promises = targetSellers.map((seller: any) => {
            // Clean phone number
            let phone = seller.phone?.replace(/\D/g, ''); 
            if (!phone) return Promise.resolve();
            if (phone.length === 10) phone = '91' + phone; 

            return fetch(`${WHATSAPP_BOT_URL}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message })
            });
        });

        await Promise.allSettled(promises);

        // Update Status
        request.status = "FULFILLED";
        await request.save();

        return NextResponse.json({ 
            success: true, 
            message: `Success! Sent to ${targetSellers.length} sellers via ${mode} mode.` 
        });

    } catch (error) {
        console.error("Admin Process Error:", error);
        return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 });
    }
}