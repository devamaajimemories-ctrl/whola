import { NextResponse } from "next/server";
import { headers } from "next/headers"; 
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";
import User from "@/lib/models/User";
import Seller from "@/lib/models/Seller";

// POST: Seller sends a message to a Buyer
export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // 1. Authenticate Seller (Using Headers from Middleware)
        const headersList = await headers();
        const userId = headersList.get("x-user-id"); 
        
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { buyerId, message, buyerName } = await req.json();

        // 2. Validate Seller ID
        // The userId from headers IS the Seller ID based on your Auth implementation
        const isSeller = await Seller.exists({ _id: userId });
        if (!isSeller) {
             return NextResponse.json({ success: false, error: "Seller profile not found" }, { status: 404 });
        }
        const sellerId = userId;

        // 3. Handle Buyer ID (Phone vs MongoID)
        // If the buyerId is a phone number (from a lead), we find/create the User to get a valid MongoID
        let targetUserId = buyerId;
        const isPhone = /^\d+$/.test(buyerId); // Check if it's a phone number

        if (isPhone) {
            // It's a phone number. Find the user or create a temporary one.
            let user = await User.findOne({ phone: buyerId });
            
            if (!user) {
                // AUTO-CREATE USER so the chat works immediately
                user = await User.create({
                    name: buyerName || "Guest Buyer",
                    phone: buyerId,
                    role: 'buyer',
                    email: `guest-${buyerId}@temp.whola.in` 
                });
            }
            // Use the MongoDB _id for the chat record
            targetUserId = user._id.toString();
        }

        // 4. Create New Chat Message (Single Document)
        // FIX: Replaced array logic with single document creation to match Schema
        const chat = await Chat.create({
            sellerId: sellerId,
            userId: targetUserId,
            sender: 'seller',
            message: message,
            type: 'TEXT',
            isBlocked: false,
            // createdAt is automatically handled by { timestamps: true } in schema
        });

        return NextResponse.json({ success: true, data: chat });

    } catch (error: any) {
        console.error("Seller Send Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}