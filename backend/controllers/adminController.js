import Admin from "../models/Admin.js";
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
