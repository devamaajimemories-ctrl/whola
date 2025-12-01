import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/lib/models/Otp';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';
import { signToken, createAuthCookie } from '@/lib/auth';

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
        // Extract optional registration fields from body
        const { name, company, email, category, city } = body;

        // Prepare update data: Always update lastLogin, optionally update profile fields if provided
        const updateData: any = { $set: { lastLogin: new Date() } };

        if (name) updateData.$set.name = name;
        if (company) updateData.$set.companyName = company; // Mapping 'company' to 'companyName' schema field
        if (email) updateData.$set.email = email;
        if (category) updateData.$set.category = category;
        if (city) updateData.$set.city = city;

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
        const finalResponse = createAuthCookie(response, token);

        return finalResponse;

    } catch (error: any) {
        console.error("[Auth Error]:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}