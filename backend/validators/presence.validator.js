export const validateJoinPresence = ({ documentId, userId }) => {
  if (!documentId) throw new Error("documentId required");
  if (!userId) throw new Error("userId required");
};

export const validateCursorUpdate = ({ documentId, userId }) => {
  if (!documentId) throw new Error("documentId required");
  if (!userId) throw new Error("userId required");
};