export const validateCreateComment = ({ documentId, text }) => {
  if (!documentId) throw new Error("documentId required");
  if (!text) throw new Error("text required");
};

export const validateReplyComment = ({ parentCommentId }) => {
  if (!parentCommentId) throw new Error("parentCommentId required");
};

export const validateCommentId = (id) => {
  if (!id) throw new Error("commentId required");
};