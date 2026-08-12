import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cover images (products & blogs) -> image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "digital-store/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

// Digital product files (pdf, zip, etc.) -> raw storage, not public
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "digital-store/products",
    resource_type: "raw",
  },
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadFile = multer({ storage: fileStorage });
