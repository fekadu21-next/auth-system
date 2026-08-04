import Notification from "../Models/Notification.js";
// CREATE
export const createNotification = async (data) => {
  return await Notification.create(data);
};
// GET USER NOTIFICATIONS
export const getUserNotifications = async (userId) => {
  return await Notification.find({ receiverId: userId })
    .populate("senderId", "name email")
    .populate("documentId", "title")
    .sort({ createdAt: -1 });
};
// MARK AS READ
export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

// UNREAD COUNT
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    receiverId: userId,
    isRead: false,
  });
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { receiverId: userId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount || 0;
};

// MARK ALL NOTIFICATIONS FOR A DOCUMENT AS READ
export const markAllDocumentRead = async (userId, documentId, types = null) => {
  const filter = {
    receiverId: userId,
    documentId,
    isRead: false,
  };
  if (types && types.length) {
    filter.type = { $in: types };
  }
  const result = await Notification.updateMany(
    filter,
    { isRead: true }
  );
  return result.modifiedCount || 0;
};

// DELETE NOTIFICATIONS LINKED TO A COMMENT
export const deleteNotificationsForComment = async (commentId) => {
  return await Notification.deleteMany({ commentId });
};