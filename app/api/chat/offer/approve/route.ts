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

// Notifications Helper
async function sendNotification(phone: string, message: string) {
    if(!phone) return;
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

        // 2. Financial Calculations (5% Commission)
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

        // 4. Generate Razorpay Link for Buyer
        const paymentLinkRequest = {
            amount: amount * 100, 
            currency: "INR",
            accept_partial: false,
            reference_id: internalOrderId,
            description: `Payment for Order #${internalOrderId}`,
            customer: {
                name: buyerName,
                contact: buyer?.phone || "+919999999999", 
                email: buyer?.email || "buyer@example.com"
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

        // A. Notify SELLER (Deal Finalized + Add Bank Details Link)
        const bankDetailsLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/add-bank-details?orderId=${internalOrderId}`;
        const sellerMsg = `🎉 *Deal Approved by Buyer!*
        
📦 Order: #${internalOrderId}
💰 Value: ₹${amount}
💵 *Your Net Payout:* ₹${sellerShare}

Buyer has approved and is processing payment.
⚠️ *Action Required:* Ensure your bank details are added for instant payout.

👇 *Add Bank Details:* ${bankDetailsLink}`;
        
        await sendNotification(seller.phone, sellerMsg);

        // B. Notify ADMIN
        const adminMsg = `💰 *MONITOR: BUYER APPROVED DEAL*

✅ Buyer (${buyerName}) clicked "Approve & Pay".
✅ Payment Link Generated.

📊 *Details:*
• Seller: ${seller.name}
• Amount: ₹${amount}
• Order ID: ${internalOrderId}

🔗 Link sent to Seller for Bank Details.`;

        await sendNotification(ADMIN_PHONE, adminMsg);

        return NextResponse.json({ success: true, link: response.short_url });

    } catch (error) {
        console.error("Approval Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate link" });
    }
}