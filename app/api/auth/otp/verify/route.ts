import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/lib/models/Otp';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth'; // ✅ Changed: Import signToken instead of createAuthCookie

export async function POST(req: Request) {
    try {
        // 1. Initialize Database Connection
        await dbConnect();

        // 2. Parse and Validate Input
        const body = await req.json();
        const { phone, otp, role } = body;

        if (!phone || !otp || !role) {
            return NextResponse.json(
                { success: false, error: "Missing required fields (phone, otp, role)" },
                { status: 400 }
            );
        }

        // 3. Verify OTP against Database
        const otpRecord = await Otp.findOne({ phone, otp });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired OTP" },
                { status: 401 }
            );
        }

        // 4. Find or Create User/Seller (Atomic Operation)
        let entity;
        const updateData = { $set: { lastLogin: new Date() } };
        const options = { new: true, upsert: true, setDefaultsOnInsert: true };

        if (role === 'seller') {
            entity = await Seller.findOneAndUpdate({ phone }, updateData, options);
        } else if (role === 'buyer') {
            entity = await User.findOneAndUpdate({ phone }, updateData, options);
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid role provided" },
                { status: 400 }
            );
        }

        if (!entity) {
            throw new Error("Database error: Failed to retrieve user entity.");
        }

        // 5. Security: Delete OTP immediately after use (Prevent Replay Attacks)
        await Otp.deleteOne({ phone });

        // 6. Generate Session Token
        // We use 'signToken' which exists in your lib/auth.ts
        const token = await signToken({
            userId: entity._id.toString(),
            role: role
        });

        // 7. Prepare Response
        const redirectUrl = role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
        
        const response = NextResponse.json({
            success: true,
            message: "Authentication successful",
            redirectUrl
        });

        // 8. Set Secure HTTP-Only Cookie
        // This manually does what createAuthCookie was supposed to do
        response.cookies.set('auth_token', token, {
            httpOnly: true, // JavaScript cannot access this (XSS Protection)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // CSRF Protection
            maxAge: 60 * 60 * 24 * 30, // 30 Days
            path: '/', // Available across the entire site
        });

        return response;

    } catch (error: any) {
        console.error("[Auth Error]:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}