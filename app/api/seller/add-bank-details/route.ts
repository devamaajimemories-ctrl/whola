import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import Razorpay from 'razorpay';

// Initialize Razorpay for Payouts
let razorpayX: any = null;
try {
    razorpayX = new Razorpay({
        key_id: process.env.RAZORPAYX_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
    });
} catch (err) {
    console.warn("⚠️ RazorpayX not configured for payouts");
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, accountNumber, ifsc, accountHolderName } = await request.json();

        if (!accountNumber || !ifsc || !accountHolderName) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }

        // 1. Validate IFSC format (basic check)
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            return NextResponse.json({ success: false, error: "Invalid IFSC code format" }, { status: 400 });
        }

        // 2. Update Seller's Bank Details
        const seller = await Seller.findByIdAndUpdate(
            sellerId,
            {
                bankAccountNumber: accountNumber,
                bankIFSC: ifsc,
                bankAccountHolderName: accountHolderName,
                bankVerified: true
            },
            { new: true }
        );

        if (!seller) {
            return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
        }

        // 3. Find the related order (if orderId provided)
        if (orderId) {
            const order = await Order.findOne({ orderId, sellerId: seller._id.toString() });

            if (!order) {
                return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
            }

            if (order.paymentStatus === 'RELEASED_TO_SELLER') {
                return NextResponse.json({ success: false, error: "Payment already released" }, { status: 400 });
            }

            // 4. Calculate Payout Amount
            const LEAD_CHARGE = 50;
            const payoutAmount = order.sellerAmount - LEAD_CHARGE; // Seller amount already has 5% commission deducted

            if (payoutAmount <= 0) {
                return NextResponse.json({ success: false, error: "Invalid payout amount" }, { status: 400 });
            }

            // 5. Create Razorpay Payout (Auto Bank Transfer)
            try {
                if (!razorpayX) {
                    throw new Error("RazorpayX not configured");
                }

                const payout = await razorpayX.payouts.create({
                    account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || "", // Your business account
                    amount: Math.round(payoutAmount * 100), // Paise
                    currency: "INR",
                    mode: "IMPS", // Instant transfer
                    purpose: "payout", // Required field
                    fund_account: {
                        account_type: "bank_account",
                        bank_account: {
                            name: accountHolderName,
                            ifsc: ifsc,
                            account_number: accountNumber
                        },
                        contact: {
                            name: seller.name,
                            email: seller.email,
                            contact: seller.phone,
                            type: "vendor"
                        }
                    },
                    queue_if_low_balance: false,
                    reference_id: orderId,
                    narration: `Payment for Order ${orderId}`
                });

                console.log("✅ Payout Created:", payout);

                // 6. Update Order Status
                order.paymentStatus = 'RELEASED_TO_SELLER';
                order.sellerNotes = `Payment of ₹${payoutAmount.toFixed(2)} transferred to ${ifsc} - ${accountNumber}`;
                await order.save();

                // 7. Update Seller Earnings
                seller.totalEarnings += payoutAmount;
                seller.totalDealsCompleted += 1;
                await seller.save();

                return NextResponse.json({
                    success: true,
                    message: `₹${payoutAmount.toFixed(2)} transferred successfully!`,
                    payoutId: payout.id
                });

            } catch (payoutError: any) {
                console.error("❌ Payout Error:", payoutError);

                // Fallback: Add to pending payouts if Razorpay fails
                seller.pendingPayouts += payoutAmount;
                await seller.save();

                return NextResponse.json({
                    success: true,
                    message: "Bank details saved. Payment will be processed manually within 24 hours."
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Bank details saved successfully!"
        });

    } catch (error: any) {
        console.error("Add Bank Details Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
