// Themed pagination controls for admin tables. Renders prev/next + numbered
// pages (with ellipsis) and a compact "showing X of Y" summary.
export default function Pagination({ page, totalPages, total, onChange, pageSizeLabel }) {
  if (!total || totalPages <= 1) return null;

  const pages = new Set([1, totalPages]);
  for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.add(i);
  const list = [...pages].sort((a, b) => a - b);

  const btn =
    "px-3 py-1.5 rounded-lg text-sm border border-border text-text-muted hover:border-gold hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-muted";

  const from = total === 0 ? 0 : (page - 1) * (pageSizeLabel || 10) + 1;
  const to = Math.min(page * (pageSizeLabel || 10), total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <span className="text-xs text-text-faint font-mono">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          ←
        </button>
        {list.map((p, i) => {
          const prev = list[i - 1];
          const showGap = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1.5">
              {showGap && <span className="text-text-faint text-sm px-1">…</span>}
              <button
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  p === page
                    ? "bg-gold text-ink border-gold font-semibold"
                    : "border-border text-text-muted hover:border-gold hover:text-text-primary"
                }`}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          →
        </button>
      </div>
    </div>
  );
}