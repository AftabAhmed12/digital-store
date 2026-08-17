import express from "express";
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getRelatedProducts,
  adminGetProducts,
  adminGetProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductFile,
} from "../controllers/productController.js";
import { protectAdmin, requireAccess } from "../middleware/auth.js";
import multer from "multer";
import cloudinaryStorage from "../middleware/cloudinaryStorage.js";

// Combined upload for gallery images (public, multiple) + digital file (private/raw)
const combinedStorage = cloudinaryStorage((req, file) => {
  if (file.fieldname === "digitalFile") {
    return { folder: "digital-store/products", resource_type: "raw" };
  }
  return { folder: "digital-store/images", allowed_formats: ["jpg", "jpeg", "png", "webp"] };
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
router.get("/:slug/related", getRelatedProducts);
router.get("/:id/download", downloadProductFile);
router.get("/:slug", getProductBySlug);

// Admin
router.get("/admin/all", protectAdmin, requireAccess("products"), adminGetProducts);
router.get("/admin/:id", protectAdmin, requireAccess("products"), adminGetProductById);
router.post("/admin", protectAdmin, requireAccess("products", "create"), uploadProductFiles, createProduct);
router.put("/admin/:id", protectAdmin, requireAccess("products", "edit"), uploadProductFiles, updateProduct);
router.delete("/admin/:id", protectAdmin, requireAccess("products", "delete"), deleteProduct);

export default router;
