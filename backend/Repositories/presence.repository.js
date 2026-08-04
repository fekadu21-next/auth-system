import DocumentPresence from "../Models/DocumentPresence.js";

// CREATE OR UPDATE USER PRESENCE
export const upsertPresence = async ({
  documentId,
  userId,
  socketId,
}) => {
  return await DocumentPresence.findOneAndUpdate(
    { documentId, userId },
    {
      socketId,
      lastActive: new Date(),
    },
    { upsert: true, new: true }
  );
};

// REMOVE USER PRESENCE
export const removePresenceBySocket = async (socketId) => {
  return await DocumentPresence.findOneAndDelete({ socketId });
};

// GET USERS IN DOCUMENT
export const getUsersInDocument = async (documentId) => {
  return await DocumentPresence.find({ documentId })
    .populate("userId", "name email")
    .sort({ joinedAt: 1 });
};

// UPDATE CURSOR
export const updateCursor = async ({
  documentId,
  userId,
  cursor,
  selection,
}) => {
  return await DocumentPresence.findOneAndUpdate(
    { documentId, userId },
    {
      cursor,
      selection,
      lastActive: new Date(),
    }
  );
};

// UPDATE TYPING STATUS
export const updateTyping = async ({
  documentId,
  userId,
  isTyping,
}) => {
  return await DocumentPresence.findOneAndUpdate(
    { documentId, userId },
    {
      isTyping,
      lastActive: new Date(),
    }
  );
};