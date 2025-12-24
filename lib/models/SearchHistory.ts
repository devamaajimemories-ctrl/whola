import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchHistory extends Document {
    userId?: string;
    ip: string;
    query: string;
    location?: string; // Add this line
    timestamp: Date;
}

const SearchHistorySchema: Schema = new Schema({
    userId: { type: String, index: true }, 
    ip: { type: String, index: true },
    query: { type: String, required: true },
    location: { type: String }, // Add this line
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const SearchHistory: Model<ISearchHistory> = mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
export default SearchHistory;