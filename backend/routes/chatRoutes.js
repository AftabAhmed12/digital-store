import express from "express";
import {
  startChat,
  chatMessage,
  adminGetChatLeads,
} from "../controllers/chatController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/start", startChat);
router.post("/message", chatMessage);

router.get("/admin/leads", protectAdmin, requireAccess("leads"), adminGetChatLeads);

export default router;