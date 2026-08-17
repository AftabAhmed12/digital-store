import express from "express";
import { submitContactForm, adminGetContacts, markContactRead } from "../controllers/contactController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";

const router = express.Router();

router.post("/", submitContactForm);
router.get("/admin/all", protectAdmin, requireAccess("messages"), adminGetContacts);
router.put("/admin/:id/read", protectAdmin, requireAccess("messages", "edit"), markContactRead);

export default router;
