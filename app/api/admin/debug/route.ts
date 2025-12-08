import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const count = await Seller.countDocuments({});
        const sample = await Seller.findOne({});
        return NextResponse.json({ success: true, count, sample });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}