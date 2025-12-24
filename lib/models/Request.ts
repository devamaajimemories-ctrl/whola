import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: "Pieces",
  },
  estimatedPrice: {
    type: String, 
    required: true, // NOW MANDATORY
  },
  description: {
    type: String,
    required: false, // Remains optional
  },
  category: {
    type: String,
    default: "General",
  },
  city: {
    type: String,
    required: false, 
  },
  buyerName: {
    type: String,
    required: true,
  },
  buyerPhone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["OPEN", "CLOSED", "FULFILLED"],
    default: "OPEN",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);