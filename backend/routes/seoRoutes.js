import express from "express";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";

const router = express.Router();

// Base URL for absolute sitemap locations (set CLIENT_URL to the live domain).
const SITE_URL = (process.env.SITE_URL || process.env.CLIENT_URL || "").replace(/\/$/, "");

const staticPaths = [
  { path: "/", priority: "1.0" },
  { path: "/products", priority: "0.9" },
  { path: "/blog", priority: "0.8" },
  { path: "/write-for-us", priority: "0.7" },
  { path: "/contact", priority: "0.6" },
];

const loc = (url, lastmod, priority) =>
  `  <url>\n` +
  (SITE_URL ? `    <loc>${SITE_URL}${url}</loc>\n` : "") +
  (lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n` : "") +
  `    <changefreq>weekly</changefreq>\n` +
  `    <priority>${priority}</priority>\n` +
  `  </url>`;

// @desc Generate the XML sitemap — only public, active/published content is listed.
// @route GET /sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    const [products, blogs] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Blog.find({ isPublished: true }).select("slug updatedAt").lean(),
    ]);

    const urls = [
      ...staticPaths.map((p) => loc(p.path, null, p.priority)),
      ...products.map((p) => loc(`/products/${p.slug}`, p.updatedAt, "0.8")),
      ...blogs.map((b) => loc(`/blog/${b.slug}`, b.updatedAt, "0.7")),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
      "\n"
    )}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(sitemap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc robots.txt — blocks private admin/API paths from crawlers.
// @route GET /robots.txt
router.get("/robots.txt", (req, res) => {
  const lines = [
    "User-agent: *",
    "Disallow: /admin",
    "Disallow: /api",
    SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml` : "",
    "",
  ].filter(Boolean);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(lines.join("\n"));
});

export default router;