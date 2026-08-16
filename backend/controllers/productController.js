import Product from "../models/Product.js";
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";
import https from "https";
import { sanitizeFileName } from "../utils/downloadUrl.js";

// The digital product file must always be a PDF (delivery is PDF-only)
const isPdf = (file) => {
  if (!file) return false;
  return /\.pdf$/i.test(file.originalname || "") || file.mimetype === "application/pdf";
};

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

// @desc Stream the digital file for download — always served as `<title>.pdf`.
// Used by the email download link. Cloudinary's fl_attachment can't name raw
// files with a .pdf extension, so we proxy the file with the right headers.
export const downloadProductFile = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const fileUrl = product?.digitalFile?.url;
    if (!fileUrl) return res.status(404).json({ message: "File not found" });

    const filename = `${sanitizeFileName(product.title)}.pdf`;

    https
      .get(fileUrl, (remote) => {
        if (remote.statusCode !== 200) {
          res.status(502).json({ message: "Failed to fetch file from storage" });
          remote.resume();
          return;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Cache-Control", "no-store");
        remote.pipe(res);
      })
      .on("error", (err) => {
        if (!res.headersSent) {
          res.status(500).json({ message: err.message });
        } else {
          res.end();
        }
      });
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

// @desc Top 5 products from the same category, ranked by average approved
// rating (ties broken by review count, then sales). Excludes the current product.
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const candidates = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).select("-digitalFile");

    if (!candidates.length) return res.json([]);

    const ratings = await Review.aggregate([
      {
        $match: {
          status: "approved",
          product: { $in: candidates.map((p) => p._id) },
        },
      },
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const ratingMap = new Map(ratings.map((r) => [String(r._id), r]));

    const top = candidates
      .map((p) => ({
        p,
        avg: ratingMap.get(String(p._id))?.avg || 0,
        count: ratingMap.get(String(p._id))?.count || 0,
      }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count || b.p.salesCount - a.p.salesCount)
      .slice(0, 5)
      .map(({ p }) => p);

    res.json(top);
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
    const pdf = req.files?.digitalFile?.[0];
    if (pdf && !isPdf(pdf)) {
      await cloudinary.uploader.destroy(pdf.filename, { resource_type: "raw" }).catch(() => {});
      return res.status(400).json({ message: "The digital product file must be a PDF (.pdf)" });
    }

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
      const pdf = req.files.digitalFile[0];
      if (!isPdf(pdf)) {
        await cloudinary.uploader.destroy(pdf.filename, { resource_type: "raw" }).catch(() => {});
        return res.status(400).json({ message: "The digital product file must be a PDF (.pdf)" });
      }
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
