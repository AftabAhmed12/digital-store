import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle.jsx";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/blogs", label: "Blogs" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/cancelled", label: "Abandoned Checkouts" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName");

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

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
        </nav>
        <div className="border-t border-border pt-4">
          <p className="text-xs text-text-faint mb-2">Signed in as {adminName}</p>
          <button onClick={logout} className="text-sm text-red-400 hover:underline">Log out</button>
        </div>
      </aside>
      <main className="flex-1 bg-ink">
        <div className="md:hidden flex justify-end p-4">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
