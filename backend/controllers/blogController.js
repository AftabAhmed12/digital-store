import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";
import { getPagination, paginated } from "../utils/paginate.js";

export const getBlogs = async (req, res) => {
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  const { page, limit, skip } = getPagination(req, { limit: 9 });
  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter),
  ]);
  res.json(paginated(blogs, total, page, limit));
};

export const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json(blog);
};

export const getBlogCategories = async (req, res) => {
  const categories = await Blog.distinct("category", { isPublished: true });
  res.json(categories);
};

// ---------- ADMIN ----------

export const adminGetBlogs = async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { category: rx }];
  }
  const { page, limit, skip } = getPagination(req, { limit: 10, maxLimit: 10000 });
  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter),
  ]);
  res.json(paginated(blogs, total, page, limit));
};

export const adminGetBlogById = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json(blog);
};

// @desc Upload a single image and return its URL, used by the rich text editor
// to insert images directly inline into blog content (not a gallery field).
export const uploadContentImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.json({ url: req.file.path });
};

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, author, isPublished } = req.body;
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      isPublished: isPublished !== undefined ? isPublished : true,
      coverImage: req.file ? { url: req.file.path, publicId: req.file.filename } : undefined,
    });

    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const fields = ["title", "excerpt", "content", "category", "author", "isPublished"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) blog[f] = req.body[f];
    });

    if (req.file) {
      if (blog.coverImage?.publicId) {
        await cloudinary.uploader.destroy(blog.coverImage.publicId).catch(() => {});
      }
      blog.coverImage = { url: req.file.path, publicId: req.file.filename };
    }

    const updated = await blog.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  if (blog.coverImage?.publicId) {
    await cloudinary.uploader.destroy(blog.coverImage.publicId).catch(() => {});
  }
  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
};
