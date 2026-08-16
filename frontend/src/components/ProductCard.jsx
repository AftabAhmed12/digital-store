import { Link } from "react-router-dom";

// Signature element: product card styled like a digital "ticket stub" —
// a perforated line separates the preview from the instant-delivery detail,
// reinforcing that buying = instant email delivery, not a physical shipment.
export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-gold/50 transition-colors"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface2">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-faint text-sm">
            No preview
          </div>
        )}
      </div>

      {/* Perforated divider */}
      <div className="relative h-0 border-t border-dashed border-border">
        <span className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-ink border border-border" />
        <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-ink border border-border" />
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-teal mb-1">{product.category}</p>
        <h3 className="font-display font-600 text-base mb-2 group-hover:text-gold transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="text-text-faint text-sm mb-4 line-clamp-2">{product.shortDescription}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-gold text-lg">
            {product.currency?.toUpperCase() || "USD"} {product.price?.toFixed(2)}
          </span>
          <span className="text-xs text-text-faint flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" opacity="0" />
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
            </svg>
            Instant delivery
          </span>
        </div>
      </div>
    </Link>
  );
}
