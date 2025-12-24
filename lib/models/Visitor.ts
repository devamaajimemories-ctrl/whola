import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisitor extends Document {
    ip: string;
    userAgent: string;
    lastSeen: Date;
    createdAt: Date;
}

const VisitorSchema: Schema = new Schema({
    ip: { type: String, required: true, index: true },
    userAgent: { type: String },
    lastSeen: { type: Date, default: Date.now, index: true } // Index for fast "active now" queries
}, {
    timestamps: true
});

// Create a compound index to ensure one record per IP per day (optional, or just upsert by IP)
// For simple "Active Users", we just upsert by IP.
const Visitor: Model<IVisitor> = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);
export default Visitor;
