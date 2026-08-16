import mongoose from "mongoose";

// A promotional campaign (e.g. Father's Day, Friendship Day) that shows a
// full-width poster banner on the storefront. Every campaign owns a coupon:
// the campaign's end date becomes the coupon's expiry, and the coupon's
// products/categories decide which items the code works on.
const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    posterImage: {
      url: { type: String, required: true },
      publicId: String,
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);