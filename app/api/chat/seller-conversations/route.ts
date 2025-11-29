import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get Seller ID from headers (Authenticated)
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id'); // Assuming seller uses same auth

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Find all unique buyers who messaged this seller
        const chats = await Chat.aggregate([
            { $match: { sellerId: sellerId } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$userId",
                    lastMessage: { $first: "$message" },
                    lastDate: { $first: "$createdAt" }
                }
            }
        ]);

        // Fetch buyer names (NO phone/email for PII protection)
        const conversations = await Promise.all(
            chats.map(async (chat) => {
                let name = "Anonymous Buyer";
                let user = await User.findById(chat._id).select('name');

                if (user) {
                    name = user.name;
                } else {
                    // Fallback: Check if it's a Seller (B2B)
                    const sellerBuyer = await Seller.findById(chat._id).select('name');
                    if (sellerBuyer) {
                        name = sellerBuyer.name;
                    }
                }

                return {
                    _id: chat._id,
                    lastMessage: chat.lastMessage,
                    lastDate: chat.lastDate,
                    buyer: {
                        name: name
                    }
                };
            })
        );

        return NextResponse.json({ success: true, data: conversations });

    } catch (error) {
        console.error("Seller Conversations Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
