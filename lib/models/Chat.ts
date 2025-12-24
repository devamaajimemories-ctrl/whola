import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
    sellerId: string;
    userId: string;
    sender: 'user' | 'seller' | 'system';
    message: string;
    isBlocked: boolean;

    // Deal Fields
    type: 'TEXT' | 'OFFER' | 'PAYMENT_LINK';
    offerAmount?: number;
    offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'; // Tracks approval
    paymentLink?: string;

    createdAt: Date;
}

const ChatSchema: Schema = new Schema({
    sellerId: { type: String, required: true, index: true },
    userId: { type: String, required: true, default: 'guest' },
    sender: { type: String, enum: ['user', 'seller', 'system'], required: true },
    message: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },

    // Deal Logic
    type: { type: String, enum: ['TEXT', 'OFFER', 'PAYMENT_LINK'], default: 'TEXT' },
    offerAmount: { type: Number },
    offerStatus: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
    paymentLink: { type: String }
}, {
    timestamps: true,
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;