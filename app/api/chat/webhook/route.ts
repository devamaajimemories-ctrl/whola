import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import Seller from '@/lib/models/Seller'; // ✅ Added Import
import { checkPII } from '@/lib/utils/pii-filter';

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // 1. Get Data from Bot
        const body = await req.json();
        const { message, senderName, sellerPhone } = body;
        let { sellerId } = body;

        // 2. ✅ CRITICAL FIX: Find Seller ID using Phone Number
        if (!sellerId && sellerPhone) {
            const seller = await Seller.findOne({ phone: sellerPhone });
            if (seller) {
                sellerId = seller._id;
            } else {
                return NextResponse.json({ success: false, error: "Seller not found for this phone" }, { status: 404 });
            }
        }

        // 3. Validate
        if (!message || !sellerId) {
            return NextResponse.json({ success: false, error: "Missing sellerId or valid phone" }, { status: 400 });
        }

        // 4. PII Check
        const piiCheck = checkPII(message);
        let finalMessage = message;
        let isBlocked = false;

        if (!piiCheck.isSafe) {
            finalMessage = `[BLOCKED]: Seller tried to share ${piiCheck.detected}.`;
            isBlocked = true;
        }

        // 5. Save to Database
        // Note: userId is 'guest' because the bot doesn't know which specific buyer 
        // the seller is replying to unless you track context. 
        // For now, this saves the message so Admin can see it.
        const newMessage = await Chat.create({
            sellerId,
            userId: 'guest', 
            sender: 'seller', 
            message: finalMessage,
            isBlocked
        });

        return NextResponse.json({ success: true, data: newMessage });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}