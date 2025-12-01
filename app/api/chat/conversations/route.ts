import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import Seller from '@/lib/models/Seller'; // Ensure Seller model is imported

export async function GET(req: Request) {
    try {
        await dbConnect();

        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        console.log(`Fetching conversations for Buyer: ${userId}`);

        // Aggregate chats to find unique sellers and the latest message
        // Also checks if ANY message in the conversation has offerStatus = 'ACCEPTED'
        const conversations = await Chat.aggregate([
            { $match: { userId: userId } },
            { $sort: { createdAt: 1 } }, // Sort to process chronologically
            {
                $group: {
                    _id: "$sellerId",
                    lastMessage: { $last: "$message" },
                    lastDate: { $last: "$createdAt" },
                    // Check if any deal was accepted in this conversation
                    isAccepted: {
                        $max: {
                            $cond: [{ $eq: ["$offerStatus", "ACCEPTED"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { lastDate: -1 } } // Show newest conversations first
        ]);

        // Populate Seller Details
        const populatedConversations = await Promise.all(conversations.map(async (conv) => {
            const seller = await Seller.findById(conv._id).select('name city category isVerified');
            return {
                ...conv,
                seller: seller || { name: "Unknown Seller", city: "N/A" }
            };
        }));

        return NextResponse.json({ success: true, data: populatedConversations });

    } catch (error) {
        console.error("Conversations Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
