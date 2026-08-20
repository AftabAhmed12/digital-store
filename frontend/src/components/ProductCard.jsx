import { Link } from "react-router-dom";
import { img } from "../utils/imageUrl.js";

const STAR_PATH = "M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.4l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z";

// Display-only star row (no buttons — the card itself is a link). Supports half steps.
function CardStars({ value, size }) {
  return (
    <span className="relative flex shrink-0">
      {[1, 2, 3, 4, 5].map((n) => {
        const pct = Math.max(0, Math.min(1, value - (n - 1))) * 100;
        return (
          <span key={n} className="relative block" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(var(--color-text-faint))"
              strokeWidth="1.5"
              className="absolute inset-0"
            >
              <path d={STAR_PATH} />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="rgb(var(--color-gold))"
                stroke="rgb(var(--color-gold))"
                strokeWidth="1.5"
                className="absolute inset-0"
              >
                <path d={STAR_PATH} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

// Signature element: product card styled like a digital "ticket stub" —
// a perforated line separates the preview from the instant-delivery detail,
// reinforcing that buying = instant email delivery, not a physical shipment.
export default function ProductCard({ product, compact = false }) {
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0;
  const salePrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;
  const cur = product.currency?.toUpperCase() || "USD";
  const rating = Number(product.rating) || 0;
  const reviewCount = Number(product.reviewCount) || 0;
  const starSize = compact ? 13 : 15;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-gold/50 transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface2">
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-gold text-ink text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {Math.round(discountPercent)}% OFF
          </span>
        )}
        {product.images?.[0]?.url ? (
          <img
            src={img(product.images[0].url, 800)}
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

      <div className={compact ? "p-3" : "p-4"}>
        <p className="text-xs uppercase tracking-widest text-teal mb-1">{product.category}</p>
        <h3
          className={`font-display font-600 group-hover:text-gold transition-colors line-clamp-1 ${
            compact ? "text-sm mb-2" : "text-base mb-2"
          }`}
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-1.5 h-5 mb-2">
          <CardStars value={rating} size={starSize} />
          {reviewCount > 0 ? (
            <span className="text-xs text-text-faint leading-none">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          ) : (
            <span className="text-xs text-text-faint leading-none">No reviews yet</span>
          )}
        </div>
        {!compact && <p className="text-text-faint text-sm mb-4 line-clamp-2">{product.shortDescription}</p>}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-gold ${compact ? "text-base" : "text-lg"}`}>
              {cur} {salePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-text-faint line-through">{cur} {product.price.toFixed(2)}</span>
            )}
          </div>
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
