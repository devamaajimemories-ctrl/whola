import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(req: Request) {
    await dbConnect();
    const headersList = await headers();
    const sellerId = headersList.get('x-user-id');
    if (!sellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
}
