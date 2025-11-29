import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Fetch All Orders
        const orders = await Order.find({}).sort({ createdAt: -1 });

        let totalGMV = 0;
        let totalRevenue = 0;
        let totalPayouts = 0;

        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            // Use stored values for accuracy
            totalGMV += order.amount;
            totalRevenue += order.commissionAmount;
            totalPayouts += order.sellerAmount;

            const seller = await Seller.findById(order.sellerId).select('name');
            const buyer = await User.findById(order.buyerId).select('name');

            return {
                _id: order._id,
                orderId: order.orderId,
                date: order.createdAt,
                buyerName: buyer?.name || "Unknown",
                sellerName: seller?.name || "Unknown",
                totalAmount: order.amount, // What buyer paid
                platformFee: order.commissionAmount, // Your Profit
                sellerPayout: order.sellerAmount, // Seller's Share
                status: order.paymentStatus
            };
        }));

        return NextResponse.json({
            success: true,
            summary: {
                gmv: totalGMV, // Total money moved through system
                revenue: totalRevenue, // Total 5% commissions earned
                payouts: totalPayouts, // Total liability to sellers
                orderCount: orders.length
            },
            orders: enrichedOrders
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}