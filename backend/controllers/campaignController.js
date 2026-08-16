import Campaign from "../models/Campaign.js";
import Coupon from "../models/Coupon.js";
import cloudinary from "../config/cloudinary.js";

// Helper: toBool accepts real booleans AND the "true"/"false" strings that
// multipart/form-data sends. Using Boolean("false") would return true — a bug.
const toBool = (v) => v === true || v === "true" || v === 1;

// Parse an array that may arrive as a JSON string (multipart) or a real array (JSON body)
const parseArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// @desc Get currently-live campaigns for the storefront banner (public)
// @route GET /api/campaigns/active
export const getActiveCampaigns = async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({ isActive: true })
      .populate("coupon", "code isActive expiresAt")
      .lean();

    const active = campaigns.filter(
      (c) => c.coupon && c.coupon.isActive && !(c.coupon.expiresAt && new Date(c.coupon.expiresAt) < now)
    );

    res.json(
      active.map((c) => ({
        _id: c._id,
        title: c.title,
        posterImage: c.posterImage,
        couponCode: c.coupon.code,
        endsAt: c.coupon.expiresAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------

export const adminGetCampaigns = async (req, res) => {
  const campaigns = await Campaign.find()
    .populate("coupon", "code type value appliesToAll products appliesToCategories expiresAt usedCount isActive")
    .sort({ createdAt: -1 });
  res.json(campaigns);
};

export const createCampaign = async (req, res) => {
  try {
    const { title, couponCode, discountType, discountValue, endsAt, isActive } = req.body;
    if (!title || !couponCode) {
      return res.status(400).json({ message: "Campaign title and coupon code are required" });
    }
    if (!req.file) return res.status(400).json({ message: "Campaign poster is required" });
    if (discountValue === undefined || discountValue === "" || Number(discountValue) <= 0) {
      return res.status(400).json({ message: "Discount value must be greater than 0" });
    }

    const code = String(couponCode).trim().toUpperCase();
    const appliesToAll = toBool(req.body.appliesToAll);
    const products = parseArray(req.body.products);
    const categories = parseArray(req.body.categories);
    if (!appliesToAll && products.length === 0 && categories.length === 0) {
      return res.status(400).json({ message: "Select at least one product or category, or apply to all products" });
    }
    if (discountType === "percent" && Number(discountValue) > 100) {
      return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
    }
    const dup = await Coupon.findOne({ code });
    if (dup) return res.status(400).json({ message: `Coupon code ${code} already exists` });

    const isActiveFlag = isActive === undefined ? true : toBool(isActive);

    const coupon = await Coupon.create({
      code,
      type: discountType || "percent",
      value: Number(discountValue),
      appliesToAll,
      products: appliesToAll ? [] : products,
      appliesToCategories: appliesToAll ? [] : categories,
      minAmount: 0,
      maxUses: null,
      expiresAt: endsAt ? new Date(endsAt) : null,
      isActive: isActiveFlag,
    });

    const campaign = await Campaign.create({
      title,
      posterImage: { url: req.file.path, publicId: req.file.filename },
      coupon: coupon._id,
      isActive: isActiveFlag,
    });

    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const coupon = await Coupon.findById(campaign.coupon);
    if (!coupon) return res.status(400).json({ message: "Linked coupon not found" });

    if (req.body.title !== undefined && String(req.body.title).trim()) campaign.title = req.body.title;
    if (req.body.isActive !== undefined) campaign.isActive = toBool(req.body.isActive);

    if (req.body.couponCode !== undefined && String(req.body.couponCode).trim()) {
      const code = String(req.body.couponCode).trim().toUpperCase();
      const dup = await Coupon.findOne({ code, _id: { $ne: coupon._id } });
      if (dup) return res.status(400).json({ message: `Coupon code ${code} already exists` });
      coupon.code = code;
    }
    if (req.body.discountType !== undefined) coupon.type = req.body.discountType;
    if (req.body.discountValue !== undefined) {
      if (Number(req.body.discountValue) <= 0) return res.status(400).json({ message: "Discount value must be greater than 0" });
      if (coupon.type === "percent" && Number(req.body.discountValue) > 100) {
        return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
      }
      coupon.value = Number(req.body.discountValue);
    }
    if (req.body.appliesToAll !== undefined) coupon.appliesToAll = toBool(req.body.appliesToAll);
    if (req.body.products !== undefined || req.body.categories !== undefined || req.body.appliesToAll !== undefined) {
      coupon.products = coupon.appliesToAll ? [] : parseArray(req.body.products);
      coupon.appliesToCategories = coupon.appliesToAll ? [] : parseArray(req.body.categories);
    }
    if (req.body.endsAt !== undefined) coupon.expiresAt = req.body.endsAt ? new Date(req.body.endsAt) : null;
    if (req.body.isActive !== undefined) coupon.isActive = toBool(req.body.isActive);

    if (req.file) {
      if (campaign.posterImage?.publicId) {
        await cloudinary.uploader.destroy(campaign.posterImage.publicId).catch(() => {});
      }
      campaign.posterImage = { url: req.file.path, publicId: req.file.filename };
    }

    await coupon.save();
    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (campaign.posterImage?.publicId) {
      await cloudinary.uploader.destroy(campaign.posterImage.publicId).catch(() => {});
    }
    if (campaign.coupon) {
      await Coupon.findByIdAndDelete(campaign.coupon).catch(() => {});
    }
    await campaign.deleteOne();
    res.json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};