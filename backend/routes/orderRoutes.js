import express from "express";
import {
  createCheckoutSession,
  getOrderBySession,
  markOrderCancelled,
  adminGetOrders,
  adminGetCancelledOrders,
  resendOrderEmail,
} from "../controllers/orderController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/checkout", createCheckoutSession);
router.post("/cancel", markOrderCancelled);
router.get("/session/:sessionId", getOrderBySession);

router.get("/admin/all", protectAdmin, adminGetOrders);
router.get("/admin/cancelled", protectAdmin, adminGetCancelledOrders);
router.post("/admin/:id/resend", protectAdmin, resendOrderEmail);

export default router;
