import express from "express";
import {
  saveVersion,
  getVersions,
  restoreVersion,
  renameVersion,
} from "../controllers/version.controller.js";

import { isAuthenticated as auth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(auth);
// Save version
router.post("/save", saveVersion);
// Get all versions
router.get("/:documentId", getVersions);
// Restore version
router.post("/restore/:versionId", restoreVersion);
// Rename version
router.put("/rename/:versionId", renameVersion);
export default router;