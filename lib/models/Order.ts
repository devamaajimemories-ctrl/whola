import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrder extends Document {
    orderId: string;
    requestId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    commissionAmount: number;
    sellerAmount: number; // Amount seller receives (95%)
    paymentStatus: 'PENDING' | 'PAID' | 'RELEASED_TO_SELLER' | 'REFUNDED';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    deliveryStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    deliveryProof?: string; // URL to uploaded image/document
    trackingNumber?: string;
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
        enum: ['PENDING', 'PAID', 'RELEASED_TO_SELLER', 'REFUNDED'],
        default: 'PENDING',
        index: true
    },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    deliveryStatus: {
        type: String,
        enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
        index: true
    },
    deliveryProof: { type: String },
    trackingNumber: { type: String },
    buyerNotes: { type: String },
    sellerNotes: { type: String }
}, {
    timestamps: true
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
