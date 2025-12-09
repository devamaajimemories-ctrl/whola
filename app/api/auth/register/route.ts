import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Seller from '@/lib/models/Seller';
import { z } from 'zod';
import { signToken, createAuthCookie } from '@/lib/auth';

const registerSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email(),
    city: z.string().min(2),
    category: z.string().optional(),
    role: z.enum(['buyer', 'seller']).default('seller')
});

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
        }

        const validatedData = result.data;

        // Check Duplicates
        const existingUser = await User.findOne({ $or: [{ email: validatedData.email }, { phone: validatedData.phone }] });
        if (existingUser) return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 });

        const existingSeller = await Seller.findOne({ phone: validatedData.phone });
        if (existingSeller) return NextResponse.json({ success: false, error: "Seller already exists" }, { status: 409 });

        // Create Records
        const newUser = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            role: 'seller' // Ensure 'seller' is added to your User model enum as discussed previously
        });

        await Seller.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            city: validatedData.city,
            category: validatedData.category || 'General',
            isVerified: false,
            walletBalance: 500
        } as any);

        // FIX: Changed 'id' to 'userId' to match middleware and login route
        const token = await signToken({ 
            userId: newUser._id.toString(), 
            role: newUser.role, 
            name: newUser.name 
        });
        
        const response = NextResponse.json({ success: true, message: "Registration successful", redirectUrl: '/seller/dashboard' });

        return createAuthCookie(response, token);

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
