// Lightweight "live sketch" hero illustration — pure SVG + CSS stroke-draw loop.
// No JS animation library, no video, no network assets: just paths that draw
// themselves in a looping sequence (staggered via --sketch-delay per line).
// Respects prefers-reduced-motion by rendering the scene fully-drawn & static.

const gold = "rgb(var(--color-gold))";
const teal = "rgb(var(--color-teal))";
const blue = "rgb(var(--color-blue))";

const lineStyle = (color, len, delay, opacity = 0.9) => ({
  stroke: color,
  strokeDasharray: len,
  strokeDashoffset: len,
  "--sketch-len": len,
  "--sketch-delay": `${delay}s`,
  opacity,
});

export default function SketchScene() {
  return (
    <svg
      viewBox="0 0 600 560"
      fill="none"
      aria-hidden="true"
      className="w-full h-auto max-w-[560px] mx-auto"
    >
      {/* back-left card (draws first) */}
      <g transform="rotate(-12 120 290)">
        <rect
          x="45" y="185" width="150" height="210" rx="10"
          className="sketch-line"
          style={lineStyle(gold, 900, 0, 0.6)}
          strokeWidth={2}
        />
        <path
          d="M45 300 H195"
          className="sketch-line"
          style={lineStyle(gold, 200, 0.3, 0.45)}
          strokeWidth={1.5}
        />
      </g>

      {/* back-right card */}
      <g transform="rotate(12 480 290)">
        <rect
          x="405" y="185" width="150" height="210" rx="10"
          className="sketch-line"
          style={lineStyle(blue, 900, 0.55, 0.6)}
          strokeWidth={2}
        />
        <path
          d="M405 300 H555"
          className="sketch-line"
          style={lineStyle(blue, 200, 0.85, 0.45)}
          strokeWidth={1.5}
        />
      </g>

      {/* main wedding-style card */}
      <g transform="rotate(-3 300 295)">
        <rect
          x="150" y="95" width="300" height="400" rx="16"
          className="sketch-line"
          style={lineStyle(gold, 1500, 1.1, 0.95)}
          strokeWidth={2.5}
        />
        <rect
          x="168" y="115" width="264" height="360" rx="10"
          className="sketch-line"
          style={lineStyle(gold, 1300, 1.6, 0.7)}
          strokeWidth={1.5}
        />

        {/* wedding rings */}
        <path
          d="M272 169 a16 16 0 1 0 0 32 a16 16 0 1 0 0 -32"
          className="sketch-line"
          style={lineStyle(teal, 120, 2.1, 0.95)}
          strokeWidth={2.5}
        />
        <path
          d="M328 169 a16 16 0 1 0 0 32 a16 16 0 1 0 0 -32"
          className="sketch-line"
          style={lineStyle(teal, 120, 2.35, 0.95)}
          strokeWidth={2.5}
        />

        {/* heart */}
        <path
          d="M300 272 c-14 -20 -38 -14 -38 -38 c0 -12 9 -21 19 -21 c8 0 14 4 19 11 c5 -7 11 -11 19 -11 c10 0 19 9 19 21 c0 24 -24 18 -38 38 z"
          className="sketch-line"
          style={lineStyle(gold, 220, 2.7, 0.9)}
          strokeWidth={2}
        />

        {/* hand-drawn text lines */}
        <path d="M198 305 q 26 9 52 0 t 52 0 t 52 0 t 52 0" className="sketch-line" style={lineStyle(blue, 320, 3.1)} strokeWidth={2} />
        <path d="M198 335 q 26 -9 52 0 t 52 0 t 52 0 t 52 0" className="sketch-line" style={lineStyle(blue, 320, 3.4)} strokeWidth={2} />
        <path d="M198 365 q 26 9 52 0 t 52 0 t 52 0 t 52 0" className="sketch-line" style={lineStyle(blue, 320, 3.7)} strokeWidth={2} />

        {/* flourish underline */}
        <path d="M235 415 q 65 12 130 0" className="sketch-line" style={lineStyle(gold, 180, 4.0, 0.9)} strokeWidth={2} />
        <path
          d="M300 445 c-8 -12 -22 -8 -22 -22 c0 -7 5 -12 11 -12 c5 0 8 2 11 6 c3 -4 6 -6 11 -6 c6 0 11 5 11 12 c0 14 -14 10 -22 22 z"
          className="sketch-line"
          style={lineStyle(teal, 160, 4.3, 0.9)}
          strokeWidth={1.8}
        />
      </g>

      {/* sparkles */}
      <path d="M90 118 v24 M78 130 h24" className="sketch-line" style={lineStyle(gold, 60, 4.6, 0.85)} strokeWidth={2} />
      <path d="M512 228 v24 M500 240 h24" className="sketch-line" style={lineStyle(teal, 60, 4.9, 0.85)} strokeWidth={2} />
      <path d="M158 70 v20 M148 80 h20" className="sketch-line" style={lineStyle(blue, 50, 5.2, 0.85)} strokeWidth={2} />
      <path d="M470 468 v20 M460 478 h20" className="sketch-line" style={lineStyle(gold, 50, 5.5, 0.85)} strokeWidth={2} />
      <path d="M118 468 v20 M108 478 h20" className="sketch-line" style={lineStyle(teal, 50, 5.8, 0.85)} strokeWidth={2} />
      <path d="M530 92 v16 M522 100 h16" className="sketch-line" style={lineStyle(blue, 40, 6.1, 0.85)} strokeWidth={2} />
    </svg>
  );
}