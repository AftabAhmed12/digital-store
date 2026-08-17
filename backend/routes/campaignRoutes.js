import express from "express";
import {
  getActiveCampaigns,
  adminGetCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

// Public — poster banner for the storefront
router.get("/active", getActiveCampaigns);

// Admin
router.get("/admin/all", protectAdmin, requireAccess("campaigns"), adminGetCampaigns);
router.post("/admin", protectAdmin, requireAccess("campaigns", "create"), uploadImage.single("posterImage"), createCampaign);
router.put("/admin/:id", protectAdmin, requireAccess("campaigns", "edit"), uploadImage.single("posterImage"), updateCampaign);
router.delete("/admin/:id", protectAdmin, requireAccess("campaigns", "delete"), deleteCampaign);

export default router;