import express from "express";
import documentController from "../controllers/document.controller.js";
import { isAuthenticated as auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create document
router.post(
  "/",
  auth,
  documentController.create
);

// Get my documents
router.get(
  "/",
  auth,
  documentController.getMine
);

// Get shared documents
router.get(
  "/shared",
  auth,
  documentController.getShared
);

// Get recent documents
router.get(
  "/recent",
  auth,
  documentController.getRecent
);

// Get single document
router.get(
  "/:id",
  auth,
  documentController.get
);

// Rename document
router.put(
  "/:id/title",
  auth,
  documentController.rename
);

// Delete document
router.delete(
  "/:id",
  auth,
  documentController.remove
);

// Duplicate document
router.post(
  "/:id/duplicate",
  auth,
  documentController.duplicate
);

// Update document content
router.put(
  "/:id/content",
  auth,
  documentController.updateContent
);

// Update page numbering settings
router.put(
  "/:id/page-settings",
  auth,
  documentController.updatePageSettings
);

// Cleanup orphaned shares (admin/utility endpoint)
router.post(
  "/cleanup-shares",
  auth,
  documentController.cleanupShares
);

export default router;