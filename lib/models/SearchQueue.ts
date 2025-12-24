import mongoose from 'mongoose';

const SearchQueueSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  itemsFound: { type: Number, default: 0 },
  requestedAt: { type: Date, default: Date.now },
  completedAt: Date,
  error: String
});

// Helper to prevent "OverwriteModelError" during hot reloads
export default mongoose.models.SearchQueue || mongoose.model('SearchQueue', SearchQueueSchema);