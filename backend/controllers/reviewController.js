import Review from "../models/Review.js";
import Product from "../models/Product.js";

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
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
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
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
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