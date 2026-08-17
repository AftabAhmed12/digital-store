import express from "express";
import {
  createReview,
  getApprovedReviews,
  adminGetReviews,
  updateReviewStatus,
  deleteReview,
} from "../controllers/reviewController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/", createReview);
router.get("/product/:productId", getApprovedReviews);

// Admin
router.get("/admin/all", protectAdmin, requireAccess("reviews"), adminGetReviews);
router.put("/admin/:id", protectAdmin, requireAccess("reviews", "edit"), updateReviewStatus);
router.delete("/admin/:id", protectAdmin, requireAccess("reviews", "delete"), deleteReview);

export default router;