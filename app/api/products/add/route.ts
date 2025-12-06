import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Seller from '@/lib/models/Seller';

// Simplified Zod Schema
const productSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    price: z.number().positive(), // Removed the custom error object causing the crash
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

        if (!sellerId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const validation = productSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                error: "Validation Failed",
                details: validation.error.format()
            }, { status: 400 });
        }

        const data = validation.data;

        const newProduct = await Product.create({
            sellerId,
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            category: data.category,
            images: data.images || [],
            specifications: data.specifications || {},
            status: 'APPROVED'
        } as any);

        await Seller.findByIdAndUpdate(sellerId, { $inc: { productsAdded: 1 } });

        return NextResponse.json({ success: true, message: "Product added", product: newProduct });

    } catch (error: any) {
        console.error("Add Product Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}