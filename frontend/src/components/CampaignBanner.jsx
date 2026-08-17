import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { img } from "../utils/imageUrl.js";

// Full-width promo banner shown under the navbar on every public page.
// The poster is rendered object-contain inside a themed, rounded panel with
// soft ambient glows — so whatever image the admin uploads (any colours, any
// style) always looks intentional and on-brand instead of a raw full-bleed
// image. Dismissing it with the X hides it for the whole session
// (sessionStorage) — it shows again when the visitor comes back to the site
// in a fresh session.
const STORAGE_KEY = "vaultly_campaign_dismissed";

export default function CampaignBanner() {
  const [campaigns, setCampaigns] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) return;
    let active = true;
    api
      .get("/campaigns/active")
      .then((res) => {
        if (active) setCampaigns(res.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (dismissed || campaigns.length === 0) return null;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-teal/10 blur-3xl" />

      <div className="container-px max-w-7xl mx-auto py-5 md:py-6 space-y-4">
        {campaigns.map((c) => {
          const endsOn = fmtDate(c.endsAt);
          return (
            <div
              key={c._id}
              className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-black/20"
            >
              {c.posterImage?.url ? (
                <div className="relative bg-surface2">
                  <img
                    src={img(c.posterImage.url, 1600)}
                    alt={c.title}
                    loading="eager"
                    className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-contain"
                  />
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-text-faint text-sm bg-surface2">
                  No poster
                </div>
              )}

              <div className="border-t border-border px-5 md:px-8 py-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-gold text-[11px] uppercase tracking-[3px] font-semibold mb-0.5">
                    Limited-time offer
                  </p>
                  <h2 className="font-display font-700 text-lg md:text-xl truncate">{c.title}</h2>
                </div>
                {endsOn && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-ink border border-border px-3 py-1.5 rounded-lg">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="13" r="8" />
                      <path d="M12 9v4l2.5 2.5M9 2h6" />
                    </svg>
                    Ends {endsOn}
                  </span>
                )}
              </div>

              <button
                onClick={dismiss}
                aria-label="Dismiss campaign banner"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ink/70 backdrop-blur-sm hover:bg-ink text-text-primary border border-border/60 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}