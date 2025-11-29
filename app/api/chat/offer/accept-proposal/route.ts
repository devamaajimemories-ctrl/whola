import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chat from "@/lib/models/Chat";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { messageId } = await req.json();

        // 1. Find the Buyer's Proposal
        const originalMsg = await Chat.findById(messageId);
        if (!originalMsg || originalMsg.sender !== 'user') {
            return NextResponse.json({ success: false, error: "Invalid proposal" });
        }

        // 2. Mark Original as Accepted
        originalMsg.offerStatus = 'ACCEPTED';
        await originalMsg.save();

        // 3. Create a New "Confirmed Deal" Offer from Seller
        // This allows the standard "Approve & Pay" logic to work for the Buyer
        const confirmedMsg = await Chat.create({
            sellerId: originalMsg.sellerId,
            userId: originalMsg.userId,
            sender: 'seller', // Now it's a Seller-endorsed offer
            message: `✅ **PROPOSAL ACCEPTED**\n\nThe seller accepted your price.\n\n📦 ${originalMsg.message.split('\n')[1] || 'Deal'}\n💰 Final Price: ₹${originalMsg.offerAmount}`,
            type: 'OFFER',
            offerAmount: originalMsg.offerAmount,
            offerStatus: 'PENDING' // Pending Buyer Payment
        });

        return NextResponse.json({ success: true, data: confirmedMsg });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" });
    }
}