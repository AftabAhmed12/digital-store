import { useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "../utils/scrollLock.js";
import { img } from "../utils/imageUrl.js";

export default function ProductGallery({ images = [], title, autoSlideDelay = 4000 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    const next = (i + images.length) % images.length;
    setActiveIndex(next);
  };

  const restartTimer = () => {
    if (images.length < 2) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, autoSlideDelay);
  };

  useEffect(() => {
    restartTimer();
    return () => clearInterval(timerRef.current);
  }, [images.length, autoSlideDelay]);

  useEffect(() => {
    if (!previewOpen) return;
    lockScroll();
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewOpen(false);
      if (e.key === "ArrowRight") {
        goTo(activeIndex + 1);
        restartTimer();
      }
      if (e.key === "ArrowLeft") {
        goTo(activeIndex - 1);
        restartTimer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, activeIndex]);

  if (!images.length) {
    return (
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center text-text-faint">
        No preview
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-surface2 border border-border mb-3 cursor-zoom-in"
        onClick={() => setPreviewOpen(true)}
      >
        {images.map((image, i) => (
          <img
            key={image.publicId || i}
            src={img(image.url, 1200)}
            alt={`${title} preview ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <span className="absolute top-2 right-3 text-[11px] text-text-muted bg-ink/80 border border-border rounded-full px-3 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Click to zoom
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
                restartTimer();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink/70 hover:bg-ink text-text-primary flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
                restartTimer();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink/70 hover:bg-ink text-text-primary flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                    restartTimer();
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-5 bg-gold" : "w-1.5 bg-text-faint hover:bg-text-muted"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, i) => (
            <button
              key={image.publicId || i}
              onClick={() => {
                setActiveIndex(i);
                restartTimer();
              }}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-gold" : "border-border hover:border-teal"
              }`}
            >
              <img src={img(image.url, 200)} alt={`${title} thumbnail ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {previewOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image preview`}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-surface border border-border text-text-primary hover:text-gold hover:border-gold flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full h-[82vh] flex items-center justify-center bg-black/40 rounded-lg overflow-hidden">
              {images.map((image, i) => (
                <img
                  key={image.publicId || i}
                  src={img(image.url, 1400)}
                  alt={`${title} large preview ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => {
                    goTo(activeIndex - 1);
                    restartTimer();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 hover:bg-ink text-text-primary flex items-center justify-center shadow transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => {
                    goTo(activeIndex + 1);
                    restartTimer();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 hover:bg-ink text-text-primary flex items-center justify-center shadow transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-sm text-text-muted bg-ink/70 border border-border rounded-full px-3 py-1">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
