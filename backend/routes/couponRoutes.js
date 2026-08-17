import express from "express";
import {
  validateCoupon,
  adminGetCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/validate", validateCoupon);

// Admin
router.get("/admin/all", protectAdmin, requireAccess("coupons"), adminGetCoupons);
router.post("/admin", protectAdmin, requireAccess("coupons", "create"), createCoupon);
router.put("/admin/:id", protectAdmin, requireAccess("coupons", "edit"), updateCoupon);
router.delete("/admin/:id", protectAdmin, requireAccess("coupons", "delete"), deleteCoupon);

export default router;