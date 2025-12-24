import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Seller from '@/lib/models/Seller';

// 1. Helper Function to Generate SEO Slugs
function generateSlug(name: string): string {
    const slug = name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
    
    // Append timestamp to ensure it is always unique
    return `${slug}-${Date.now()}`;
}

// 2. Robust Schema
const productSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    description: z.string().max(2000).optional().or(z.literal('')),
    // Coerce string numbers to actual numbers
    price: z.preprocess((val) => {
        if (typeof val === 'string' && val.trim() !== '') {
            return parseFloat(val);
        }
        return val;
    }, z.number().nonnegative("Price must be a positive number")),
    unit: z.string().default('Piece'),
    category: z.string().min(1, "Category is required"),
    images: z.array(z.string().url()).max(5).optional(),
    specifications: z.record(z.string(), z.any()).optional()
});

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 🔴 SELF-HEALING: Fix the "Duplicate Null" Index
        try {
            await Product.collection.dropIndex('slug_1'); 
            console.log("⚠️ Old broken index dropped. System is self-healing.");
        } catch (e) {
            // Ignore if index doesn't exist
        }
        
        const headersList = await headers();
        const sellerId = headersList.get('x-user-id');

        if (!sellerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const validation = productSchema.safeParse(body);
        
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || "Invalid Data";
            return NextResponse.json({ success: false, error: firstError }, { status: 400 });
        }

        const data = validation.data;

        // 3. Generate Default Description if missing
        const finalDescription = data.description && data.description.length > 5 
            ? data.description 
            : `${data.name} - High quality ${data.category} available for wholesale.`;

        // 4. Create Product with Slug
        const newProduct = await Product.create({
            sellerId,
            name: data.name,
            slug: generateSlug(data.name), // ✅ Generating Slug
            description: finalDescription,
            price: data.price,
            unit: data.unit,
            category: data.category,
            images: data.images || [],
            specifications: data.specifications || {},
            status: 'APPROVED'
        });

        await Seller.findByIdAndUpdate(sellerId, { $inc: { productsAdded: 1 } });

        return NextResponse.json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error: any) {
        console.error("Add Product API Error:", error);
        
        if (error.code === 11000) {
             return NextResponse.json({ success: false, error: "Product already exists (Duplicate Key)." }, { status: 409 });
        }

        return NextResponse.json({ 
            success: false, 
            error: error.message || "Internal Server Error" 
        }, { status: 500 });
    }
}