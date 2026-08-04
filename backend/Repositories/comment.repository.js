import Comment from "../Models/Comment.js";

// CREATE COMMENT
export const createComment = async (data) => {
  return await Comment.create(data);
};

// GET COMMENTS BY DOCUMENT
export const getCommentsByDocument = async (documentId) => {
  return await Comment.find({ documentId })
    .populate("userId", "name email")
    .populate("resolvedBy", "name")
    .sort({ createdAt: -1 });
};

// GET COMMENT BY ID
export const getCommentById = async (id) => {
  return await Comment.findById(id);
};

// RESOLVE COMMENT
export const resolveComment = async (id, userId) => {
  return await Comment.findByIdAndUpdate(
    id,
    {
      isResolved: true,
      resolvedBy: userId,
      resolvedAt: new Date(),
    },
    { new: true }
  );
};

// DELETE COMMENT
export const deleteComment = async (id) => {
  return await Comment.findByIdAndDelete(id);
};