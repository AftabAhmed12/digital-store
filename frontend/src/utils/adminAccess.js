// Reads the current admin's role/permissions from localStorage (set on login).
export const getAdminInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("adminInfo") || "null");
  } catch {
    return null;
  }
};

// Module access check mirroring the backend's hasAdminAccess logic.
// "view" is true when the admin holds any action (create/edit/delete/view) on the module.
export const canAccess = (module, action = "view") => {
  const info = getAdminInfo();
  if (!info) return false;
  if (info.isSuperAdmin) return true;
  const perms = info.permissions?.[module];
  if (!perms) return false;
  if (action === "view") {
    return Boolean(perms.view || perms.create || perms.edit || perms.delete);
  }
  return Boolean(perms[action]);
};

const MODULE_ROUTES = {
  products: "/admin/products",
  coupons: "/admin/coupons",
  campaigns: "/admin/campaigns",
  blogs: "/admin/blogs",
  orders: "/admin/orders",
  reviews: "/admin/reviews",
  leads: "/admin/leads",
};

// First tab the current admin is allowed to open. Super admins always land on the
// dashboard; everyone else lands on their first granted module (dashboard is
// super-admin only, so it is never returned for regular admins).
export const firstAccessibleRoute = () => {
  const info = getAdminInfo();
  if (!info) return "/admin/login";
  if (info.isSuperAdmin) return "/admin/dashboard";
  for (const [module, route] of Object.entries(MODULE_ROUTES)) {
    if (canAccess(module)) return route;
  }
  return "/admin";
};