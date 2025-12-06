import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose'; // Required for ID validation
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get Seller ID from headers (Authenticated)
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // 1. Aggregate: Group messages by Buyer (userId)
        const chats = await Chat.aggregate([
            { $match: { sellerId: sellerId } },
            { $sort: { createdAt: -1 } }, // Sort messages to get the latest one first
            {
                $group: {
                    _id: "$userId",
                    lastMessage: { $first: "$message" },
                    lastDate: { $first: "$createdAt" }
                }
            },
            { $sort: { lastDate: -1 } } // Sort conversations by newest activity
        ]);

        // 2. Populate Names Safely (Fix for "Blank List" crash)
        const conversations = await Promise.all(
            chats.map(async (chat) => {
                let name = "Guest User"; // Default Name
                const userId = chat._id;

                // Check if ID is a valid MongoDB ObjectId (Prevents CastError)
                if (mongoose.isValidObjectId(userId)) {
                    // Try finding as a Registered Buyer
                    const user = await User.findById(userId).select('name');
                    if (user) {
                        name = user.name;
                    } else {
                        // Fallback: Check if it's another Seller (B2B)
                        const sellerBuyer = await Seller.findById(userId).select('name');
                        if (sellerBuyer) {
                            name = sellerBuyer.name;
                        }
                    }
                } 
                // Handle Special Cases (Legacy or Guest IDs)
                else if (userId === 'guest') {
                    name = "Guest User";
                }
                else if (userId && userId.toString().startsWith('csv_')) {
                    name = "Imported Lead";
                }
                else {
                    // If it's a phone number or raw string
                    name = userId || "Unknown Buyer"; 
                }

                return {
                    _id: userId,
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