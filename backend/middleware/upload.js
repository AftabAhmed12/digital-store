import multer from "multer";
import cloudinaryStorage from "./cloudinaryStorage.js";

// Cover images (products & blogs) -> image storage
const imageStorage = cloudinaryStorage({
  folder: "digital-store/images",
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 1200, crop: "limit" }],
});

// Digital product files (pdf, zip, etc.) -> raw storage, not public
const fileStorage = cloudinaryStorage({
  folder: "digital-store/products",
  resource_type: "raw",
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadFile = multer({ storage: fileStorage });