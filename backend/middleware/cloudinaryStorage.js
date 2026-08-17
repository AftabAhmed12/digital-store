import cloudinary from "../config/cloudinary.js";

// Custom multer Cloudinary storage engine.
// Replaces multer-storage-cloudinary so we can run the patched cloudinary v2 SDK
// (the old wrapper is stuck on the vulnerable v1 peer). Mirrors its file shape:
// file.path (secure URL), file.filename (public_id), plus uploader result fields.
export default function cloudinaryStorage(getParams) {
  return {
    _handleFile(req, file, cb) {
      const params = typeof getParams === "function" ? getParams(req, file) : getParams;
      const stream = cloudinary.uploader.upload_stream(params, (err, result) => {
        if (err) return cb(err);
        cb(null, { path: result.secure_url, filename: result.public_id, ...result });
      });
      file.stream.pipe(stream);
    },
    _removeFile(req, file, cb) {
      if (!file.filename) return cb();
      const params = typeof getParams === "function" ? getParams(req, file) : getParams;
      const resourceType = params.resource_type || "image";
      cloudinary.uploader
        .destroy(file.filename, { resource_type: resourceType })
        .then(() => cb())
        .catch(cb);
    },
  };
}