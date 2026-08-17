import express from "express";
import {
  createCheckoutSession,
  getOrderBySession,
  markOrderCancelled,
  adminGetOrders,
  adminGetCancelledOrders,
  resendOrderEmail,
} from "../controllers/orderController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/checkout", createCheckoutSession);
router.post("/cancel", markOrderCancelled);
router.get("/session/:sessionId", getOrderBySession);

router.get("/admin/all", protectAdmin, requireAccess("orders"), adminGetOrders);
router.get("/admin/cancelled", protectAdmin, requireAccess("orders"), adminGetCancelledOrders);
router.post("/admin/:id/resend", protectAdmin, requireAccess("orders", "edit"), resendOrderEmail);

export default router;
