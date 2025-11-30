import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';

const ADMIN_TOKEN = process.env.ADMIN_MONITOR_TOKEN || 'admin123secure';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const buyerId = searchParams.get('buyerId');
        const sellerId = searchParams.get('sellerId');

        // Verify admin token
        if (!token || token !== ADMIN_TOKEN) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!buyerId || !sellerId) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        await dbConnect();

        // Fetch conversation messages
        const messages = await Chat.find({
            userId: buyerId,
            sellerId: sellerId
        }).sort({ createdAt: 1 });

        // Fetch buyer and seller names
        const buyer = await User.findById(buyerId).select('name');
        const seller = await Seller.findById(sellerId).select('name');

        return NextResponse.json({
            success: true,
            messages,
            buyerName: buyer?.name || 'Unknown Buyer',
            sellerName: seller?.name || 'Unknown Seller'
        });

    } catch (error) {
        console.error('Admin Monitor Error:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
