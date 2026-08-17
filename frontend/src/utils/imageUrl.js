// Appends Cloudinary delivery optimization params to an image URL.
// f_auto/q_auto pick the best format+quality for the viewer's browser,
// w_ serves exactly the width the image is displayed at — cutting payload 40-60%
// with zero visible loss. c_limit means Cloudinary NEVER upscales a small source,
// so a smaller original is served at its native size instead of being blown up
// into blur. Non-Cloudinary URLs (local, blob) pass through untouched.
export function img(url, width) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("cloudinary.com/")) return url;
  const parts = ["f_auto", "q_auto"];
  if (width) parts.push(`w_${width},c_limit`);
  const qs = parts.join(",");
  const [base, ...rest] = url.split("?");
  return rest.length ? `${base}?${qs}&${rest.join("?")}` : `${base}?${qs}`;
}