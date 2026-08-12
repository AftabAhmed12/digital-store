import { Link, NavLink } from "react-router-dom";
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
  return (
    <details className="md:hidden relative">
      <summary className="list-none cursor-pointer p-2 text-text-primary">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </summary>
      <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-lg shadow-xl py-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
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
    </details>
  );
}
