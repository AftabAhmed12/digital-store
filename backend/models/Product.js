import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    // Optional % off the base price (0–90). Sale price is derived: price * (1 - discountPercent/100)
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    currency: { type: String, default: "usd" },
    category: { type: String, required: true, index: true },
    // Multiple gallery images shown on the product page (first one is used as the card thumbnail)
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    // The actual digital file delivered to the buyer after payment
    digitalFile: {
      url: String,
      publicId: String,
      fileName: String,
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

export default mongoose.model("Product", productSchema);
