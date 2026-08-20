import Stripe from "stripe";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderDeliveryTemplate } from "../utils/emailTemplate.js";
import { buildDownloadUrl } from "../utils/downloadUrl.js";
import { salePriceFor } from "../utils/pricing.js";
import { resolveCouponDiscount } from "./couponController.js";
import { getPagination, paginated } from "../utils/paginate.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Create a Stripe Checkout session for a product (no login required)
// @route POST /api/orders/checkout
// body: { productId, customerEmail, couponCode? }
// Prices are ALWAYS computed server-side (product discountPercent first, then the
// optional coupon) — the client never sends an amount.
export const createCheckoutSession = async (req, res) => {
  try {
    const { productId, customerEmail, couponCode } = req.body;
    if (!customerEmail) return res.status(400).json({ message: "Email is required" });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const originalAmountCents = Math.round(product.price * 100);
    const salePrice = salePriceFor(product);
    let finalAmountCents = Math.round(salePrice * 100);

    let coupon = null;
    if (couponCode) {
      const result = await resolveCouponDiscount({ code: couponCode, product });
      if (result.error) return res.status(400).json({ message: result.error });
      coupon = result.coupon;
      finalAmountCents = Math.round((salePrice - result.discount) * 100);
    }
    finalAmountCents = Math.max(finalAmountCents, 0);
    if (finalAmountCents === 0) {
      return res.status(400).json({
        message: "This coupon covers the full price — please use a smaller discount for checkout",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Stripe auto-shows other enabled methods (Apple Pay, Google Pay, etc.)
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.title,
              description: product.shortDescription || undefined,
            },
            unit_amount: finalAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product._id.toString(),
        productTitle: product.title,
      },
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/order-cancelled?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Pre-create a pending order record so we can track it even before webhook fires
    await Order.create({
      product: product._id,
      productTitle: product.title,
      customerEmail,
      amount: finalAmountCents,
      originalAmount: originalAmountCents,
      discountAmount: originalAmountCents - finalAmountCents,
      couponCode: coupon?.code,
      couponId: coupon?._id,
      currency: product.currency,
      stripeSessionId: session.id,
      status: "pending",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Check order status by session id (used by success page to show confirmation)
export const getOrderBySession = async (req, res) => {
  const order = await Order.findOne({ stripeSessionId: req.params.sessionId });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({
    status: order.status,
    productTitle: order.productTitle,
    customerEmail: order.customerEmail,
  });
};

// @desc Mark a pending checkout as cancelled / abandoned.
// Called from the "order cancelled" page so the admin can later follow up
// with the customer (email + product + attempt time). Idempotent.
// @route POST /api/orders/cancel
// body: { sessionId }
export const markOrderCancelled = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (order && order.status === "pending") {
      order.status = "cancelled";
      order.cancelledAt = new Date();
      await order.save();
    }

    res.json({ message: "Checkout recorded as cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// This function is called from the Stripe webhook handler once payment is confirmed.
// Kept here so it can be reused/tested independently of the raw webhook route.
export const fulfillOrder = async (session) => {
  const order = await Order.findOne({ stripeSessionId: session.id });
  if (!order) return;
  if (order.status === "paid" || order.status === "email_sent") return; // idempotency guard

  order.status = "paid";
  order.stripePaymentIntentId = session.payment_intent;
  await order.save();

  // Count the coupon use only once the payment is actually confirmed
  if (order.couponId && !order.couponCounted) {
    await Coupon.updateOne({ _id: order.couponId }, { $inc: { usedCount: 1 } });
    order.couponCounted = true;
    await order.save();
  }

  const product = await Product.findById(order.product);
  if (!product?.digitalFile?.url) {
    order.status = "email_failed";
    await order.save();
    return;
  }

  const html = orderDeliveryTemplate({
    customerEmail: order.customerEmail,
    productTitle: order.productTitle,
    downloadUrl: buildDownloadUrl(product),
    amount: order.amount,
    originalAmount: order.originalAmount,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    currency: order.currency,
  });

  const result = await sendEmail({
    to: order.customerEmail,
    subject: `Your download: ${order.productTitle}`,
    html,
  });

  order.status = result.success ? "email_sent" : "email_failed";
  if (result.success) {
    order.deliveredAt = new Date();
    product.salesCount += 1;
    await product.save();
  }
  await order.save();
};

// ---------- ADMIN ----------

export const adminGetOrders = async (req, res) => {
  const { page, limit, skip } = getPagination(req, { limit: 10 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("product", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json(paginated(orders, total, page, limit));
};

// Abandoned / cancelled checkouts — who tried to pay for what and when,
// so the admin can approach them later. Sorted by most recent attempt.
export const adminGetCancelledOrders = async (req, res) => {
  const filter = { status: "cancelled" };
  const { page, limit, skip } = getPagination(req, { limit: 10 });
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("product", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json(paginated(orders, total, page, limit));
};

// Admin can manually resend the delivery email (e.g. if it bounced)
export const resendOrderEmail = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "pending") {
    return res.status(400).json({ message: "Order is not paid yet" });
  }

  const product = await Product.findById(order.product);
  if (!product?.digitalFile?.url) {
    return res.status(400).json({ message: "Product file missing" });
  }

  const html = orderDeliveryTemplate({
    customerEmail: order.customerEmail,
    productTitle: order.productTitle,
    downloadUrl: buildDownloadUrl(product),
    amount: order.amount,
    originalAmount: order.originalAmount,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    currency: order.currency,
  });

  const result = await sendEmail({
    to: order.customerEmail,
    subject: `Your download: ${order.productTitle}`,
    html,
  });

  order.status = result.success ? "email_sent" : "email_failed";
  await order.save();
  res.json({ message: result.success ? "Email resent" : "Failed to resend", order });
};
