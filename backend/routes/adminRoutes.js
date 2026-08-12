import express from "express";
import { loginAdmin, getAdminProfile, registerAdmin } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin); // one-time use, protect/remove after first admin created
router.get("/profile", protectAdmin, getAdminProfile);

export default router;
