import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Order from "@/lib/models/Order";
import Seller from "@/lib/models/Seller";
import User from "@/lib/models/User"; // Added for buyer details
import Razorpay from "razorpay";

// ADDED: External bot integration
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';
const ADMIN_PHONE = '8448695809'; // Admin monitoring number

// ADDED: Function to send notification
async function sendEscrowNotification(sellerPhone: string, orderId: string, amount: number, payout: number) {
    const message = `🎉 *Payment Initiated!*
Order #${orderId} - Value: ₹${amount}.
The buyer has paid, and the fund is now secured in escrow.

💵 *Your Net Payout (95%):* ₹${payout}
🚀 Start processing the order now!`;

    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sellerPhone, message: message })
    }).catch(err => console.error("Escrow Notification Failed:", err));
}

// ADDED: Function to notify admin about deal approval
async function sendAdminDealNotification(buyerName: string, sellerName: string, amount: number, orderId: string) {
    const message = `💰 *DEAL APPROVED & PAYMENT INITIATED*

📊 *Deal Details:*
• Buyer: ${buyerName}
• Seller: ${sellerName}
• Deal Amount: ₹${amount}
• Order ID: ${orderId}

✅ Buyer has approved and initiated payment.
💼 Monitor this deal in the admin dashboard.`;

    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: ADMIN_PHONE, message: message })
    }).catch(err => console.error("Admin Deal Notification Failed:", err));
}
// END ADDED

// Initialize Razorpay
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

        // ADDED: Fetch Seller Details
        const seller = await Seller.findById(sellerId);
        if (!seller) return NextResponse.json({ success: false, error: "Seller not found" });

        // ADDED: Fetch Buyer Details
        const buyer = await User.findById(offerMsg.userId);
        const buyerName = buyer?.name || "Unknown Buyer";

        // 2. Financial Calculations
        const amount = offerMsg.offerAmount!; // Total Deal Amount (e.g., 1000)
        const commission = Math.round(amount * 0.05); // 5% Platform Fee (e.g., 50)
        const sellerShare = amount - commission; // 95% Seller Payout (e.g., 950)

        // 3. Create Internal Order Record (For Admin/Finance Dashboard)
        const internalOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        await Order.create({
            orderId: internalOrderId,
            requestId: messageId, // Link back to chat
            sellerId: sellerId,
            buyerId: offerMsg.userId, // The buyer
            amount: amount, // Gross GMV
            commissionAmount: commission, // Your Revenue
            sellerAmount: sellerShare, // Seller Payout
            paymentStatus: 'PENDING',
            deliveryStatus: 'PENDING'
        });

        // 4. Generate Razorpay Payment Link
        const paymentLinkRequest = {
            amount: amount * 100, // Convert to Paise (Required by Razorpay)
            currency: "INR",
            accept_partial: false, // 🚨 ANTI-FRAUD: Buyer CANNOT pay less than agreed
            first_min_partial_amount: 0, // Ensure no partials
            reference_id: internalOrderId, // Link Razorpay to our DB Order
            description: `Payment for Order #${internalOrderId}`,
            customer: {
                name: "Verified Buyer",
                contact: "+919999999999", // Ideally fetch real buyer phone
                email: "buyer@example.com"
            },
            notify: { sms: true, email: true },
            callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/orders`,
            callback_method: "get"
        };

        const response = await razorpay.paymentLink.create(paymentLinkRequest);

        // 5. Update Chat UI & Send Notification
        offerMsg.offerStatus = 'ACCEPTED';
        offerMsg.message = `✅ **DEAL APPROVED**\n\n💰 Deal Value: ₹${amount}\n🛡️ Escrow Fee: Included\n\n👇 Click below to complete payment.`;
        offerMsg.type = 'PAYMENT_LINK';
        offerMsg.paymentLink = response.short_url;
        await offerMsg.save();

        // ADDED: Send WhatsApp Notification to Seller
        sendEscrowNotification(seller.phone, internalOrderId, amount, sellerShare);

        // ADDED: Send WhatsApp Notification to Admin
        sendAdminDealNotification(buyerName, seller.name, amount, internalOrderId);
        console.log(`📨 Admin notified about deal approval: ${internalOrderId}`);

        return NextResponse.json({ success: true, link: response.short_url });

    } catch (error) {
        console.error("Approval Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate link" });
    }
}