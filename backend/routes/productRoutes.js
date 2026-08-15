import express from "express";
import {
  getProducts,
  getProductBySlug,
  getCategories,
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductFile,
} from "../controllers/productController.js";
import { protectAdmin } from "../middleware/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Combined upload for gallery images (public, multiple) + digital file (private/raw)
const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "digitalFile") {
      return { folder: "digital-store/products", resource_type: "raw" };
    }
    return { folder: "digital-store/images", allowed_formats: ["jpg", "jpeg", "png", "webp"] };
  },
});

// Up to 6 gallery images per product
const uploadProductFiles = multer({ storage: combinedStorage }).fields([
  { name: "images", maxCount: 6 },
  { name: "digitalFile", maxCount: 1 },
]);

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id/download", downloadProductFile);
router.get("/:slug", getProductBySlug);

// Admin
router.get("/admin/all", protectAdmin, adminGetProducts);
router.post("/admin", protectAdmin, uploadProductFiles, createProduct);
router.put("/admin/:id", protectAdmin, uploadProductFiles, updateProduct);
router.delete("/admin/:id", protectAdmin, deleteProduct);

export default router;
