import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get token from cookies
        const token = (request as any).cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        // 2. Verify Token
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        // 3. Fetch User from DB to get latest details
        await dbConnect();
        const user = await User.findById(payload.userId).select('name phone role');

        if (!user) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        // 4. Return User Info
        return NextResponse.json({
            success: true,
            user: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
