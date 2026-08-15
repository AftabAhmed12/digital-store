// Builds the backend download URL for a product. The backend streams the file
// with `Content-Disposition: attachment; filename="<title>.pdf"`, so the
// customer always downloads a `.pdf` — Cloudinary's `fl_attachment` flag can't
// append `.pdf` on raw resources (it returns HTTP 400).

export const sanitizeFileName = (title) =>
  String(title || "download")
    .replace(/[^A-Za-z0-9 _-]+/g, "-")
    .replace(/ +/g, " ")
    .trim() || "download";

export const buildDownloadUrl = (product) => {
  if (!product?._id || !product?.digitalFile?.url) return "";
  const base = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  return `${base}/api/products/${product._id}/download`;
};