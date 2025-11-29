import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const count = await Seller.countDocuments();
        const sample = await Seller.findOne({ category: 'Mobile Phones' });
        const allSellers = await Seller.find({}).limit(5).select('name category city tags');

        return NextResponse.json({
            success: true,
            dbName: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0],
            totalSellers: count,
            sampleMobileSeller: sample,
            first5Sellers: allSellers
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
