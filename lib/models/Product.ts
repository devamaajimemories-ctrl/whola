import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    sellerId: string;
    name: string;
    slug: string; // ✅ Added SEO Slug
    price: number;
    unit: string;
    category: string;
    images: string[];
    description: string;
    specifications: Record<string, any>; 
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
}

const ProductSchema: Schema = new Schema({
    sellerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    // ✅ FIX: 'sparse: true' prevents "null" duplicate error for old products
    slug: { type: String, unique: true, sparse: true, index: true, trim: true }, 
    price: { type: Number, required: true },
    unit: { type: String, default: 'Piece' },
    category: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String },
    specifications: { type: Schema.Types.Mixed, default: {} }, 
    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    }
}, {
    timestamps: true
});

// 🔴 CRITICAL: Force model rebuild to apply the new schema immediately
if (mongoose.models.Product) {
    delete mongoose.models.Product;
}

const Product = (mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)) as Model<IProduct>;
export default Product;