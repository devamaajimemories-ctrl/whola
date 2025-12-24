import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/lib/models/Request";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User"; 
import Order from "@/lib/models/Order";
import Razorpay from "razorpay";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const dynamic = 'force-dynamic'; 

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const requestId = searchParams.get("requestId");

    if (!sellerId || !requestId) return NextResponse.json({ error: "Invalid Link" });

    try {
        await dbConnect();

        // 1. Fetch Request & Seller
        const request = await Request.findById(requestId);
        if (!request) return NextResponse.json({ error: "Request not found" });

        if (request.status === "LOCKED") {
            return NextResponse.json({ message: "❌ Too slow! Another seller already accepted this deal." });
        }

        const seller = await Seller.findById(sellerId);
        if (!seller) return NextResponse.json({ error: "Seller account not found" });

        // 2. Lock Deal
        request.status = "LOCKED";
        request.lockedBy = sellerId;
        await request.save();

        // 3. Find Buyer Info
        let buyerId = null;
        let buyerName = request.buyerName;
        // Try to find the User object if registered, or handle guest
        const buyerUser = await User.findOne({ phone: request.buyerPhone });
        if(buyerUser) {
            buyerId = buyerUser._id.toString();
        } else {
            // If buyer is just a lead from phone, we can't link to a dashboard easily without them registering.
            // For now, we assume they will register or we use phone as placeholder.
            // A better approach is to create a shadow user or require login. 
            // Here we skip Order creation if no User ID, OR we create a temporary User.
            // Let's create a temp user for the flow to work:
             const newUser = await User.create({
                name: request.buyerName,
                phone: request.buyerPhone,
                email: `guest_${request.buyerPhone}@youthbharat.com`,
                role: 'buyer'
            });
            buyerId = newUser._id.toString();
        }

        // 4. GENERATE RAZORPAY LINK (If price is available)
        // If estimatedPrice is a range or text, we might fail here. 
        // We'll try to parse a number, default to 0 if fails.
        const priceString = request.estimatedPrice ? request.estimatedPrice.replace(/[^0-9.]/g, '') : "0";
        const amount = parseFloat(priceString) || 0;
        
        let paymentLink = "";
        let internalOrderId = "";

        if (amount > 0) {
            internalOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const commission = Math.round(amount * 0.05);
            const sellerShare = amount - commission;

            // Create Order
            await Order.create({
                orderId: internalOrderId,
                requestId: requestId,
                sellerId: sellerId,
                buyerId: buyerId,
                amount: amount,
                commissionAmount: commission,
                sellerAmount: sellerShare,
                paymentStatus: 'PENDING',
                deliveryStatus: 'PENDING'
            });

            // Razorpay Link
            try {
                const linkRequest = {
                    amount: amount * 100,
                    currency: "INR",
                    accept_partial: false,
                    reference_id: internalOrderId,
                    description: `Payment for ${request.product}`,
                    customer: {
                        name: buyerName,
                        contact: request.buyerPhone,
                        email: "buyer@example.com"
                    },
                    notify: { sms: true, email: true },
                    callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/orders`, 
                    callback_method: "get"
                };
                const response = await razorpay.paymentLink.create(linkRequest);
                paymentLink = response.short_url;
            } catch (err) {
                console.error("Razorpay generation failed", err);
            }
        }

        // 5. NOTIFY SELLER (WhatsApp)
        // Includes Bank Details Link
        const bankLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/add-bank-details?orderId=${internalOrderId}`;
        const sellerMsg = `✅ *Deal Locked!*
    
You secured: ${request.product}
Buyer: ${buyerName}

💰 Value: ₹${amount}
🔗 *Link Bank Account:* ${bankLink}

👉 Reply here to chat with Buyer.`;

        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: seller.phone, message: sellerMsg })
        });

        // 6. NOTIFY BUYER (WhatsApp) - NEW!!
        // Includes Payment Link
        const buyerMsg = `🤝 *Seller Found!*

${seller.name} has accepted your request for: ${request.product}.

💰 Price: ₹${amount}
${paymentLink ? `💳 *Pay Now:* ${paymentLink}` : "ℹ️ Discuss price in chat."}

👇 *Chat with Seller:* ${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/messages?sellerId=${sellerId}`;

        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: request.buyerPhone, message: buyerMsg })
        });

        // 7. NOTIFY ADMIN
        const adminMsg = `🤝 *MONITOR: LEAD MATCHED & LINK SENT*

Product: ${request.product}
Seller: ${seller.name}
Buyer: ${request.buyerName}

Payment Link Generated: ${paymentLink ? "YES" : "NO"}
Status: Waiting for Payment.`;

        await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ADMIN_PHONE, message: adminMsg })
        }).catch(console.error);

        return NextResponse.json({
            success: true,
            message: "✅ Deal Locked! Payment links sent to both parties."
        });

    } catch (error) {
        console.error("Deal Accept Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}