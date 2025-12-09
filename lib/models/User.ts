import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    role: 'buyer' | 'admin' | 'seller'; // Updated interface
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    // Add 'seller' to the enum below
    role: { type: String, enum: ['buyer', 'admin', 'seller'], default: 'buyer' }, 
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
