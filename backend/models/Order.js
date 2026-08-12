import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productTitle: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "email_sent", "email_failed"],
      default: "pending",
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
