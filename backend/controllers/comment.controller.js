import {
  addCommentService,
  replyCommentService,
  getCommentsService,
  resolveCommentService,
  deleteCommentService,
} from "../services/comment.service.js";

import {
  validateCreateComment,
  validateReplyComment,
  validateCommentId,
} from "../validators/comment.validator.js";

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const data = {
      documentId: req.body.documentId,
      text: req.body.text || req.body.content,
      userId: req.user._id || req.user.id,
      position: req.body.position || { start: 0, end: 0 }
    };
    validateCreateComment(data);

    const comment = await addCommentService(data, req.app.get("io"));

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// REPLY COMMENT
export const replyComment = async (req, res) => {
  try {
    const data = {
      documentId: req.body.documentId,
      text: req.body.text || req.body.content,
      userId: req.user._id || req.user.id,
      parentCommentId: req.body.parentCommentId,
      parentComment: req.body.parentCommentId,
      position: { start: 0, end: 0 }
    };
    validateCreateComment(data);
    validateReplyComment(data);

    const comment = await replyCommentService(data, req.app.get("io"));

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET COMMENTS
export const getComments = async (req, res) => {
  try {
    const { documentId } = req.params;

    const comments = await getCommentsService(documentId);

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// RESOLVE COMMENT
export const resolveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;

    validateCommentId(commentId);

    const comment = await resolveCommentService(commentId, userId, req.app.get("io"));

    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;

    validateCommentId(commentId);

    await deleteCommentService(commentId, userId, req.app.get("io"));

    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};