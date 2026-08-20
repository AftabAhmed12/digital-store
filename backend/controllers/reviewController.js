import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { getPagination, paginated } from "../utils/paginate.js";

// @desc Submit a public review (no login required, always pending approval)
export const createReview = async (req, res) => {
  try {
    const { name, email, rating, title, comment } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: "Please enter your name" });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (!comment || !comment.trim()) return res.status(400).json({ message: "Please write a review" });

    const product = await Product.findById(req.body.product);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.create({
      product: product._id,
      productTitle: product.title,
      category: product.category,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: Math.min(5, Math.max(1, Math.round((Number(rating) || 5) * 2) / 2)),
      title: (title || "").trim(),
      comment: comment.trim(),
      status: "pending",
    });

    res.status(201).json({
      message: "Review submitted! It will appear once approved by an admin.",
      review,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Get approved reviews for a product (public) with average rating
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: "approved",
    }).sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.json({ reviews, averageRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------

// @desc Get all reviews - supports ?category= & ?search= & ?status=
export const adminGetReviews = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { comment: rx }, { productTitle: rx }, { title: rx }];
    }
    const { page, limit, skip } = getPagination(req, { limit: 10 });
    // Scope filter without the status filter — used to count how many pending
    // reviews exist in the current category/search scope (for the Approve-all button).
    const scopeFilter = { ...filter };
    delete scopeFilter.status;
    const [reviews, total, pendingCount] = await Promise.all([
      Review.find(filter)
        .populate("product", "slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
      Review.countDocuments({ ...scopeFilter, status: "pending" }),
    ]);
    res.json(paginated(reviews, total, page, limit, { pendingCount }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Approve / reject / mark pending a review
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.status === "rejected" && status === "approved") {
      return res.status(400).json({ message: "Rejected reviews cannot be approved" });
    }
    review.status = status;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Approve every review matching the current filters (or all non-approved
// reviews when no filter is set). Same filter logic as adminGetReviews.
// @route PUT /api/reviews/admin/approve-all
export const bulkApproveReviews = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    // Only pending reviews are ever approved — approved/rejected are never re-approved.
    filter.status = !status || status === "pending" ? "pending" : "__none__";
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { comment: rx }, { productTitle: rx }, { title: rx }];
    }

    const result = await Review.updateMany(filter, { $set: { status: "approved" } });
    res.json({ message: `${result.modifiedCount} review${result.modifiedCount === 1 ? "" : "s"} approved`, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};