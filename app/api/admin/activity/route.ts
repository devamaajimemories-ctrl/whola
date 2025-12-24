import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Request from '@/lib/models/Request';
import Chat from '@/lib/models/Chat';
import SearchHistory from '@/lib/models/SearchHistory';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';

    try {
        // --- TAB 1: REGISTERED USERS (Mobile/Email Logged In) ---
        // Find users matching search or get latest 20
        const userQuery = search
            ? { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] }
            : {};

        const dbUsers = await User.find(userQuery).sort({ updatedAt: -1 }).limit(20).lean();

        const registeredData = await Promise.all(dbUsers.map(async (user: any) => {
            const userId = user._id.toString();
            // Fetch everything linked to this User ID or Phone
            const [reqs, chats, searches] = await Promise.all([
                Request.find({ $or: [{ buyerPhone: user.phone }, { buyerName: user.name }] }).sort({createdAt: -1}).limit(5).lean(),
                Chat.find({ userId: userId }).sort({createdAt: -1}).limit(5).lean(),
                SearchHistory.find({ userId: userId }).sort({timestamp: -1}).limit(10).lean()
            ]);

            return {
                _id: userId,
                name: user.name,
                phone: user.phone,
                email: user.email,
                joined: user.createdAt,
                activity: { requests: reqs, chats: chats, searches: searches }
            };
        }));

        // --- TAB 2: GUESTS (IP Based, No Phone) ---
        // We aggregate SearchHistory by IP where userId is missing
        const guestAgg = await SearchHistory.aggregate([
            { $match: { userId: { $exists: false } } }, // Only anonymous
            { $sort: { timestamp: -1 } },
            { $group: {
                _id: "$ip",
                lastSeen: { $first: "$timestamp" },
                // UPDATED: Store object with query AND location
                queries: { $push: { query: "$query", location: "$location" } } 
            }},
            { $limit: 20 }
        ]);

        const guestData = await Promise.all(guestAgg.map(async (g: any) => {
            const ip = g._id;
            // Fetch chats linked to this IP
            const chats = await Chat.find({ ip: ip }).sort({createdAt: -1}).limit(5).lean();
            
            return {
                _id: ip,
                ip: ip,
                lastSeen: g.lastSeen,
                activity: {
                    searches: g.queries.slice(0, 5), // Top 5 recent searches
                    chats: chats
                }
            };
        }));

        return NextResponse.json({ 
            success: true, 
            registered: registeredData,
            guests: guestData
        });

    } catch (error) {
        console.error("Activity Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}