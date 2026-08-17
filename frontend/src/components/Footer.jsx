import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="container-px max-w-7xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-display font-700 text-lg">Vaultly</span>
          </div>
          <p className="text-text-faint text-sm leading-relaxed max-w-xs">
            Digital products, delivered straight to your inbox the moment you pay. No accounts, no waiting.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-text-faint mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="text-text-muted hover:text-gold">Products</Link></li>
            <li><Link to="/blog" className="text-text-muted hover:text-gold">Blog</Link></li>
            <li><Link to="/write-for-us" className="text-text-muted hover:text-gold">Write for Us</Link></li>
            <li><Link to="/contact" className="text-text-muted hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-text-faint mb-4">How it works</p>
          <ol className="space-y-2 text-sm text-text-muted">
            <li>1. Pick a product</li>
            <li>2. Pay securely with Stripe</li>
            <li>3. Get it instantly by email</li>
          </ol>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-text-faint">
        © {new Date().getFullYear()} Vaultly. All rights reserved.
      </div>
    </footer>
  );
}
