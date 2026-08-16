import express from "express";
import {
  validateCoupon,
  adminGetCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/validate", validateCoupon);

// Admin
router.get("/admin/all", protectAdmin, adminGetCoupons);
router.post("/admin", protectAdmin, createCoupon);
router.put("/admin/:id", protectAdmin, updateCoupon);
router.delete("/admin/:id", protectAdmin, deleteCoupon);

export default router;