import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScrapeState extends Document {
    key: string;
    currentIndex: number;
    lastRun: Date;
}

const ScrapeStateSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true, default: 'global_index' },
    currentIndex: { type: Number, default: 0 }, // Remembers position in the list
    lastRun: { type: Date, default: Date.now }
});

const ScrapeState: Model<IScrapeState> = mongoose.models.ScrapeState || mongoose.model<IScrapeState>('ScrapeState', ScrapeStateSchema);

export default ScrapeState;
