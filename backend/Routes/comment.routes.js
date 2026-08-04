import express from "express";
import {
  addComment,
  replyComment,
  getComments,
  resolveComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { isAuthenticated as auth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(auth);

// Add comment
router.post("/", addComment);

// Reply
router.post("/reply", replyComment);

// Get all comments
router.get("/:documentId", getComments);

// Resolve
router.post("/resolve/:commentId", resolveComment);

// Delete
router.delete("/:commentId", deleteComment);

export default router;