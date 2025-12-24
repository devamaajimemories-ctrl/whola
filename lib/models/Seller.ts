import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeller extends Document {
    name: string;
    email?: string; 
    phone: string;
    city?: string;
    category?: string;
    tags: string[];
    
    // Stats
    walletBalance: number;
    totalEarnings: number;
    pendingPayouts: number;
    ratingAverage: number;
    ratingCount: number;
    totalDealsCompleted: number;
    totalViews: number;
    isVerified: boolean;

    // RICH DATA (New Fields)
    businessType?: string;    // e.g. "PVC Pipe Manufacturer"
    address?: string;         // e.g. "Shop 12, Main Market, Ranikhet"
    openingHours?: string;    // e.g. "Mon-Sun: 9AM - 9PM"
    images: string[];         // e.g. ["https://lh5.googleusercontent.com/..."]
    
    // Business Details
    gstin?: string;
    yearEstablished?: number;
    employeeCount?: string;
    annualTurnover?: string;

    // Address Components
    pincode?: string;
    state?: string;
    country?: string;

    // Profile Completion
    profileCompleted?: boolean;
    productsAdded?: number;
    hasGSTIN?: boolean;
    hasBusinessDetails?: boolean;

    // Bank Details
    bankAccountNumber?: string;
    bankIFSC?: string;
    bankAccountHolderName?: string;
    bankVerified?: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const SellerSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, default: '' }, 
    phone: { type: String, required: true, unique: true, index: true },
    city: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },

    // Revenue & Trust
    walletBalance: { type: Number, default: 500 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalDealsCompleted: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // RICH DATA
    businessType: { type: String, default: 'Supplier' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '' },
    images: { type: [String], default: [] }, // Stores URLs

    // Business Details
    gstin: { type: String, default: '' },
    yearEstablished: { type: Number, default: null },
    employeeCount: { type: String, default: '' },
    annualTurnover: { type: String, default: '' },

    // Address
    pincode: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },

    // Profile Completion
    profileCompleted: { type: Boolean, default: false },
    productsAdded: { type: Number, default: 0 },
    hasGSTIN: { type: Boolean, default: false },
    hasBusinessDetails: { type: Boolean, default: false },

    // Bank Details
    bankAccountNumber: { type: String, default: '' },
    bankIFSC: { type: String, default: '' },
    bankAccountHolderName: { type: String, default: '' },
    bankVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Seller = (mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema)) as Model<ISeller>;
export default Seller;