import mongoose from "mongoose";

// Coupons support a many-to-many relationship with products: a coupon can apply
// to many products, and a product can be discounted by many coupons.
// appliesToAll=true means the coupon works on every product in the store.
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // "percent" = X% off the price, "fixed" = fixed amount off (in main currency units)
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true },
    appliesToAll: { type: Boolean, default: false },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // Category-level applicability — a coupon can be valid for whole categories too
    appliesToCategories: [{ type: String }],
    // Minimum order amount (in main currency units, e.g. USD dollars) the coupon works on
    minAmount: { type: Number, default: 0 },
    // maxUses=null means unlimited; usedCount tracks how many times it has been applied
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);