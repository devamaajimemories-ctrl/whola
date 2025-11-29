import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRequest extends Document {
    buyerName?: string;
    buyerPhone: string; // Private until unlocked
    product: string;
    quantity: string;
    category: string;
    budget?: number;
    
    // Lead Management
    leadType: 'EXCLUSIVE' | 'SHARED';
    status: 'OPEN' | 'LOCKED' | 'CLOSED' | 'IN_ESCROW';
    
    // Handshake Logic
    interestedSellers: string[]; // Array of Seller IDs who clicked "Interested"
    approvedSellers: string[];   // Array of Seller IDs the buyer approved (Charged ₹50)
    
    // Locking and Unlocking
    lockedBy?: string;       // ID of the seller who locked the deal
    unlockedBy?: string[];   // Array of Seller IDs who have unlocked this lead

    createdAt: Date;
}

const RequestSchema: Schema = new Schema({
    buyerName: { type: String },
    buyerPhone: { type: String, required: true },
    product: { type: String, required: true },
    quantity: { type: String, required: true },
    category: { type: String, required: true },
    budget: { type: Number },

    leadType: { type: String, enum: ['EXCLUSIVE', 'SHARED'], default: 'SHARED' },
    status: { type: String, enum: ['OPEN', 'LOCKED', 'CLOSED', 'IN_ESCROW'], default: 'OPEN' },

    // The Handshake Arrays
    interestedSellers: { type: [String], default: [] },
    approvedSellers: { type: [String], default: [] }, // Sellers here have been charged ₹50

    // Locking and Unlocking
    lockedBy: { type: String },
    unlockedBy: { type: [String], default: [] },

    createdAt: { type: Date, default: Date.now }
});

const Request: Model<IRequest> = mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);
export default Request;