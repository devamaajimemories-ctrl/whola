
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

// Define Schema inline to avoid import issues with Next.js aliases in standalone script
const SellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    walletBalance: { type: Number, default: 500 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    totalDealsCompleted: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    gstin: { type: String, default: '' },
    businessType: { type: String, default: '' },
    yearEstablished: { type: Number, default: null },
    employeeCount: { type: String, default: '' },
    annualTurnover: { type: String, default: '' },
    address: { type: String, default: '' },
    pincode: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    profileCompleted: { type: Boolean, default: false },
    productsAdded: { type: Number, default: 0 },
    hasGSTIN: { type: Boolean, default: false },
    hasBusinessDetails: { type: Boolean, default: false },
    bankAccountNumber: { type: String, default: '' },
    bankIFSC: { type: String, default: '' },
    bankAccountHolderName: { type: String, default: '' },
    bankVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

async function main() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const sellerData = {
            name: "Rajeev Arora",
            phone: "9211211883",
            email: "rajeev.arora.test@youthbharat.com",
            city: "Delhi",
            category: "Mobile Phones",
            walletBalance: 500,
            isVerified: true,
            totalViews: 0
        };

        let seller = await Seller.findOne({ phone: sellerData.phone });

        if (seller) {
            console.log('Seller already exists:', seller._id);
        } else {
            seller = await Seller.create(sellerData);
            console.log('Seller created successfully:', seller._id);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
