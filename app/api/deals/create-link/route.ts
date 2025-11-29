import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Seller from "@/lib/models/Seller";
import Razorpay from "razorpay";

// Initialize Razorpay (requires: npm install razorpay)
let razorpay: any = null;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
} catch (err) {
    console.warn("⚠️ Razorpay not configured. Please install: npm install razorpay");
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sellerId, amount, productDescription } = await req.json();

        // 1. Check if Razorpay is configured
        if (!razorpay) {
            return NextResponse.json({
                success: false,
                error: "Payment system not configured. Please install Razorpay package."
            }, { status: 503 });
        }

        // 2. Calculate Commission (5%)
        const commission = Math.round(amount * 0.05);
        const sellerAmount = amount - commission;

        // 3. Fetch Seller (In a real app, get their Razorpay Account ID for auto-transfer)
        // For Solo Dev: You collect 100%, then manually payout 95% weekly. 
        // Automation (Razorpay Route) requires 'transfers' array below.
        const seller = await Seller.findById(sellerId);
        if (!seller) return NextResponse.json({ error: "Seller not found" });

        // 3. Create Razorpay Payment Link
        const paymentLinkRequest = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            accept_partial: false,
            description: `Payment for ${productDescription}`,
            customer: {
                name: "Verified Buyer",
                email: "buyer@example.com", // Replace with actual buyer email
                contact: "+919999999999"   // Replace with actual buyer phone
            },
            notify: { sms: true, email: true },
            reminder_enable: true,
            callback_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/buyer/payment-success`,
            callback_method: "get"
            // --- AUTOMATIC SPLIT PAYMENT (Advanced) ---
            // If you have Razorpay Route active, uncomment this:
            // transfers: [
            //     {
            //         account: seller.razorpayAccountId, // You need to store this in Seller Model
            //         amount: sellerAmount * 100,
            //         currency: "INR",
            //         notes: { type: "vendor_payout" },
            //         linked_account_notes: ["type"],
            //         on_hold: 0
            //     }
            // ]
        };

        const response = await razorpay.paymentLink.create(paymentLinkRequest);

        // 4. Save "Deal Invoice" to Chat
        const dealMessage = await Chat.create({
            sellerId,
            userId: 'guest',
            sender: 'system',
            message: `🎉 DEAL FINALIZED: ₹${amount}\n\nSystem Note: This payment is secured by Escrow. 5% verification fee applies.`,
            type: 'PAYMENT_LINK',
            offerAmount: amount,
            offerStatus: 'PENDING',
            paymentLink: response.short_url // The Magic Link
        });

        return NextResponse.json({ success: true, link: response.short_url });

    } catch (error) {
        console.error("Razorpay Error:", error);
        return NextResponse.json({ success: false, error: "Failed to create deal link" });
    }
}
