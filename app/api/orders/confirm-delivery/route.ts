import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Transaction from '@/lib/models/Transaction';
import Razorpay from 'razorpay';

// Init Razorpay for Payouts
let razorpayX: any = null;
try {
    razorpayX = new Razorpay({
        key_id: process.env.RAZORPAYX_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
    });
} catch (err) {
    console.warn("⚠️ RazorpayX not configured");
}

const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

async function sendWhatsApp(phone: string, message: string) {
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(console.error);
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { orderId } = await request.json();

        // 1. Fetch Order
        const order = await Order.findOne({ orderId, buyerId: userId });
        if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

        if (order.deliveryStatus === 'DELIVERED') {
            return NextResponse.json({ success: false, error: "Already confirmed" }, { status: 400 });
        }

        // 2. Update Status to DELIVERED & RELEASED
        order.deliveryStatus = 'DELIVERED';
        order.paymentStatus = 'RELEASED_TO_SELLER';
        await order.save();

        // 3. Fetch Seller
        // FIX: Cast to 'any' to ensure TypeScript recognizes custom fields like 'totalDealsCompleted'
        const seller = await Seller.findById(order.sellerId) as any;
        if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        // 4. Calculate Payout (95%)
        // The deduction logic was handled during Order creation, stored in `sellerAmount`
        const netPayout = order.sellerAmount;

        // 5. UPDATE SELLER WALLET (Ledger)
        seller.walletBalance += netPayout;
        seller.totalEarnings += netPayout;
        seller.totalDealsCompleted = (seller.totalDealsCompleted || 0) + 1; // Safely increment
        await seller.save();

        // 6. RECORD TRANSACTION
        await Transaction.create({
            sellerId: seller._id.toString(),
            type: 'DEAL_EARNING',
            amount: netPayout,
            balanceBefore: seller.walletBalance - netPayout,
            balanceAfter: seller.walletBalance,
            description: `Earnings from Order #${orderId}`,
            relatedId: orderId,
            status: 'COMPLETED'
        });

        // 7. TRIGGER REAL BANK TRANSFER (if details exist)
        let transferMsg = "Payment credited to Wallet.";
        
        if (seller.bankAccountNumber && seller.bankIFSC) {
            try {
                if(razorpayX) {
                    await razorpayX.payouts.create({
                        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || "", 
                        amount: Math.round(netPayout * 100), 
                        currency: "INR",
                        mode: "IMPS", 
                        purpose: "payout",
                        fund_account: {
                            account_type: "bank_account",
                            bank_account: {
                                name: seller.bankAccountHolderName || seller.name,
                                ifsc: seller.bankIFSC,
                                account_number: seller.bankAccountNumber
                            },
                            contact: {
                                name: seller.name,
                                contact: seller.phone,
                                type: "vendor"
                            }
                        },
                        queue_if_low_balance: true,
                        reference_id: orderId,
                        narration: `Payout for ${orderId}`
                    });
                    transferMsg = "Payment transferred to Bank Account.";
                }
            } catch (payoutErr) {
                console.error("Payout Failed:", payoutErr);
                transferMsg = "Auto-transfer failed. Amount credited to Wallet.";
            }
        }

        // 8. NOTIFY SELLER
        const message = `✅ *TASK COMPLETED!*
    
📦 Order: ${orderId}
👤 Buyer marked task as complete.

💰 *Net Payout:* ₹${netPayout}
ℹ️ Status: ${transferMsg}

${!seller.bankAccountNumber ? `⚠️ *Link Bank Account:* ${process.env.NEXT_PUBLIC_WEBSITE_URL}/seller/add-bank-details?orderId=${orderId}` : ''}`;

        await sendWhatsApp(seller.phone, message);

        return NextResponse.json({ success: true, message: "Delivery confirmed & Payout released." });

    } catch (error) {
        console.error("Confirm Delivery Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}