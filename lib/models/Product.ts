import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    sellerId: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    images: string[];
    description: string;
    // Allow any object structure for flexible specifications
    specifications: Record<string, any>; 
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date;
}

const ProductSchema: Schema = new Schema({
    sellerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'Piece' },
    category: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String },
    // Use Schema.Types.Mixed for maximum flexibility
    specifications: { type: Schema.Types.Mixed, default: {} }, 
    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    }
}, {
    timestamps: true
});

const Product = (mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)) as Model<IProduct>;
export default Product;