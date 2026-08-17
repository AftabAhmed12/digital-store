import { useEffect, useRef, useState } from "react";

// Compact category picker for Products/Blog filters.
// Instead of rendering every category as a pill (which stretches the page when
// there are 20+ categories), it opens a searchable dropdown with the categories
// sorted A→Z. Page height stays constant regardless of category count.
export default function CategoryFilter({ categories = [], active = "", onChange, label = "All Categories" }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const timerRef = useRef(null);

  const sorted = [...categories].sort((a, b) => a.localeCompare(b));
  const filtered = sorted.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Close with a smooth exit animation — used by scroll, outside click & Escape.
  const hide = () => {
    if (!open) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setQuery("");
    }, 150);
  };

  const toggle = () => {
    if (open || closing) {
      hide();
    } else {
      clearTimeout(timerRef.current);
      setClosing(false);
      setOpen(true);
      setQuery("");
    }
  };

  useEffect(() => {
    if (!open && !closing) return;
    const onKey = (e) => {
      if (e.key === "Escape") hide();
    };
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) hide();
    };
    // Capture-phase scroll listener catches window AND nested container scrolls,
    // so the listbox hides whenever the page moves under it — but never when the
    // user scrolls inside the dropdown's own scroller.
    const onScroll = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      hide();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [open, closing]);

  const select = (cat) => {
    onChange(cat);
    clearTimeout(timerRef.current);
    setClosing(false);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={`px-4 py-2.5 rounded-lg text-sm border flex items-center gap-2 transition-colors ${
          active
            ? "bg-gold text-ink border-gold font-medium"
            : "border-border text-text-muted hover:border-teal"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54Z" />
        </svg>
        <span className="capitalize max-w-[140px] truncate">{active || label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {(open || closing) && (
        <div
          aria-hidden={!open}
          className={`absolute left-0 top-full mt-2 w-72 z-30 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden dropdown-anim ${
            closing ? "dropdown-closing" : ""
          }`}
        >
          <div className="p-3 border-b border-border">
            <div className="relative">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-ink border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:border-gold outline-none"
              />
            </div>
          </div>
          <ul role="listbox" className="dropdown-scroll max-h-60 overflow-y-auto p-2">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={active === ""}
                onClick={() => select("")}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left capitalize transition-colors ${
                  active === "" ? "bg-gold/10 text-gold" : "text-text-muted hover:bg-surface2 hover:text-text-primary"
                }`}
              >
                <span>{label}</span>
                {active === "" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
            {filtered.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active === cat}
                  onClick={() => select(cat)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left capitalize transition-colors ${
                    active === cat ? "bg-gold/10 text-gold" : "text-text-muted hover:bg-surface2 hover:text-text-primary"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {active === cat && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-text-faint">No categories found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}