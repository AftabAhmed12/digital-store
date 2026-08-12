import express from "express";
import {
  startChat,
  chatMessage,
  adminGetChatLeads,
} from "../controllers/chatController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/start", startChat);
router.post("/message", chatMessage);

router.get("/admin/leads", protectAdmin, adminGetChatLeads);

export default router;