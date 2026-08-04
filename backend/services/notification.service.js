import {
  createNotification,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  markAllDocumentRead,
  markAllRead,
  deleteNotificationsForComment,
} from "../Repositories/notification.repository.js";

// Emit to every socket of the user so unread badges stay in sync across all
// open tabs (dashboard + document pages) without a manual refresh.
const emitNotificationsUpdated = (io, userId) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit("notifications-updated");
};

// CREATE + SOCKET EMIT (room = all sockets of the receiver)
export const sendNotificationService = async (data, io, onlineUsers) => {
  const notification = await createNotification(data);

  if (io) {
    io.to(`user:${data.receiverId.toString()}`).emit("new-notification", notification);
  }

  return notification;
};

// GET
export const getNotificationsService = async (userId) => {
  return await getUserNotifications(userId);
};

// READ (single) — notify the user's other tabs so badges update in real time
export const markNotificationReadService = async (id, io) => {
  const notification = await markAsRead(id);
  if (notification?.receiverId) {
    emitNotificationsUpdated(io, notification.receiverId);
  }
  return notification;
};

// COUNT
export const getUnreadCountService = async (userId) => {
  return await getUnreadCount(userId);
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllReadService = async (userId, io) => {
  const count = await markAllRead(userId);
  emitNotificationsUpdated(io, userId);
  return count;
};

// MARK ALL DOCUMENT NOTIFICATIONS AS READ
export const markAllDocumentReadService = async (userId, documentId, types = null, io) => {
  const count = await markAllDocumentRead(userId, documentId, types);
  emitNotificationsUpdated(io, userId);
  return count;
};

// REMOVE NOTIFICATIONS FOR A COMMENT
export const removeNotificationsForCommentService = async (commentId) => {
  return await deleteNotificationsForComment(commentId);
};