import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeller extends Document {
    name: string;
    email: string;
    phone: string;
    city: string;
    category: string;
    tags: string[];
    walletBalance: number;
    totalEarnings: number;
    pendingPayouts: number;
    ratingAverage: number;
    ratingCount: number;
    totalDealsCompleted: number;
    totalViews: number;
    isVerified: boolean;

    // Business Details
    gstin?: string;
    businessType?: string;
    yearEstablished?: number;
    employeeCount?: string;
    annualTurnover?: string;

    // Address
    address?: string;
    pincode?: string;
    state?: string;
    country?: string;

    // Profile Completion
    profileCompleted?: boolean;
    productsAdded?: number;
    hasGSTIN?: boolean;
    hasBusinessDetails?: boolean;

    // Bank Details for Automated Payouts
    bankAccountNumber?: string;
    bankIFSC?: string;
    bankAccountHolderName?: string;
    bankVerified?: boolean;
}

const SellerSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },

    // Revenue & Trust
    walletBalance: { type: Number, default: 500 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    totalDealsCompleted: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    // Business Details
    gstin: { type: String, default: '' },
    businessType: { type: String, default: '' },
    yearEstablished: { type: Number, default: null },
    employeeCount: { type: String, default: '' },
    annualTurnover: { type: String, default: '' },

    // Address
    address: { type: String, default: '' },
    pincode: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },

    // Profile Completion
    profileCompleted: { type: Boolean, default: false },
    productsAdded: { type: Number, default: 0 },
    hasGSTIN: { type: Boolean, default: false },
    hasBusinessDetails: { type: Boolean, default: false },

    // Bank Details for Automated Payouts
    bankAccountNumber: { type: String, default: '' },
    bankIFSC: { type: String, default: '' },
    bankAccountHolderName: { type: String, default: '' },
    bankVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const Seller: Model<ISeller> = mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
export default Seller;