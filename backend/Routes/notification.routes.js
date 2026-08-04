import express from "express";
import {
  getNotifications,
  markAsRead,
  unreadCount,
  markDocumentRead,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/:userId", getNotifications);
router.post("/read-all", markAllRead);
router.post("/read/:id", markAsRead);
router.post("/read-document", markDocumentRead);
router.get("/unread/:userId", unreadCount);

export default router;