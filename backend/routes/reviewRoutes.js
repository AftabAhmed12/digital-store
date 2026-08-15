import express from "express";
import {
  createReview,
  getApprovedReviews,
  adminGetReviews,
  updateReviewStatus,
  deleteReview,
} from "../controllers/reviewController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/", createReview);
router.get("/product/:productId", getApprovedReviews);

// Admin
router.get("/admin/all", protectAdmin, adminGetReviews);
router.put("/admin/:id", protectAdmin, updateReviewStatus);
router.delete("/admin/:id", protectAdmin, deleteReview);

export default router;