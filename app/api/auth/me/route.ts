import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Seller from "@/lib/models/Seller"; // Import Seller Model

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const token = (request as any).cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        await dbConnect();
        
        let user;
        let role = payload.role;

        // FIX: Check the role and query the correct collection
        if (role === 'seller') {
            user = await Seller.findById(payload.userId).select('name phone');
        } else {
            user = await User.findById(payload.userId).select('name phone role');
        }

        if (!user) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            user: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
                role: role, // Return the role from payload/logic
            }
        });

    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}