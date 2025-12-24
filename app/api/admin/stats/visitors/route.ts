import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visitor from '@/lib/models/Visitor';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const now = new Date();

        // 1. Calculate Start of Day (Today 00:00)
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        // 2. Calculate "Active Now" threshold (e.g., last 15 minutes)
        const fiveMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

        // Run queries in parallel
        const [dailyVisitors, activeUsers] = await Promise.all([
            // Count visitors who have a 'lastSeen' or 'createdAt' >= today
            Visitor.countDocuments({ lastSeen: { $gte: startOfDay } }),

            // Count visitors seen in the last 15 minutes
            Visitor.countDocuments({ lastSeen: { $gte: fiveMinsAgo } })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                dailyVisitors,
                activeUsers
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Stats Error" }, { status: 500 });
    }
}
