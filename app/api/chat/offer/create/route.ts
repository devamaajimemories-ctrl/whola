import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sellerId, amount, description, sender } = await req.json(); // sender: 'user' or 'seller'

        // 1. Get User ID from headers (Secure)
        const headersList = await headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!amount || isNaN(amount)) {
            return NextResponse.json({ success: false, error: "Invalid Amount" });
        }
        if (!description || description.trim().length === 0) {
            return NextResponse.json({ success: false, error: "Description is required" });
        }

        // Determine Message Text based on Sender
        let messageText = "";
        if (sender === 'seller') {
            messageText = `🤝 **SELLER OFFER**\n📦 Item: ${description}\n💰 Price: ₹${amount}\n\nBuyer, do you accept?`;
        } else {
            messageText = `🙋‍♂️ **BUYER PROPOSAL**\n📦 Item: ${description}\n💰 Proposed Price: ₹${amount}\n\nSeller, do you accept?`;
        }

        const offerMessage = await Chat.create({
            sellerId,
            userId: userId, // Use real User ID
            sender: sender, // 'user' or 'seller'
            message: messageText,
            type: 'OFFER',
            offerAmount: amount,
            offerStatus: 'PENDING'
        });

        return NextResponse.json({ success: true, data: offerMessage });

    } catch (error) {
        console.error("Offer Create Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}