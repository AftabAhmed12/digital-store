import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productTitle: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    // Final charged amount is stored in `amount` (Stripe convention: cents).
    // originalAmount = price before any discount, discountAmount = cents taken off.
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    // Guards against double-counting a coupon use if Stripe retries the webhook
    couponCounted: { type: Boolean, default: false },
    currency: { type: String, default: "usd" },
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "email_sent", "email_failed"],
      default: "pending",
    },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
