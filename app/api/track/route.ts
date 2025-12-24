import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Visitor from '@/lib/models/Visitor';

export async function POST() {
    try {
        await dbConnect();
        const headersList = await headers();

        // Get IP (Works on Vercel/most proxies)
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = headersList.get('user-agent') || '';

        // Upsert: Update 'lastSeen' if IP exists, otherwise create new
        await Visitor.findOneAndUpdate(
            { ip: ip },
            {
                $set: {
                    lastSeen: new Date(),
                    userAgent: userAgent
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
