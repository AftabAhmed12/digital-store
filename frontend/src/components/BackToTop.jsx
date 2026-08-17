import { useEffect, useState } from "react";

// Floating "back to top" button. Appears after the page is scrolled past a
// threshold and glides back up smoothly when clicked. Matches the vault theme.
export default function BackToTop({ threshold = 400 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`back-to-top fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full bg-gold text-ink shadow-[0_8px_25px_rgba(242,184,75,0.4)] hover:brightness-110 hover:scale-105 active:scale-95 flex items-center justify-center transition-[opacity,transform] duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}