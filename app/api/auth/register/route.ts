import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

        const data = result.data;

        // Check for existing accounts
        const existingSeller = await Seller.findOne({ phone: data.phone });
        if (existingSeller) {
            return NextResponse.json({ success: false, error: "Phone number already registered. Please Login." }, { status: 409 });
        }

        // 1. Create Seller Record
        // FIX: Cast result to 'any' to prevent TypeScript from treating it as an array
        const newSeller = await Seller.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            category: data.category || 'General',
            walletBalance: 500, // Free credits for new sellers
            isVerified: false
        } as any) as any;

        // 2. Generate Token for the new Seller
        const token = await signToken({ 
            userId: newSeller._id.toString(), 
            role: 'seller', 
            name: newSeller.name 
        });

        // 3. Set Cookie and Redirect
        const response = NextResponse.json({ 
            success: true, 
            message: "Account created!", 
            redirectUrl: '/seller/dashboard' 
        });

        return createAuthCookie(response, token);

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}