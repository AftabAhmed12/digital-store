import { Link } from "react-router-dom";

export default function BlogCard({ blog, compact = false }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group relative block bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10"
    >
      {/* Gold accent line that sweeps in on hover */}
      <span className="absolute inset-x-0 top-0 h-0.5 z-20 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative aspect-[16/9] overflow-hidden bg-surface2">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-faint text-sm">
            No image
          </div>
        )}
        {/* Soft ink gradient from the bottom — pulls the chip + card together */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

        {/* Category chip */}
        <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 bg-ink/80 backdrop-blur-sm border border-gold/30 text-gold text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full">
          <span className="w-1 h-1 rounded-full bg-gold" />
          {blog.category}
        </span>
      </div>

      <div className={compact ? "p-3.5" : "p-5"}>
        <h3
          className={`font-display font-600 group-hover:text-gold transition-colors ${
            compact ? "text-sm line-clamp-1" : "text-lg line-clamp-2 mb-2"
          }`}
        >
          {blog.title}
        </h3>
        {!compact && <p className="text-text-faint text-sm line-clamp-2 mb-4">{blog.excerpt}</p>}

        <div className="flex items-center justify-between gap-3 mt-2.5">
          <p className="text-xs text-text-faint font-mono flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {new Date(blog.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </p>
          <span className="text-gold flex items-center gap-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-[11px] font-semibold">Read</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}