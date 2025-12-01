import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
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

        let targetSellers: any[] = [];

        // =================================================
        // 1. FIND OR CREATE SELLERS BASED ON MODE
        // =================================================

        // --- MODE A: DATABASE MATCH ---
        if (mode === 'database') {
            targetSellers = await Seller.find({
                $or: [
                    { category: { $regex: request.category || request.product, $options: 'i' } },
                    { tags: { $in: [new RegExp(request.product, 'i')] } },
                    { name: { $regex: request.product, $options: 'i' } }
                ]
            }).limit(15);
        }
        
        // --- MODE B: JIT SCRAPER ---
        else if (mode === 'jit') {
            const query = `Wholesalers of ${request.product} in ${request.city || 'India'}`;
            console.log("Running JIT Scraper for:", query);
            targetSellers = await scrapeAndSaveSellers(query, request.product) || [];
        }

        // --- MODE C: MANUAL ENTRY (Secure Way) ---
        else if (mode === 'manual') {
            if (!manualData?.phone) return NextResponse.json({ success: false, error: "Phone required" });
            
            // We MUST create a Seller Record for them, otherwise they can't login/chat
            // Check if exists first to avoid duplicates
            let manualSeller = await Seller.findOne({ phone: manualData.phone });

            if (!manualSeller) {
                manualSeller = await Seller.create({
                    name: manualData.name || 'Merchant',
                    phone: manualData.phone,
                    category: request.category || 'General',
                    city: request.city || 'India',
                    tags: ['Manual Entry', 'Lead Fulfillment'],
                    isVerified: true // We trust admin input
                });
            }
            targetSellers = [manualSeller];
        }

        if (!targetSellers || targetSellers.length === 0) {
            return NextResponse.json({ success: false, error: `No sellers found using mode: ${mode}` });
        }

        // =================================================
        // 2. SEND NOTIFICATIONS (PRIVACY FOCUSED)
        // =================================================

        // A. NOTIFY SELLERS (Send Link to Seller Dashboard)
        const sellerLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/dashboard/leads`; // Link to Lead
        
        const sellerMessage = `📦 *New Business Opportunity!*
        
Item: *${request.product}*
Qty: ${request.quantity}
Location: ${request.city || 'India'}

✅ A verified buyer is waiting. 
👇 Click here to accept the deal & chat:
${sellerLink}`;

        const sellerPromises = targetSellers.map((seller: any) => {
            // Clean phone
            let phone = seller.phone?.replace(/\D/g, ''); 
            if (!phone) return Promise.resolve();
            if (phone.length === 10) phone = '91' + phone; 

            return fetch(`${WHATSAPP_BOT_URL}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message: sellerMessage })
            });
        });

        // B. NOTIFY BUYER (Send Link to Buyer Dashboard)
        // Only send if we actually found sellers
        if (request.buyerPhone) {
             let buyerPhone = request.buyerPhone.replace(/\D/g, '');
             if (buyerPhone.length === 10) buyerPhone = '91' + buyerPhone;

             const buyerLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/dashboard`;
             const buyerMessage = `🎉 *Good News!*
             
We found ${targetSellers.length} sellers for your requirement: *${request.product}*.

They have been notified and will contact you shortly via our secure chat.

👇 Click here to track responses:
${buyerLink}`;

             sellerPromises.push(
                 fetch(`${WHATSAPP_BOT_URL}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: buyerPhone, message: buyerMessage })
                })
             );
        }

        // Execute all messages
        await Promise.allSettled(sellerPromises);

        // =================================================
        // 3. UPDATE STATUS
        // =================================================
        request.status = "FULFILLED";
        await request.save();

        return NextResponse.json({ 
            success: true, 
            message: `Success! Notifications sent to Buyer & ${targetSellers.length} Sellers.` 
        });

    } catch (error) {
        console.error("Admin Process Error:", error);
        return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 });
    }
}