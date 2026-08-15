import { useState } from "react";
import Modal from "./Modal.jsx";

// Product share module — opens a themed modal with one-tap social share intents.
// Each platform opens in a new tab pre-filled with the product details, so the
// user only has to hit post/share. Email copies the details into a draft too.
export default function ProductShare({ product }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const pageUrl = window.location.href;
  const title = product.title;
  const blurb =
    product.shortDescription ||
    (typeof product.description === "string" ? product.description.slice(0, 160) : "");
  const priceText = `${product.currency?.toUpperCase() || "USD"} ${product.price?.toFixed(2)}`;

  const text = encodeURIComponent(`${title} — ${priceText}${blurb ? " — " + blurb : ""}`);
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(`${title} — ${priceText}\n\n${blurb}\n\nCheck it out:`);
  const url = encodeURIComponent(pageUrl);

  const platforms = [
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      color: "hover:text-white",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      // `quote` shows a prefilled message even before Facebook scrapes the link,
      // so it works on localhost too (scraping can't reach localhost).
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      color: "hover:text-[#1877F2]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${text}%20${url}`,
      color: "hover:text-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
      color: "hover:text-[#229ED9]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      color: "hover:text-[#0A66C2]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      color: "hover:text-[#E60023]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0Z" />
        </svg>
      ),
    },
    {
      name: "Reddit",
      href: `https://www.reddit.com/submit?url=${url}&title=${subject}`,
      color: "hover:text-[#FF4500]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0Zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.508-.322 1.152-.522 1.854-.522.648 0 1.293.204 1.83.56a2.046 2.046 0 0 1 3.193 1.883 2.045 2.045 0 0 1-1.479 1.98c.062.415.108.826.108 1.249 0 2.798-2.57 5.084-6.626 5.084-4.057 0-6.627-2.286-6.627-5.084 0-.423.045-.834.108-1.249a2.045 2.045 0 0 1-1.479-1.98 2.046 2.046 0 0 1 3.192-1.883c1.194-.856 2.85-1.418 4.675-1.488l.913-4.283a.307.307 0 0 1 .351-.252l2.93.598ZM9.706 8.083a.5.5 0 0 0-.012.007.594.594 0 0 0-.427.541c0 .024.003.045.006.064.019.036.039.07.068.094a.497.497 0 0 0 .5.104c.02-.004.04-.007.061-.012l1.274-.274-.274 1.275a.501.501 0 1 0 .983.207l.34-1.586a.498.498 0 0 0-.363-.596l-2.556-.546Zm4.733.158a.5.5 0 0 0-.012-.007l-2.556.546a.5.5 0 0 0-.364.596l.342 1.586a.502.502 0 0 0 .982-.207l-.273-1.275 1.274.274a.502.502 0 0 0 .561-.397.501.501 0 0 0-.396-.565l-1.557-.333a.498.498 0 0 0-.001-.218Zm-4.532 3.453a1.42 1.42 0 0 0-.006 0c-.78 0-1.414.635-1.414 1.416 0 .78.634 1.416 1.414 1.416.78 0 1.414-.636 1.414-1.416a1.416 1.416 0 0 0-1.408-1.416Zm4.689 0a1.42 1.42 0 0 0-.006 0c-.78 0-1.414.635-1.414 1.416 0 .78.634 1.416 1.414 1.416.78 0 1.414-.636 1.414-1.416a1.416 1.416 0 0 0-1.408-1.416Zm-2.345 2.93a.5.5 0 0 0-.25.071c-.667.428-1.584.685-2.5.685a.5.5 0 0 0-.002 1.001c1.13 0 2.243-.325 3.082-.884a.5.5 0 0 0-.33-.873Zm0 0c.102 0 .204.022.296.064a.5.5 0 0 1-.05.935c-.076.03-.156.044-.246.044a.5.5 0 0 1 0-1.043Zm2.873.218a.5.5 0 0 0-.253.072c-.96.635-2.13.921-3.25.85a.5.5 0 1 0-.05.999c1.332.088 2.688-.267 3.76-1.027a.5.5 0 0 0-.207-.894Zm-4.802-.493c.066 0 .13.008.192.022a.5.5 0 1 0 .26-.966 1.46 1.46 0 0 0-.452-.066 1.417 1.417 0 0 0-1.414 1.416c0 .083.006.164.017.244a.5.5 0 0 0 .994-.096 1.416 1.416 0 0 0-.012-.18c-.066.048-.143.076-.226.076-.45 0-.813-.365-.813-.816 0-.45.365-.816.813-.816Z" />
        </svg>
      ),
    },
    {
      name: "Email",
      href: `mailto:?subject=${subject}&body=${body}%0A%0A${url}`,
      color: "hover:text-gold",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      ),
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-3d inline-flex items-center gap-2 bg-gold text-ink font-semibold px-5 py-3 rounded-lg"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
        Share
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="max-w-md">
        <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-700 text-xl">Share this product</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-text-faint hover:text-text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-text-faint text-sm mb-5 leading-relaxed line-clamp-2">
              {product.title} — {priceText}
            </p>

            <div className="grid grid-cols-4 gap-3">
              {platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={p.name}
                  title={p.name}
                  className="group flex flex-col items-center gap-2 py-3 rounded-xl border border-border bg-ink text-text-muted transition-all hover:border-gold hover:-translate-y-0.5"
                >
                  <span className={`transition-colors ${p.color}`}>{p.icon}</span>
                  <span className="text-[10px] uppercase tracking-wide text-text-faint group-hover:text-text-primary">
                    {p.name.split(" ")[0]}
                  </span>
                </a>
              ))}
            </div>

            <button
              onClick={copyLink}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-surface2 border border-border rounded-lg py-2.5 text-sm font-semibold text-text-primary hover:border-teal transition-colors"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-teal">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
      </Modal>
    </>
  );
}