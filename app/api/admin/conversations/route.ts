import { NextResponse } from 'next/server';
import mongoose, { isValidObjectId } from 'mongoose'; // ✅ Import isValidObjectId
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Aggregate unique conversations (group by sellerId + userId)
        const conversations = await Chat.aggregate([
            {
                $sort: { createdAt: -1 } // Sort by newest first
            },
            {
                $group: {
                    _id: { sellerId: "$sellerId", userId: "$userId" },
                    lastMessage: { $first: "$message" },
                    lastActive: { $first: "$createdAt" },
                    totalMessages: { $sum: 1 }
                }
            },
            { $sort: { lastActive: -1 } } // Show most recent chats first
        ]);

        // Populate Names (Manually since we used aggregation)
        const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
            let seller = null;
            const sellerId = conv._id.sellerId;

            // ✅ FIX: Check if ID is a valid MongoDB ObjectId before querying
            if (sellerId && isValidObjectId(sellerId)) {
                seller = await Seller.findById(sellerId).select('name phone').lean();
            }

            // Handle Guest vs Registered Users
            let buyerName = "Guest";
            let buyerPhone = "N/A";
            
            // Check if userId is a valid Mongo ObjectId
            if (conv._id.userId && isValidObjectId(conv._id.userId)) {
                const user = await User.findById(conv._id.userId).select('name phone').lean();
                if (user) {
                    buyerName = user.name;
                    // FIX: Handle optional phone number with a fallback
                    buyerPhone = user.phone || "N/A"; 
                }
            } else {
                // It's a guest ID or Phone or generic string
                buyerName = "Guest (" + conv._id.userId + ")";
            }

            return {
                id: `${sellerId}-${conv._id.userId}`,
                // Provide a fallback if seller is null (invalid ID or not found)
                seller: seller || { name: 'Unknown Seller', phone: '?' }, 
                buyer: { name: buyerName, phone: buyerPhone, id: conv._id.userId },
                lastMessage: conv.lastMessage,
                lastActive: conv.lastActive,
                count: conv.totalMessages
            };
        }));

        return NextResponse.json({ success: true, data: enrichedConversations });

    } catch (error) {
        console.error("Admin Conversations Error:", error);
        return NextResponse.json({ success: false, error: "Failed to load chats" }, { status: 500 });
    }
}