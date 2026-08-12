import express from "express";
import { submitContactForm, adminGetContacts, markContactRead } from "../controllers/contactController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", submitContactForm);
router.get("/admin/all", protectAdmin, adminGetContacts);
router.put("/admin/:id/read", protectAdmin, markContactRead);

export default router;
