import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Security headers (CSP off: the frontend uses an inline theme script + inline styles)
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// gzip/brotli for every response (JSON payloads shrink ~70%)
app.use(compression());

// Rate limiting — blocks form/chat/checkout spam per IP
const chatLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

app.use("/api/chat", chatLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/orders", checkoutLimiter);

// Browser caching for public storefront data (never applied to /admin routes)
const cachePublic = (seconds) => (req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/admin")) return next();
  res.set("Cache-Control", `public, max-age=${seconds}`);
  next();
};

// Stripe webhook needs the RAW body, so it must be mounted BEFORE express.json()
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());

app.use("/api/products", cachePublic(300), productRoutes);
app.use("/api/blogs", cachePublic(300), blogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

// SEO files served at the domain root (sitemap.xml / robots.txt)
app.use("/", seoRoutes);

app.get("/", (req, res) => res.send("Digital Store API is running"));

// Global error handler — real error logged, generic message sent to clients in production
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({ message: isProd ? "Server error" : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
