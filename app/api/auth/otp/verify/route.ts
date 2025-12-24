import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/lib/models/Otp';
import Seller from '@/lib/models/Seller';
import User from '@/lib/models/User';
import { signToken, createAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { phone, otp, role, name, email } = body;

        if (!phone || !otp || !role) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify OTP
        const otpRecord = await Otp.findOne({ phone, otp });
        // NOTE: In production, uncomment the next line
        // if (!otpRecord) return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 401 });

        let entity;
        let userId;

        if (role === 'seller') {
            // Update or Create Seller with NAME
            entity = await Seller.findOneAndUpdate(
                { phone },
                { 
                    $set: { 
                        lastLogin: new Date(),
                        name: name || "Seller", // Use name if provided
                    } 
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            userId = entity._id.toString();
        } else {
            // Update or Create Buyer with NAME
            entity = await User.findOneAndUpdate(
                { phone },
                { 
                    $set: { 
                        lastLogin: new Date(),
                        name: name || "Buyer", // Use name if provided
                        role: 'buyer'
                    },
                    $setOnInsert: {
                        email: email || `user-${phone}@whola.com`
                    }
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            userId = entity._id.toString();
        }

        // 2. Token Generation
        const token = await signToken({
            userId: userId,
            role: role,
            name: entity.name // Pass name to token
        });

        const response = NextResponse.json({ success: true, user: { name: entity.name, role } });
        return createAuthCookie(response, token);

    } catch (error: any) {
        console.error("Auth Verify Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}