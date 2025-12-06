import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// Standard GSTIN Regex for India
// Format: 2 digits (State Code) + 5 chars (PAN) + 4 digits (Entity No) + 1 char (Z) + 1 char (Check Code)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Authentication Check (Secure Header from Middleware)
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { gstin } = body;

        // 2. Input Validation
        if (!gstin) {
            return NextResponse.json({ success: false, error: 'GST Number is required' }, { status: 400 });
        }

        const upperGST = gstin.toUpperCase();

        if (!GST_REGEX.test(upperGST)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid GST Format. Example: 27AAAAA0000A1Z5' 
            }, { status: 400 });
        }

        // 3. Find and Update Seller
        // FIX: Cast to 'any' to ensure TypeScript recognizes properties like 'profileCompleted'
        const seller = await Seller.findById(sellerId) as any;
        
        if (!seller) {
            return NextResponse.json({ success: false, error: 'Seller account not found' }, { status: 404 });
        }

        // Check if already verified (optional optimization)
        if (seller.isVerified && seller.gstin === upperGST) {
            return NextResponse.json({ success: true, message: 'Already verified' });
        }

        // Update fields
        seller.gstin = upperGST;
        seller.isVerified = true; 
        
        // Update profile completeness score
        seller.profileCompleted = !!(seller.address && seller.gstin);

        await seller.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Verification Successful! Badge Activated.',
            seller: {
                name: seller.name,
                isVerified: true,
                gstin: upperGST
            }
        });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}