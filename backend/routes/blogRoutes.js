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
import { protectAdmin, requireAccess } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/categories", getBlogCategories);
router.get("/:slug", getBlogBySlug);

router.get("/admin/all", protectAdmin, requireAccess("blogs"), adminGetBlogs);
router.get("/admin/:id", protectAdmin, requireAccess("blogs"), adminGetBlogById);
router.post("/admin", protectAdmin, requireAccess("blogs", "create"), uploadImage.single("coverImage"), createBlog);
router.put("/admin/:id", protectAdmin, requireAccess("blogs", "edit"), uploadImage.single("coverImage"), updateBlog);
router.delete("/admin/:id", protectAdmin, requireAccess("blogs", "delete"), deleteBlog);

// Used by the rich text editor toolbar to upload an image and insert it inline into content
router.post("/admin/upload-image", protectAdmin, requireAccess("blogs", "edit"), uploadImage.single("image"), uploadContentImage);

export default router;
