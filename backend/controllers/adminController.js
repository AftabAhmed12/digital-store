import Admin from "../models/Admin.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";
import generateToken from "../utils/generateToken.js";

// Default permissions for admins created from the admin UI: products & blogs
// can be added and edited (no delete), everything else is off until granted.
// The dashboard (stats) is super-admin only and is never granted here.
const defaultPermissions = () => ({
  products: { create: true, edit: true },
  blogs: { create: true, edit: true },
});

const stripPassword = (admin) => {
  const { password, ...safe } = admin.toObject();
  return safe;
};

// @desc Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() });

  // Legacy account created before permissions existed (no permissions field in the
  // stored document) → upgrade to a super admin so existing owners keep full control.
  // Must check the RAW document: mongoose fills the schema default {} into
  // admin.permissions on load, so the hydrated doc can't tell us what was stored.
  if (admin) {
    const raw = await Admin.collection.findOne({ _id: admin._id });
    if (raw && raw.permissions === undefined && !raw.isSuperAdmin) {
      await Admin.updateOne({ _id: admin._id }, { $set: { isSuperAdmin: true, permissions: {} } });
      admin.isSuperAdmin = true;
      admin.permissions = {};
    }
  }

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
      permissions: admin.permissions,
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
// Admins created here are SUPER ADMINs — the only accounts that can manage
// other admins and access every module.
export const registerAdmin = async (req, res) => {
  const { name, email, password, setupKey } = req.body;

  if (setupKey !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: "Invalid setup key" });
  }

  const exists = await Admin.findOne({ email: email?.toLowerCase() });
  if (exists) return res.status(400).json({ message: "Admin already exists" });

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password,
    isSuperAdmin: true, // register always creates a SUPER ADMIN (full access)
    permissions: {},
  });
  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    isSuperAdmin: true,
    permissions: {},
    token: generateToken(admin._id),
  });
};

// @desc List all admins — super admin only
export const getAllAdmins = async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json(admins.map(stripPassword));
};

// @desc Create a new admin with chosen permissions/role — super admin only
export const createAdmin = async (req, res) => {
  const { name, email, password, permissions, isSuperAdmin } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: "Admin already exists" });

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password,
    isSuperAdmin: Boolean(isSuperAdmin),
    permissions: isSuperAdmin ? {} : permissions || defaultPermissions(),
  });
  res.status(201).json(stripPassword(admin));
};

// @desc Update an admin's details/permissions — super admin only
export const updateAdmin = async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  if (admin.isSuperAdmin) {
    return res.status(400).json({ message: "Super admin accounts cannot be edited here" });
  }
  if (req.body.name) admin.name = req.body.name;
  if (req.body.email) admin.email = req.body.email.toLowerCase();
  if (req.body.password) admin.password = req.body.password;
  if (typeof req.body.isSuperAdmin === "boolean") admin.isSuperAdmin = req.body.isSuperAdmin;
  if (req.body.permissions) admin.permissions = req.body.permissions;
  await admin.save();
  res.json(stripPassword(admin));
};

// @desc Delete an admin — super admin only, and never self / super admins
export const deleteAdmin = async (req, res) => {
  if (req.params.id === req.admin._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  if (admin.isSuperAdmin) {
    return res.status(400).json({ message: "Super admin accounts cannot be deleted" });
  }
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ message: "Admin deleted" });
};
