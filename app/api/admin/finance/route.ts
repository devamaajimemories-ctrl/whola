import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Fetch All Orders sorted by newest
        const orders = await Order.find({}).sort({ createdAt: -1 });

        // --- CALCULATION LOGIC ---
        let totalGMV = 0;
        let totalRevenue = 0;
        let totalPayouts = 0;
        let completedCount = 0;
        let earnedCommission = 0;
        let completedGMV = 0;

        // Process orders
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            
            // Financial Summaries
            if (order.deliveryStatus !== 'CANCELLED') {
                totalGMV += order.amount;
                totalRevenue += order.commissionAmount;
                totalPayouts += order.sellerAmount;
            }

            if (order.paymentStatus === 'RELEASED_TO_SELLER') {
                completedCount++;
                completedGMV += order.amount;
                earnedCommission += order.commissionAmount;
            }

            // Fetch Buyer and Seller Details including BANK INFO
            const seller = await Seller.findById(order.sellerId).select('name bankAccountNumber bankIFSC bankAccountHolderName bankVerified');
            const buyer = await User.findById(order.buyerId).select('name');

            return {
                _id: order._id,
                orderId: order.orderId,
                date: order.createdAt,
                buyerName: buyer?.name || "Unknown",
                
                // Seller Info
                sellerId: order.sellerId,
                sellerName: seller?.name || "Unknown",
                sellerBank: {
                    accountNumber: seller?.bankAccountNumber || 'N/A',
                    ifsc: seller?.bankIFSC || 'N/A',
                    holderName: seller?.bankAccountHolderName || 'N/A',
                    isVerified: seller?.bankVerified || false
                },

                totalAmount: order.amount,
                platformFee: order.commissionAmount,
                sellerPayout: order.sellerAmount,
                status: order.paymentStatus,
                deliveryStatus: order.deliveryStatus
            };
        }));

        return NextResponse.json({
            success: true,
            summary: {
                gmv: totalGMV,
                revenue: totalRevenue,
                payouts: totalPayouts,
                completedCount,
                earnedCommission,
                completedGMV
            },
            orders: enrichedOrders
        });

    } catch (error) {
        console.error("Finance API Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}