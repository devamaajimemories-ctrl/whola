import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { sellerId } = await request.json();

        if (!sellerId) {
            return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
        }

        await Seller.findByIdAndUpdate(sellerId, {
            $inc: { totalViews: 1 }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking view:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
