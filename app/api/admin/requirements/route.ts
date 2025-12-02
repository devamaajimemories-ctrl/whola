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
        const body = await req.json();
        const { action, requestId } = body;

        const request = await Request.findById(requestId);
        if (!request) return NextResponse.json({ success: false, error: "Request not found" });

        // --- ACTION 1: UPDATE STATUS (OPEN / FULFILLED) ---
        if (action === 'updateStatus') {
            const { status } = body;
            request.status = status;
            await request.save();
            return NextResponse.json({ success: true, message: `Status updated to ${status}` });
        }

        // --- ACTION 2: PROCESS LEAD (Send Chat Invites) ---
        if (action === 'process') {
            const { mode, manualData } = body;
            let targetSellers: any[] = [];

            // 1. SELECT SELLERS
            if (mode === 'database') {
                targetSellers = await Seller.find({
                    $or: [
                        { category: { $regex: request.category || request.product, $options: 'i' } },
                        { tags: { $in: [new RegExp(request.product, 'i')] } }
                    ]
                }).limit(15);
            } else if (mode === 'jit') {
                const query = `Wholesalers of ${request.product} in ${request.city || 'India'}`;
                targetSellers = await scrapeAndSaveSellers(query, request.product) || [];
            } else if (mode === 'manual') {
                // Ensure manualData is valid array
                if (Array.isArray(manualData)) {
                    for (const data of manualData) {
                        if (data.phone) {
                            // Find or Create temporary seller record
                            let manualSeller = await Seller.findOne({ phone: data.phone });
                            if (!manualSeller) {
                                manualSeller = await Seller.create({
                                    name: data.name || 'Merchant',
                                    phone: data.phone,
                                    isVerified: true,
                                    tags: ['Manual Lead']
                                });
                            }
                            targetSellers.push(manualSeller);
                        }
                    }
                }
            }

            if (!targetSellers.length) return NextResponse.json({ success: false, error: "No sellers found" });

            // 2. GENERATE LINKS & SEND
            // We encode the Buyer Name so it can be passed in the URL safely
            const buyerNameParam = encodeURIComponent(request.buyerName || "Buyer");
            const buyerPhoneParam = request.buyerPhone; // Used as ID
            
            // This Link opens the Seller Chat and forces the Buyer Name to appear
            const chatLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/messages?buyerId=${buyerPhoneParam}&buyerName=${buyerNameParam}`;

            const sellerMessage = `📦 *New Lead: ${request.product}*
Qty: ${request.quantity} | Target: ₹${request.estimatedPrice}

Buyer: ${request.buyerName}
Status: *Waiting for Quote*

👇 *Click to Chat with Buyer:*
${chatLink}`;

            const sellerPromises = targetSellers.map((seller: any) => {
                let phone = seller.phone?.replace(/\D/g, ''); 
                if (!phone) return Promise.resolve();
                if (phone.length === 10) phone = '91' + phone; 

                return fetch(`${WHATSAPP_BOT_URL}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, message: sellerMessage })
                });
            });

            await Promise.allSettled(sellerPromises);

            return NextResponse.json({ 
                success: true, 
                message: `Sent to ${targetSellers.length} sellers. Request remains OPEN.` 
            });
        }

        return NextResponse.json({ success: false, error: "Invalid action" });

    } catch (error: any) {
        console.error("Admin Process Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}