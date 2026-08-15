import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    // Denormalized so the admin list can filter by category + search without joins
    productTitle: { type: String, required: true },
    category: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productTitle: "text", comment: "text", name: "text" });

export default mongoose.model("Review", reviewSchema);
