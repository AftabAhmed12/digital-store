import Admin from "../models/Admin.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";
import generateToken from "../utils/generateToken.js";

// @desc Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc Get current logged in admin
export const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};

// @desc Dashboard stats — aggregated server-side so the admin never downloads
// the entire collection just to render a few numbers and the latest orders.
export const getAdminStats = async (req, res) => {
  try {
    const [totalOrders, paidOrders, revenueAgg, totalProducts, totalBlogs, recentOrders] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ["paid", "email_sent"] } }),
        Order.aggregate([
          { $match: { status: { $in: ["paid", "email_sent"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Product.countDocuments(),
        Blog.countDocuments(),
        Order.find()
          .populate("product", "title slug")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    res.json({
      totalOrders,
      paidOrders,
      revenue: (revenueAgg[0]?.total || 0) / 100,
      totalProducts,
      totalBlogs,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc One-time setup route to create the first admin account.
// Protect/remove this in production after first use.
export const registerAdmin = async (req, res) => {
  const { name, email, password, setupKey } = req.body;

  if (setupKey !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: "Invalid setup key" });
  }

  const exists = await Admin.findOne({ email: email?.toLowerCase() });
  if (exists) return res.status(400).json({ message: "Admin already exists" });

  const admin = await Admin.create({ name, email: email.toLowerCase(), password });
  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id),
  });
};
