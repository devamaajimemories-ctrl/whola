import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import RequestModel from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
import Chat from "@/lib/models/Chat";
import User from "@/lib/models/User";
import { scrapeAndSaveSellers } from "@/lib/scraper-service";


export const maxDuration = 300;
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
export const dynamic = 'force-dynamic';

// Helper to Send WhatsApp
async function sendWhatsApp(phone: string, message: string) {
    if (!phone || phone.length < 10) return;
    try {
        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, message })
        });
    } catch (e) {
        console.error(`WhatsApp Fail (${phone}):`, e);
    }
}

export async function GET() {
    await dbConnect();
    const requirements = await RequestModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: requirements });
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { action, requestId } = body;

        // Fetch request first for all actions
        const request = await RequestModel.findById(requestId);
        if (!request) return NextResponse.json({ success: false, error: "Request not found" });

        // --- ACTION 1: UPDATE STATUS ---
        if (action === 'updateStatus') {
            const { status } = body;
            request.status = status;
            await request.save();
            return NextResponse.json({ success: true, message: `Status updated to ${status}` });
        }

        // --- ACTION 2: DELETE REQUEST ---
        if (action === 'delete') {
            await RequestModel.findByIdAndDelete(requestId);
            return NextResponse.json({ success: true, message: "Request deleted successfully" });
        }

        // --- ACTION 3: ADMIN APPROVES & CONNECTS (The Main Logic) ---
        if (action === 'process') {
            const { mode, manualData } = body;
            let targetSellers: any[] = [];

            // 1. SELECT SELLERS (Database, JIT, or Manual)
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
                if (Array.isArray(manualData)) {
                    for (const data of manualData) {
                        if (data.phone) {
                            let manualSeller = await Seller.findOne({ phone: data.phone });
                            if (!manualSeller) {
                                // FIX: Cast result to 'any'
                                manualSeller = (await Seller.create({
                                    name: data.name || 'Merchant',
                                    phone: data.phone,
                                    email: `${data.phone}@temp.whola.in`, 
                                    city: 'Manual Lead',                 
                                    category: 'Manual Lead',             
                                    isVerified: true,
                                    tags: ['Manual Lead']
                                } as any)) as any;
                            }
                            targetSellers.push(manualSeller);
                        }
                    }
                }
            }

            if (!targetSellers.length) return NextResponse.json({ success: false, error: "No sellers found" });

            // 2. GET OR CREATE BUYER ID (CRITICAL FIX)
            // Always ensure we have a valid MongoID for the buyer, even if they are a guest.
            // This prevents the chat mismatch issue later.
            let buyerUser = await User.findOne({ phone: request.buyerPhone });
            if (!buyerUser) {
                buyerUser = await User.create({
                    name: request.buyerName,
                    phone: request.buyerPhone,
                    role: 'buyer',
                    email: `guest-${request.buyerPhone}@temp.whola.in` 
                });
            }
            const buyerId = buyerUser._id.toString(); 

            // 3. EXECUTE SIMULTANEOUS CONNECTION LOOP
            const processPromises = targetSellers.map(async (seller) => {
                
                // --- A. SYSTEM GENERATED MESSAGES ---
                const buyerSystemMsg = `REQUIREMENT DETAILS:
📦 Product: ${request.product}
🔢 Quantity: ${request.quantity}
💰 Target Price: ₹${request.estimatedPrice}
📍 Location: ${request.city || 'India'}

${request.description ? `📝 Description: ${request.description}` : ''}`;
                
                const sellerSystemMsg = `✅ SYSTEM: I am ready to supply this item. Let's discuss details.`;

                // --- B. CREATE CHAT IN DATABASE ---
                // We check for existing chat to avoid duplicates
                const existingChat = await Chat.findOne({ sellerId: seller._id, userId: buyerId, message: buyerSystemMsg });

                if (!existingChat) {
                    // 1. Create Buyer's Message
                    await Chat.create({
                        sellerId: seller._id,
                        userId: buyerId, // Using the correct MongoID
                        sender: 'user', 
                        message: buyerSystemMsg,
                        type: 'TEXT',
                        createdAt: new Date(Date.now() - 1000) 
                    } as any);

                    // 2. Create Seller's Auto-Reply
                    await Chat.create({
                        sellerId: seller._id,
                        userId: buyerId, // Using the correct MongoID
                        sender: 'seller', 
                        message: sellerSystemMsg,
                        type: 'TEXT',
                        createdAt: new Date() 
                    } as any);

                    // --- C. NOTIFY SELLER (WhatsApp) ---
                    // Link now uses the MongoID
                    const sellerLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/messages?buyerId=${buyerId}`;
                    const sellerWhatsapp = `🚀 *New Lead Assigned!*
                    
📦 Product: ${request.product}
🔢 Qty: ${request.quantity}

System has auto-connected you with the buyer.
👇 *Open Chat:*
${sellerLink}`;
                    await sendWhatsApp(seller.phone, sellerWhatsapp);

                    // --- D. NOTIFY BUYER (WhatsApp) ---
                    const buyerLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/messages?sellerId=${seller._id}`;
                    const buyerWhatsapp = `🤝 *Seller Connected!*
                    
Your requirement for *${request.product}* has been accepted by *${seller.name}*.

👇 *Chat Now:*
${buyerLink}`;
                    await sendWhatsApp(request.buyerPhone, buyerWhatsapp);
                }
            });

            await Promise.allSettled(processPromises);

            return NextResponse.json({ 
                success: true, 
                message: `Successfully connected ${targetSellers.length} sellers. Chats created & Notifications sent.` 
            });
        }

        return NextResponse.json({ success: false, error: "Invalid action" });

    } catch (error: any) {
        console.error("Admin Process Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}