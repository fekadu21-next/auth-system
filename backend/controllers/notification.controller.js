import {
  getNotificationsService,
  markNotificationReadService,
  getUnreadCountService,
  markAllDocumentReadService,
  markAllReadService,
} from "../services/notification.service.js";

// GET ALL
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await getNotificationsService(userId);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// MARK READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await markNotificationReadService(id, req.app.get("io"));

    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// UNREAD COUNT
export const unreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await getUnreadCountService(userId);

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// MARK ALL DOCUMENT NOTIFICATIONS AS READ
export const markDocumentRead = async (req, res) => {
  try {
    const { userId, documentId, types } = req.body;

    const count = await markAllDocumentReadService(
      userId,
      documentId,
      types || null,
      req.app.get("io")
    );

    res.json({ success: true, data: { marked: count } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllRead = async (req, res) => {
  try {
    const { userId } = req.body;

    const count = await markAllReadService(userId, req.app.get("io"));

    res.json({ success: true, data: { marked: count } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};