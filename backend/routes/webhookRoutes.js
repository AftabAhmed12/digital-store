import express from "express";
import { stripeWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// NOTE: raw body parsing for this route is configured in server.js BEFORE express.json()
router.post("/", stripeWebhook);

export default router;
