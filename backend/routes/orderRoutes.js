import express from "express";
import {
  createCheckoutSession,
  getOrderBySession,
  adminGetOrders,
  resendOrderEmail,
} from "../controllers/orderController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/checkout", createCheckoutSession);
router.get("/session/:sessionId", getOrderBySession);

router.get("/admin/all", protectAdmin, adminGetOrders);
router.post("/admin/:id/resend", protectAdmin, resendOrderEmail);

export default router;
