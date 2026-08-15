import { useEffect, useState } from "react";
import { lockScroll, unlockScroll } from "../utils/scrollLock.js";

// Shared modal with smooth open/close transitions.
// On close it stays mounted ~180ms while the CSS out-animation plays, then unmounts.
export default function Modal({ open, onClose, size = "max-w-md", bodyScroll = true, children }) {
  const [render, setRender] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      setRender(true);
    } else if (render) {
      setClosing(true);
      const t = setTimeout(() => {
        setRender(false);
        setClosing(false);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock page scroll while visible (scrollbar stays visible — no width shift)
  useEffect(() => {
    if (render && !closing) lockScroll();
    else unlockScroll();
    return unlockScroll;
  }, [render, closing]);

  if (!render) return null;

  return (
    <div
      className={`modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 ${
        closing ? "modal-closing" : ""
      }`}
      onClick={onClose}
    >
      <div
        className={`modal-panel modal-scroll w-full ${size} ${
          bodyScroll ? "max-h-[90vh] overflow-y-auto" : ""
        } bg-surface border border-border rounded-2xl p-6 ${
          closing ? "modal-closing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}