import {
  upsertPresence,
  removePresenceBySocket,
  getUsersInDocument,
  updateCursor,
  updateTyping,
} from "../Repositories/presence.repository.js";

// USER JOIN
export const joinPresenceService = async (data) => {
  await upsertPresence(data);
  return await getUsersInDocument(data.documentId);
};

// USER LEAVE
export const leavePresenceService = async (socketId) => {
  const presence = await removePresenceBySocket(socketId);

  if (!presence) return null;

  return await getUsersInDocument(presence.documentId);
};

// UPDATE CURSOR
export const updateCursorService = async (data) => {
  await updateCursor(data);
  return await getUsersInDocument(data.documentId);
};

// UPDATE TYPING
export const updateTypingService = async (data) => {
  await updateTyping(data);
  return await getUsersInDocument(data.documentId);
};