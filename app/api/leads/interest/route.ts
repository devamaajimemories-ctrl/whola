import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { requestId } = await req.json();

        // 1. Find Request
        const lead = await Request.findById(requestId);
        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

        // 2. Check if already interested
        if (lead.interestedSellers.includes(sellerId)) {
            return NextResponse.json({ message: "Already expressed interest" });
        }

        // 3. Add to Interested List
        lead.interestedSellers.push(sellerId);
        await lead.save();

        // Optional: Trigger Notification to Buyer here (SMS/WhatsApp)
        // "Seller X is interested in your requirement..."

        return NextResponse.json({ 
            success: true, 
            message: "Interest sent to Buyer. Waiting for approval." 
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}