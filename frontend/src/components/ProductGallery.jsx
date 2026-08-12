import { useState } from "react";

export default function ProductGallery({ images = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center text-text-faint">
        No preview
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-border mb-3">
        <img
          src={images[activeIndex].url}
          alt={`${title} preview ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.publicId || i}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-gold" : "border-border hover:border-teal"
              }`}
            >
              <img src={img.url} alt={`${title} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
