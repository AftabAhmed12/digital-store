// Builds a Cloudinary delivery URL that forces the file to download with a
// filename matching the PRODUCT TITLE + `.pdf` (instead of the raw uploaded
// name), so customers instantly recognise what they're getting. The `.pdf`
// suffix guarantees the downloaded file is always a PDF.
//
// Uses the `fl_attachment:<name>` transformation flag, injected into the
// existing raw delivery URL. Docs: https://cloudinary.com/documentation/transformation_reference_fl_flag_attachment

const sanitize = (title) =>
  String(title)
    .replace(/[^A-Za-z0-9 _-]+/g, "-")
    .replace(/ +/g, " ")
    .trim() || "download";

export const buildDownloadUrl = (product) => {
  const fileUrl = product?.digitalFile?.url;
  if (!fileUrl) return "";
  const encoded = encodeURIComponent(sanitize(product.title));
  return fileUrl.replace(/\/upload\//, `/upload/fl_attachment:${encoded}.pdf/`);
};