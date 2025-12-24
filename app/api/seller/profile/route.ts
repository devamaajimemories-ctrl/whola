import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// GET: Fetch My Profile
export async function GET(req: Request) {
    try {
        await dbConnect();
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        // FIX: Cast to 'any' to bypass strict TypeScript checks for properties like 'category'
        const seller = await Seller.findById(sellerId) as any;
        
        if (!seller) return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            profile: {
                name: seller.name,
                phone: seller.phone,
                email: seller.email || '',
                city: seller.city,
                category: seller.category,
                gstin: seller.gstin || '',
                businessType: seller.businessType || '',
                yearEstablished: seller.yearEstablished,
                address: seller.address || '',
                pincode: seller.pincode || '',
                state: seller.state || '',
                profileCompleted: seller.profileCompleted
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

// PUT: Update My Profile
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        // Update only allowed fields
        const updates: any = {};
        if (body.gstin !== undefined) updates.gstin = body.gstin;
        if (body.businessType !== undefined) updates.businessType = body.businessType;
        if (body.address !== undefined) updates.address = body.address;
        if (body.city !== undefined) updates.city = body.city;
        if (body.pincode !== undefined) updates.pincode = body.pincode;
        if (body.state !== undefined) updates.state = body.state;

        // Update database
        await Seller.findByIdAndUpdate(sellerId, {
            $set: updates,
            // Simple logic: if address & gstin exist, mark as complete
            profileCompleted: !!(updates.address && updates.gstin)
        });

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
    }
}