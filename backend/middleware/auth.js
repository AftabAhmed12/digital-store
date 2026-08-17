import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.status(401).json({ message: "Not authorized, admin not found" });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

// Module-level access check. "view" is granted when the admin holds any action
// (create/edit/delete/view) on that module — so a module is either visible or not.
export const hasAdminAccess = (admin, module, action = "view") => {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  const perms = admin.permissions?.[module];
  if (!perms) return false;
  if (action === "view") {
    return Boolean(perms.view || perms.create || perms.edit || perms.delete);
  }
  return Boolean(perms[action]);
};

// Route guard — must run AFTER protectAdmin so req.admin is populated.
export const requireAccess = (module, action = "view") => (req, res, next) => {
  if (!hasAdminAccess(req.admin, module, action)) {
    return res.status(403).json({ message: "You don't have access to this module" });
  }
  next();
};

// Admin management is reserved for super admins only (created via the register API).
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin?.isSuperAdmin) {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};
