import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Seller from '@/lib/models/Seller';

// 🚨 VALIDATION SCHEMA
const productSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    price: z.number().positive(),
    unit: z.string().default('Piece'),
    category: z.string().min(1),
    images: z.array(z.string().url()).max(5).optional(),
    specifications: z.record(z.string(), z.string()).optional()
});

export async function POST(req: Request) {
    try {
        await dbConnect();

        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // 1. Validate Input
        const validation = productSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: "Validation Failed",
                details: validation.error.issues // <--- FIX: Use 'issues' instead of 'errors'
            }, { status: 400 });
        }

        const data = validation.data;

        // 2. Create Product
        const newProduct = await Product.create({
            sellerId,
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            category: data.category,
            images: data.images || [],
            specifications: data.specifications || {},
            status: 'APPROVED' // Automatically approved as per user request
        });

        // 3. Update Seller Count
        await Seller.findByIdAndUpdate(sellerId, {
            $inc: { productsAdded: 1 }
        });

        return NextResponse.json({ success: true, message: "Product added", product: newProduct });

    } catch (error) {
        console.error("Add Product Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}