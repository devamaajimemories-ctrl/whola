import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { signToken } from '@/lib/auth';

// Validation schema
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    // company: z.string().min(2, 'Company name is required'), // REMOVED: Frontend doesn't send this
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    email: z.string().email('Invalid email address'),
    category: z.string().default('General'),
    city: z.string().default(''),
});

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        // Check if seller already exists
        const existingSeller = await Seller.findOne({ phone: validatedData.phone });

        if (existingSeller) {
            return NextResponse.json(
                { success: false, error: 'Phone number already registered' },
                { status: 400 }
            );
        }

        // Create new seller with business details
        const newSeller = await Seller.create({
            // Use Name provided by user
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            city: validatedData.city || 'Not specified',
            category: validatedData.category,
            tags: [],
            walletBalance: 500, // ₹500 free credits
            isVerified: false,
            // Defaults
            totalEarnings: 0,
            pendingPayouts: 0,
            ratingAverage: 0,
            ratingCount: 0,
            totalDealsCompleted: 0,
            productsAdded: 0,
            profileCompleted: false,
            hasGSTIN: false,
            hasBusinessDetails: false,
            country: 'India'
        });

        // Generate JWT token with ROLE
        const token = await signToken({
            userId: newSeller._id.toString(),
            role: 'seller'
        });

        // Set HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            message: 'Registration successful! Welcome to YouthBharat',
            seller: {
                id: newSeller._id,
                name: newSeller.name,
                phone: newSeller.phone,
                walletBalance: newSeller.walletBalance,
            }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            // FIXED: Changed error.errors to error.issues
            return NextResponse.json(
                { success: false, error: error.issues[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}