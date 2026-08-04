import {
  createComment,
  getCommentsByDocument,
  getCommentById,
  resolveComment,
  deleteComment,
} from "../repositories/comment.repository.js";
import {
  removeNotificationsForCommentService,
  sendNotificationService,
} from "./notification.service.js";
import { checkPermission, getSharedUsers } from "./documentShare.service.js";
import { findUserByEmail } from "./authService.js";
import { onlineUsers } from "../sockets/notification.socket.js";
import Document from "../Models/Documents.js";

// Helper for permissions
const enforceAction = async (documentId, userId, action) => {
  const perm = await checkPermission(documentId, userId);
  const role = perm.permission;

  if (role === "viewer") {
    throw new Error(`Viewers cannot ${action}`);
  }
  return role; // 'owner', 'editor', 'commenter'
};

// Extract mention emails like @[Name](email)
const extractMentionEmails = (text) => {
  const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
  const emails = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    emails.push(match[2]);
  }
  return emails;
};

const handleMentions = async (text, documentId, senderId, commentId, io) => {
  const emails = extractMentionEmails(text);
  const mentionedIds = new Set();

  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (
      user &&
      user._id.toString() !== senderId.toString() &&
      !mentionedIds.has(user._id.toString())
    ) {
      mentionedIds.add(user._id.toString());
      await sendNotificationService(
        {
          receiverId: user._id,
          senderId,
          documentId,
          commentId,
          type: "mention",
          message: `mentioned you in a comment`,
        },
        io,
        onlineUsers
      );
    }
  }
  return mentionedIds;
};

const notifySharedUsers = async (
  documentId,
  senderId,
  message,
  commentId,
  excludeIds = new Set(),
  io
) => {
  const document = await Document.findById(documentId);
  const sharedUsers = await getSharedUsers(documentId);

  const receivers = new Set();
  if (document && document.owner.toString() !== senderId.toString()) {
    receivers.add(document.owner.toString());
  }
  for (const share of sharedUsers) {
    if (share.userId && share.userId._id.toString() !== senderId.toString()) {
      receivers.add(share.userId._id.toString());
    }
  }

  for (const receiverId of receivers) {
    if (!excludeIds.has(receiverId)) {
      await sendNotificationService(
        {
          receiverId,
          senderId,
          documentId,
          commentId,
          type: "comment",
          message,
        },
        io,
        onlineUsers
      );
    }
  }
};

const notifyThreadParticipants = async (
  parentCommentId,
  documentId,
  senderId,
  type,
  message,
  commentId,
  excludeIds = new Set(),
  io
) => {
  const threadReplies = await getCommentsByDocument(documentId);
  const parent = threadReplies.find(
    (c) => c._id.toString() === parentCommentId.toString()
  );
  if (!parent) return;

  const receivers = new Set();
  if (parent.userId && parent.userId._id.toString() !== senderId.toString()) {
    receivers.add(parent.userId._id.toString());
  }

  threadReplies.forEach((c) => {
    if (
      c.parentComment?.toString() === parentCommentId.toString() &&
      c.userId &&
      c.userId._id.toString() !== senderId.toString()
    ) {
      receivers.add(c.userId._id.toString());
    }
  });

  for (const receiverId of receivers) {
    if (!excludeIds.has(receiverId)) {
      await sendNotificationService(
        {
          receiverId,
          senderId,
          documentId,
          commentId,
          type,
          message,
        },
        io,
        onlineUsers
      );
    }
  }
};

// ADD COMMENT
export const addCommentService = async (data, io) => {
  await enforceAction(data.documentId, data.userId, "add comment");
  const mentionEmails = extractMentionEmails(data.text || "");
  const mentionedUsers = [];
  for (const email of mentionEmails) {
    const user = await findUserByEmail(email);
    if (user && user._id.toString() !== data.userId.toString()) {
      mentionedUsers.push(user._id);
    }
  }
  const comment = await createComment({ ...data, mentions: mentionedUsers });
  const mentionedIds = await handleMentions(
    data.text,
    data.documentId,
    data.userId,
    comment._id,
    io
  );
  await notifySharedUsers(
    data.documentId,
    data.userId,
    "added a new comment",
    comment._id,
    mentionedIds,
    io
  );
  return comment;
};

// REPLY COMMENT
export const replyCommentService = async (data, io) => {
  await enforceAction(data.documentId, data.userId, "reply to comment");
  const parent = await getCommentById(data.parentCommentId);
  if (!parent) throw new Error("Parent comment not found");

  const mentionEmails = extractMentionEmails(data.text || "");
  const mentionedUsers = [];
  for (const email of mentionEmails) {
    const user = await findUserByEmail(email);
    if (user && user._id.toString() !== data.userId.toString()) {
      mentionedUsers.push(user._id);
    }
  }
  const comment = await createComment({ ...data, mentions: mentionedUsers });
  const mentionedIds = await handleMentions(
    data.text,
    data.documentId,
    data.userId,
    comment._id,
    io
  );
  await notifyThreadParticipants(
    data.parentCommentId,
    data.documentId,
    data.userId,
    "reply",
    "replied to a comment thread",
    comment._id,
    mentionedIds,
    io
  );
  return comment;
};

// GET COMMENTS
export const getCommentsService = async (documentId) => {
  return await getCommentsByDocument(documentId);
};

// RESOLVE COMMENT
export const resolveCommentService = async (commentId, userId, io) => {
  const comment = await getCommentById(commentId);
  if (!comment) throw new Error("Comment not found");

  const role = await enforceAction(comment.documentId, userId, "resolve comment");
  if (role === "commenter") {
    throw new Error("Commenters cannot resolve comments");
  }

  const resolvedComment = await resolveComment(commentId, userId);
  await notifyThreadParticipants(
    commentId,
    comment.documentId,
    userId,
    "resolve",
    "resolved a comment thread",
    comment._id,
    new Set(),
    io
  );
  return resolvedComment;
};

// DELETE COMMENT
export const deleteCommentService = async (commentId, userId, io) => {
  const comment = await getCommentById(commentId);
  if (!comment) throw new Error("Comment not found");

  const role = await enforceAction(comment.documentId, userId, "delete comment");

  const isAuthor = comment.userId.toString() === userId.toString();

  if (!isAuthor && role !== "owner") {
    throw new Error("Only the author or document owner can delete this comment");
  }

  const isReply = Boolean(comment.parentComment);

  await removeNotificationsForCommentService(commentId);

  const deleted = await deleteComment(commentId);

  const message = isReply
    ? "deleted a reply"
    : "deleted a comment";

  if (isReply) {
    await notifyThreadParticipants(
      comment.parentComment,
      comment.documentId,
      userId,
      "delete",
      message,
      comment.parentComment,
      new Set(),
      io
    );
  } else {
    await notifySharedUsers(
      comment.documentId,
      userId,
      message,
      null,
      new Set(),
      io
    );
  }

  return deleted;
};
