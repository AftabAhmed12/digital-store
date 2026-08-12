import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// @desc Get all active products (public) - supports ?category= & ?search=
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter)
      .select("-digitalFile")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single product by slug (public - no file url exposed)
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).select(
      "-digitalFile"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------

export const adminGetProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, shortDescription, price, category, currency } = req.body;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const images = (req.files?.images || []).map((f) => ({
      url: f.path,
      publicId: f.filename,
    }));

    const product = new Product({
      title,
      slug,
      description,
      shortDescription,
      price,
      currency: currency || "usd",
      category,
      images,
      digitalFile: req.files?.digitalFile?.[0]
        ? {
            url: req.files.digitalFile[0].path,
            publicId: req.files.digitalFile[0].filename,
            fileName: req.files.digitalFile[0].originalname,
          }
        : undefined,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const fields = ["title", "description", "shortDescription", "price", "category", "currency", "isActive", "isFeatured"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    // removedImageIds: JSON-stringified array of publicIds to remove, sent from the admin form
    if (req.body.removedImageIds) {
      const removedIds = JSON.parse(req.body.removedImageIds);
      const toRemove = product.images.filter((img) => removedIds.includes(img.publicId));
      await Promise.all(
        toRemove.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
      );
      product.images = product.images.filter((img) => !removedIds.includes(img.publicId));
    }

    // Newly uploaded images are appended to whatever remains
    const newImages = (req.files?.images || []).map((f) => ({
      url: f.path,
      publicId: f.filename,
    }));
    if (newImages.length) {
      product.images = [...product.images, ...newImages];
    }

    if (req.files?.digitalFile?.[0]) {
      if (product.digitalFile?.publicId) {
        await cloudinary.uploader.destroy(product.digitalFile.publicId, { resource_type: "raw" }).catch(() => {});
      }
      product.digitalFile = {
        url: req.files.digitalFile[0].path,
        publicId: req.files.digitalFile[0].filename,
        fileName: req.files.digitalFile[0].originalname,
      };
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Promise.all(
      (product.images || []).map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
    );
    if (product.digitalFile?.publicId) {
      await cloudinary.uploader.destroy(product.digitalFile.publicId, { resource_type: "raw" }).catch(() => {});
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
