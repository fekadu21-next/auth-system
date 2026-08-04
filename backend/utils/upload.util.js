import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

export const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

export const MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/bmp": ".bmp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/x-icon": ".ico",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const buildPublicUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

export const writeImageBuffer = (buffer, ext) => {
  ensureUploadDir();
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return filename;
};

export const parseDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new Error("No image data provided");
  }

  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/is.exec(dataUrl.trim());
  if (!match) {
    throw new Error("Invalid image data");
  }

  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) {
    throw new Error("Unsupported image type");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0) {
    throw new Error("Empty image data");
  }
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image is too large (max 10MB)");
  }

  return { buffer, ext, mime };
};
