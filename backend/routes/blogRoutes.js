import express from "express";
import {
  getBlogs,
  getBlogBySlug,
  getBlogCategories,
  adminGetBlogs,
  adminGetBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadContentImage,
} from "../controllers/blogController.js";
import { protectAdmin } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/categories", getBlogCategories);
router.get("/:slug", getBlogBySlug);

router.get("/admin/all", protectAdmin, adminGetBlogs);
router.get("/admin/:id", protectAdmin, adminGetBlogById);
router.post("/admin", protectAdmin, uploadImage.single("coverImage"), createBlog);
router.put("/admin/:id", protectAdmin, uploadImage.single("coverImage"), updateBlog);
router.delete("/admin/:id", protectAdmin, deleteBlog);

// Used by the rich text editor toolbar to upload an image and insert it inline into content
router.post("/admin/upload-image", protectAdmin, uploadImage.single("image"), uploadContentImage);

export default router;
