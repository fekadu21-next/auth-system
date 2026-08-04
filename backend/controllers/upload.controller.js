import {
  ensureUploadDir,
  parseDataUrl,
  writeImageBuffer,
  buildPublicUrl,
} from "../utils/upload.util.js";

/**
 * Upload an image file.
 * Accepts a base64 data URL: { dataUrl: "data:image/png;base64,..." }
 * Saves it to the uploads folder and returns a public URL.
 */
const uploadImage = async (req, res) => {
  try {
    const { dataUrl } = req.body || {};

    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ message: "No image data provided" });
    }

    // Ensure the upload directory exists right before writing so a stale /
    // removed folder never causes a 500 ENOENT on write.
    ensureUploadDir();

    const { buffer, ext } = parseDataUrl(dataUrl);
    const filename = writeImageBuffer(buffer, ext);
    const url = buildPublicUrl(req, filename);

    return res.status(201).json({ success: true, url, filename });
  } catch (err) {
    const isClientError = /^(No image data provided|Invalid image data|Unsupported image type|Empty image data|Image is too large)/.test(
      err.message || ""
    );
    if (isClientError) {
      const status = /too large/i.test(err.message) ? 413 : 400;
      return res.status(status).json({ message: err.message });
    }
    console.error("Image upload failed:", err);
    return res.status(500).json({ message: err.message || "Failed to upload image" });
  }
};

export default { uploadImage };
