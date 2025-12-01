import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Order from "@/lib/models/Order";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User"; 
import Razorpay from "razorpay";

// Bot Config
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809'; 

// Notifications
async function sendNotification(phone: string, message: string) {
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(err => console.error("Notification Failed:", err));
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { messageId, sellerId } = await req.json();

        // 1. Find the Chat Proposal
        const offerMsg = await Chat.findById(messageId);
        if (!offerMsg || offerMsg.type !== 'OFFER' || offerMsg.offerStatus !== 'PENDING') {
            return NextResponse.json({ success: false, error: "Invalid or expired offer" });
        }

        const seller = await Seller.findById(sellerId);
        const buyer = await User.findById(offerMsg.userId);
        const buyerName = buyer?.name || "Unknown Buyer";

        if (!seller) return NextResponse.json({ success: false, error: "Seller not found" });

        // 2. Financial Calculations
        const amount = offerMsg.offerAmount!; 
        const commission = Math.round(amount * 0.05); 
        const sellerShare = amount - commission;

        // 3. Create Internal Order
        const internalOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        await Order.create({
            orderId: internalOrderId,
            requestId: messageId,
            sellerId: sellerId,
            buyerId: offerMsg.userId,
            amount: amount,
            commissionAmount: commission,
            sellerAmount: sellerShare,
            paymentStatus: 'PENDING',
            deliveryStatus: 'PENDING'
        });

        // 4. Generate Razorpay Link
        const paymentLinkRequest = {
            amount: amount * 100, 
            currency: "INR",
            accept_partial: false,
            reference_id: internalOrderId,
            description: `Payment for Order #${internalOrderId}`,
            customer: {
                name: "Verified Buyer",
                contact: "+919999999999", 
                email: "buyer@example.com"
            },
            notify: { sms: true, email: true },
            callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/orders`,
            callback_method: "get"
        };

        const response = await razorpay.paymentLink.create(paymentLinkRequest);

        // 5. Update Chat UI
        offerMsg.offerStatus = 'ACCEPTED';
        offerMsg.message = `✅ **DEAL APPROVED**\n\n💰 Deal Value: ₹${amount}\n🛡️ Escrow Fee: Included\n\n👇 Click below to complete payment.`;
        offerMsg.type = 'PAYMENT_LINK';
        offerMsg.paymentLink = response.short_url;
        await offerMsg.save();

        // 6. NOTIFICATIONS
        // To Seller
        const sellerMsg = `🎉 *Payment Initiated!*\nOrder #${internalOrderId} - Value: ₹${amount}.\nThe buyer has approved the deal and is paying via Escrow.\n\n💵 *Your Net Payout (95%):* ₹${sellerShare}\n🚀 Prepare to ship once payment is confirmed.`;
        sendNotification(seller.phone, sellerMsg);

        // To Admin (MONITOR)
        const adminMsg = `💰 *MONITOR: PAYMENT STARTED*

✅ Buyer Approved & Clicked Pay.

📊 *Deal Details:*
• Buyer: ${buyerName}
• Seller: ${seller.name}
• Amount: ₹${amount}
• Order ID: ${internalOrderId}

🚀 Status: Redirecting Buyer to Razorpay.
👮 Admin Mobile: ${ADMIN_PHONE}`;

        sendNotification(ADMIN_PHONE, adminMsg);

        return NextResponse.json({ success: true, link: response.short_url });

    } catch (error) {
        console.error("Approval Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate link" });
    }
}