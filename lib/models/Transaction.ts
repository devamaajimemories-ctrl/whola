import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITransaction extends Document {
    sellerId: string;
    type: 'LEAD_UNLOCK' | 'DEAL_EARNING' | 'PAYOUT' | 'CREDIT_PURCHASE' | 'INITIAL_CREDIT' | 'REFUND';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    relatedId?: string; // RequestId, OrderId, or PayoutId
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    sellerId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['LEAD_UNLOCK', 'DEAL_EARNING', 'PAYOUT', 'CREDIT_PURCHASE', 'INITIAL_CREDIT', 'REFUND'],
        required: true,
        index: true
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    relatedId: { type: String },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'FAILED'],
        default: 'COMPLETED'
    }
}, {
    timestamps: true
});

// Index for fast queries
TransactionSchema.index({ sellerId: 1, createdAt: -1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
