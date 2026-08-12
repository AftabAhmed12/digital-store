import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-border">
      <nav className="container-px flex items-center justify-between h-16 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-gold group-hover:scale-125 transition-transform" />
          <span className="font-display font-700 text-lg tracking-tight">Vaultly</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-gold" : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden md:flex" />
          <Link
            to="/products"
            className="hidden md:inline-flex items-center bg-gold text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition"
          >
            Browse Products
          </Link>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close automatically whenever the route changes (covers link clicks,
  // back/forward navigation, programmatic redirects — not just onClick)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on Escape for keyboard users
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 text-text-primary relative w-8 h-8 flex items-center justify-center"
      >
        {/* Hamburger <-> X, animated via rotation/opacity rather than an abrupt swap */}
        <span
          className={`absolute block w-5 h-0.5 bg-current transition-transform duration-300 ease-out ${
            open ? "rotate-45" : "-translate-y-1.5"
          }`}
        />
        <span
          className={`absolute block w-5 h-0.5 bg-current transition-opacity duration-200 ease-out ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute block w-5 h-0.5 bg-current transition-transform duration-300 ease-out ${
            open ? "-rotate-45" : "translate-y-1.5"
          }`}
        />
      </button>

      {/* Backdrop: click outside to close */}
      {open && (
        <div className="fixed inset-0 top-16 z-40" onClick={() => setOpen(false)} />
      )}

      <div
        className={`absolute right-0 top-12 w-48 bg-surface border border-border rounded-lg shadow-xl py-2 z-50 origin-top-right transition-all duration-200 ease-out ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-muted hover:text-gold hover:bg-surface2"
          >
            {item.label}
          </Link>
        ))}
        <div className="border-t border-border mt-2 pt-2 px-4 flex items-center justify-between">
          <span className="text-xs text-text-faint">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
