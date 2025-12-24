import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrder extends Document {
    orderId: string;
    requestId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    commissionAmount: number;
    sellerAmount: number; // Amount seller receives (95%)
    
    // ✅ EXPANDED PAYMENT STATUS
    paymentStatus: 
        | 'PENDING'             // User clicked pay, but not completed
        | 'PAID'                // Money is with Escrow (Razorpay)
        | 'FAILED'              // Payment failed/declined
        | 'RELEASED_TO_SELLER'  // Admin/System transferred money to seller
        | 'REFUNDED'            // Money sent back to buyer
        | 'DISPUTED';           // Payment frozen due to a claim

    razorpayPaymentId?: string;
    razorpayOrderId?: string;

    // ✅ EXPANDED DELIVERY STATUS
    deliveryStatus: 
        | 'PENDING'             // Order created, seller hasn't seen it yet
        | 'CONFIRMED'           // Seller acknowledged the order (Important!)
        | 'PACKED'              // Seller is preparing the package
        | 'SHIPPED'             // Handed over to courier
        | 'OUT_FOR_DELIVERY'    // Reaching buyer today (Notifications work best here)
        | 'DELIVERED'           // Successfully received
        | 'CANCELLED'           // Cancelled before shipping
        | 'RETURN_REQUESTED'    // Buyer wants to return
        | 'RETURNED'            // Item received back by seller
        | 'DELIVERY_FAILED';    // Courier couldn't find address / Buyer unavailable

    deliveryProof?: string; // URL to uploaded image/document
    trackingNumber?: string;
    courierName?: string;   // ✅ Added: Useful to know which courier (Delhivery, DTDC, etc.)
    
    buyerNotes?: string;
    sellerNotes?: string;
    
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    orderId: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    sellerAmount: { type: Number, required: true },
    
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'RELEASED_TO_SELLER', 'REFUNDED', 'DISPUTED'],
        default: 'PENDING',
        index: true
    },
    
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    
    deliveryStatus: {
        type: String,
        enum: [
            'PENDING', 
            'CONFIRMED', 
            'PACKED', 
            'SHIPPED', 
            'OUT_FOR_DELIVERY', 
            'DELIVERED', 
            'CANCELLED', 
            'RETURN_REQUESTED', 
            'RETURNED', 
            'DELIVERY_FAILED'
        ],
        default: 'PENDING',
        index: true
    },
    
    deliveryProof: { type: String },
    trackingNumber: { type: String },
    courierName: { type: String }, // ✅ New Field
    
    buyerNotes: { type: String },
    sellerNotes: { type: String }
}, {
    timestamps: true
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;