import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import { salePriceFor } from "../utils/pricing.js";

// Shared coupon validation used by BOTH the public /validate endpoint and the
// checkout flow. Returns { error } or { coupon, discount } where discount is the
// money amount off in main currency units (always computed server-side).
export const resolveCouponDiscount = async ({ code, product }) => {
  const coupon = await Coupon.findOne({ code: String(code || "").trim().toUpperCase() });
  if (!coupon) return { error: "Invalid coupon code" };
  if (!coupon.isActive) return { error: "This coupon is no longer active" };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { error: "This coupon has expired" };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { error: "This coupon has reached its usage limit" };
  }
  if (!coupon.appliesToAll) {
    const byProduct = coupon.products.some((id) => String(id) === String(product._id));
    const byCategory = (coupon.appliesToCategories || []).includes(product.category);
    if (!byProduct && !byCategory) {
      return { error: "This coupon does not apply to this product" };
    }
  }

  const salePrice = salePriceFor(product);
  if (coupon.minAmount > 0 && salePrice < coupon.minAmount) {
    return { error: `Coupon requires a minimum order of ${coupon.minAmount.toFixed(2)} ${product.currency.toUpperCase()}` };
  }

  let discount;
  if (coupon.type === "percent") {
    discount = (salePrice * coupon.value) / 100;
  } else {
    discount = Math.min(coupon.value, salePrice);
  }

  return { coupon, discount: Number(discount.toFixed(2)) };
};

// @desc Validate a coupon for a specific product (public)
// @route POST /api/coupons/validate
// body: { code, productId }
export const validateCoupon = async (req, res) => {
  try {
    const { code, productId } = req.body;
    if (!code || !productId) {
      return res.status(400).json({ message: "Coupon code and product are required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const result = await resolveCouponDiscount({ code, product });
    if (result.error) return res.status(400).json({ message: result.error });

    const salePrice = salePriceFor(product);
    res.json({
      valid: true,
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
      discount: result.discount,
      originalPrice: salePrice,
      finalPrice: Number((salePrice - result.discount).toFixed(2)),
      currency: product.currency,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------

export const adminGetCoupons = async (req, res) => {
  const coupons = await Coupon.find().populate("products", "title slug").sort({ createdAt: -1 });
  res.json(coupons);
};

const normalizeInput = (body) => {
  const { type, value, appliesToAll, products, appliesToCategories, minAmount, maxUses, expiresAt, isActive } = body;
  return {
    type,
    value: value === undefined || value === "" ? undefined : Number(value),
    appliesToAll: appliesToAll === undefined ? undefined : Boolean(appliesToAll),
    products: Array.isArray(products) ? products : [],
    appliesToCategories: Array.isArray(appliesToCategories) ? appliesToCategories : [],
    minAmount: minAmount === undefined || minAmount === "" ? 0 : Number(minAmount),
    maxUses: maxUses === undefined || maxUses === "" || maxUses === null ? null : Number(maxUses),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isActive: isActive === undefined ? true : Boolean(isActive),
  };
};

export const createCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const data = normalizeInput(req.body);
    if (data.value === undefined || data.value <= 0) {
      return res.status(400).json({ message: "Discount value must be greater than 0" });
    }
    if (data.type === "percent" && data.value > 100) {
      return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
    }
    if (!data.appliesToAll && data.products.length === 0 && data.appliesToCategories.length === 0) {
      return res.status(400).json({ message: "Select at least one product or category, or apply to all products" });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await Coupon.create({
      code,
      type: data.type || "percent",
      value: data.value,
      appliesToAll: Boolean(data.appliesToAll),
      products: data.appliesToAll ? [] : data.products,
      appliesToCategories: data.appliesToAll ? [] : data.appliesToCategories,
      minAmount: data.minAmount,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt,
      isActive: Boolean(data.isActive),
    });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const code = String(req.body.code || "").trim().toUpperCase();
    if (code) {
      const dup = await Coupon.findOne({ code, _id: { $ne: coupon._id } });
      if (dup) return res.status(400).json({ message: "Coupon code already exists" });
      coupon.code = code;
    }

    const data = normalizeInput(req.body);
    if (data.value !== undefined) {
      if (data.value <= 0) return res.status(400).json({ message: "Discount value must be greater than 0" });
      if (data.type === "percent" && data.value > 100) {
        return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
      }
      coupon.value = data.value;
    }
    if (data.type !== undefined) coupon.type = data.type;
    if (data.appliesToAll !== undefined) coupon.appliesToAll = Boolean(data.appliesToAll);
    if (req.body.products !== undefined || req.body.appliesToCategories !== undefined || data.appliesToAll !== undefined) {
      coupon.products = coupon.appliesToAll ? [] : data.products;
      coupon.appliesToCategories = coupon.appliesToAll ? [] : data.appliesToCategories;
    }
    if (req.body.minAmount !== undefined) coupon.minAmount = data.minAmount;
    if (req.body.maxUses !== undefined) coupon.maxUses = data.maxUses;
    if (req.body.expiresAt !== undefined) coupon.expiresAt = data.expiresAt;
    if (req.body.isActive !== undefined) coupon.isActive = Boolean(data.isActive);

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await coupon.deleteOne();
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};