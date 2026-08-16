import express from "express";
import {
  getActiveCampaigns,
  adminGetCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaignController.js";
import { protectAdmin } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

// Public — poster banner for the storefront
router.get("/active", getActiveCampaigns);

// Admin
router.get("/admin/all", protectAdmin, adminGetCampaigns);
router.post("/admin", protectAdmin, uploadImage.single("posterImage"), createCampaign);
router.put("/admin/:id", protectAdmin, uploadImage.single("posterImage"), updateCampaign);
router.delete("/admin/:id", protectAdmin, deleteCampaign);

export default router;