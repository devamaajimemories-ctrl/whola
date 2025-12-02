import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order"; // Required to create the order
import Razorpay from "razorpay";

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

async function sendNotification(phone: string, message: string) {
    if(!phone) return;
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(console.error);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { messageId } = await req.json();

        // 1. Find & Update Original Proposal
        const originalMsg = await Chat.findById(messageId);
        if (!originalMsg) return NextResponse.json({ success: false });

        originalMsg.offerStatus = 'ACCEPTED';
        await originalMsg.save();

        const amount = originalMsg.offerAmount!;
        const commission = Math.round(amount * 0.05);
        const sellerShare = amount - commission;

        // 2. Fetch Info
        const seller = await Seller.findById(originalMsg.sellerId);
        const buyer = await User.findById(originalMsg.userId);
        const buyerName = buyer?.name || "Unknown Buyer";

        // 3. Create Internal Order (Required for Payment)
        const internalOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        await Order.create({
            orderId: internalOrderId,
            requestId: messageId,
            sellerId: originalMsg.sellerId,
            buyerId: originalMsg.userId,
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
                name: buyerName,
                contact: buyer?.phone || "+919999999999", 
                email: buyer?.email || "buyer@example.com"
            },
            notify: { sms: true, email: true },
            callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/orders`,
            callback_method: "get"
        };

        const response = await razorpay.paymentLink.create(paymentLinkRequest);
        const paymentUrl = response.short_url;

        // 5. Create Confirmation Message in Chat
        await Chat.create({
            sellerId: originalMsg.sellerId,
            userId: originalMsg.userId,
            sender: 'seller',
            message: `✅ **OFFER ACCEPTED**\n\nSeller agreed to ₹${originalMsg.offerAmount}.\nBuyer can now pay below.`,
            type: 'PAYMENT_LINK',
            offerAmount: originalMsg.offerAmount,
            offerStatus: 'ACCEPTED',
            paymentLink: paymentUrl
        });

        // 6. NOTIFICATIONS

        // A. Notify BUYER (With Payment Link)
        const buyerMsg = `🤝 *Proposal Accepted!*

The Seller (${seller?.name}) has accepted your price of ₹${originalMsg.offerAmount}.

👇 *Click below to Pay & Seal the Deal:*
${paymentUrl}`;

        if(buyer?.phone) {
            await sendNotification(buyer.phone, buyerMsg);
        }

        // B. Notify SELLER (With Bank Details Link)
        // This was the missing part you asked for!
        const bankLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/add-bank-details?orderId=${internalOrderId}`;
        const sellerMsg = `✅ *Deal Confirmed!*
        
You accepted the buyer's offer of ₹${amount}.
Order ID: ${internalOrderId}

⚠️ *Important:* We need your bank details to release the payout.
👇 *Click to Add Bank Details:*
${bankLink}`;

        if(seller?.phone) {
            await sendNotification(seller.phone, sellerMsg);
        }

        // C. Notify ADMIN
        const adminMsg = `🤝 *MONITOR: SELLER ACCEPTED PROPOSAL*

✅ Seller agreed to Buyer's price.
💰 Amount: ₹${originalMsg.offerAmount}
🔗 Payment Link: ${paymentUrl}

Seller: ${seller?.name}
Buyer: ${buyer?.name}

Status: Links sent to both parties.`;

        await sendNotification(ADMIN_PHONE, adminMsg);

        return NextResponse.json({ success: true, link: paymentUrl });

    } catch (error) {
        console.error("Accept Proposal Error:", error);
        return NextResponse.json({ success: false });
    }
}