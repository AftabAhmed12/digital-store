import { Suspense, useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import Loader from "../../components/Loader.jsx";
import api from "../../api/axios.js";
import { canAccess, getAdminInfo } from "../../utils/adminAccess.js";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const allLinks = [
  { to: "/admin/dashboard", label: "Dashboard", module: "dashboard" },
  { to: "/admin/products", label: "Products", module: "products" },
  { to: "/admin/coupons", label: "Coupons", module: "coupons" },
  { to: "/admin/campaigns", label: "Campaigns", module: "campaigns" },
  { to: "/admin/blogs", label: "Blogs", module: "blogs" },
  { to: "/admin/orders", label: "Orders", module: "orders" },
  { to: "/admin/reviews", label: "Reviews", module: "reviews" },
  { to: "/admin/cancelled", label: "Abandoned Checkouts", module: "orders" },
  { to: "/admin/leads", label: "Chat Leads", module: "leads" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [info, setInfo] = useState(() => getAdminInfo());
  const [adminName, setAdminName] = useState(() => localStorage.getItem("adminName"));
  const [syncing, setSyncing] = useState(true);

  // Re-sync role/permissions from the server on mount. This fixes stale
  // localStorage from an earlier login (e.g. before a role change), so the
  // sidebar always reflects the current database role.
  useOnceEffect(() => {
    api
      .get("/admin/profile")
      .then((res) => {
        if (res.data?.email) {
          const fresh = { isSuperAdmin: res.data.isSuperAdmin, permissions: res.data.permissions };
          localStorage.setItem("adminInfo", JSON.stringify(fresh));
          localStorage.setItem("adminName", res.data.name);
          setInfo(fresh);
          setAdminName(res.data.name);
        }
      })
      .catch(() => {
        // Invalid/expired token — kick back to the login screen.
        logout();
      })
      .finally(() => setSyncing(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  // Only show tabs the admin has access to; Admin Management appears for super admins only.
  const isSuper = info?.isSuperAdmin;
  const links = [
    ...allLinks.filter((l) => canAccess(l.module)),
    ...(isSuper ? [{ to: "/admin/admin-management", label: "Admin Management", module: "admin" }] : []),
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-surface border-r border-border hidden md:flex flex-col p-6">
        <div className="flex items-center justify-between mb-10">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-display font-700 text-lg">Vaultly</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-surface2 text-gold" : "text-text-muted hover:text-text-primary"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {!syncing && links.length === 0 && (
            <p className="px-3 py-2 text-xs text-text-faint">No modules assigned yet.</p>
          )}
        </nav>
        <div className="border-t border-border pt-4">
          <p className="text-xs text-text-faint mb-1">Signed in as {adminName}</p>
          {isSuper && <p className="text-[11px] text-gold mb-2 uppercase tracking-widest">Super Admin</p>}
          <button onClick={logout} className="text-sm text-red-400 hover:underline">Log out</button>
        </div>
      </aside>
      <main className="flex-1 bg-ink">
        <div className="md:hidden flex justify-end p-4">
          <ThemeToggle />
        </div>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}