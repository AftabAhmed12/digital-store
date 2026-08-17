import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginAdmin,
  getAdminProfile,
  registerAdmin,
  getAdminStats,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";
import { protectAdmin, requireAccess, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Slow login/register attempts down — brute-force protection
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.post("/login", authLimiter, loginAdmin);
router.post("/register", authLimiter, registerAdmin); // one-time setup: creates the SUPER ADMIN
router.get("/profile", protectAdmin, getAdminProfile);
router.get("/stats", protectAdmin, requireAccess("dashboard"), getAdminStats);

// Admin management — super admin only. These endpoints are fully protected:
// regular admins get 403 even if they call the route directly.
router.get("/manage", protectAdmin, requireSuperAdmin, getAllAdmins);
router.post("/manage", protectAdmin, requireSuperAdmin, createAdmin);
router.put("/manage/:id", protectAdmin, requireSuperAdmin, updateAdmin);
router.delete("/manage/:id", protectAdmin, requireSuperAdmin, deleteAdmin);

export default router;