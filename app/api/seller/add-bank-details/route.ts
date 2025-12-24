import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// Clean version: No RazorpayX logic, just saving data.
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { accountNumber, ifsc, accountHolderName } = await request.json();

        // 1. Basic Validation
        if (!accountNumber || !ifsc || !accountHolderName) {
            return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
        }

        // 2. Validate IFSC format (Basic Regex)
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            return NextResponse.json({ success: false, error: "Invalid IFSC code format" }, { status: 400 });
        }

        // 3. Update Seller's Bank Details in Database
        const seller = await Seller.findByIdAndUpdate(
            sellerId,
            {
                bankAccountNumber: accountNumber,
                bankIFSC: ifsc,
                bankAccountHolderName: accountHolderName,
                bankVerified: true 
            },
            { new: true }
        );

        if (!seller) {
            return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Bank details saved successfully!"
        });

    } catch (error: any) {
        console.error("Add Bank Details Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}