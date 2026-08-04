import DocumentShare from "../Models/DocumentShare.js";
import Document from "../Models/Documents.js";
import ApiError from "../utils/ApiError.js";
import { sendNotificationService } from "./notification.service.js";
import { onlineUsers } from "../sockets/notification.socket.js";


/**
 * Share document
 */
export const shareDocument = async (
  documentId,
  userId,
  permission,
  sharedBy,
  io
) => {


  const document = await Document.findById(documentId);

  if (!document) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }


  const existingShare =
    await DocumentShare.findOne({
      documentId,
      userId
    });


  if (existingShare) {

    throw new ApiError(
      400,
      "Document already shared with this user"
    );
  }


  const share =
    await DocumentShare.create({

      documentId,
      userId,
      permission,
      sharedBy

    });


  if (io) {
    await sendNotificationService(
      {
        receiverId: userId,
        senderId: sharedBy,
        documentId,
        type: "share",
        message: `shared the document "${document.title}" with you`,
      },
      io,
      onlineUsers
    );
  }


  return share;

};



/**
 * Update permission
 */
export const updatePermission = async (
  documentId,
  userId,
  permission,
  actorId,
  io
) => {


  const share =
    await DocumentShare.findOne({
      documentId,
      userId
    });


  if (!share) {

    throw new ApiError(
      404,
      "Shared user not found"
    );

  }



  share.permission = permission;


  await share.save();


  if (io) {
    const document = await Document.findById(documentId).select("title");
    await sendNotificationService(
      {
        receiverId: userId,
        senderId: actorId,
        documentId,
        type: "role",
        message: `changed your access role to ${permission} on "${document?.title || "the document"}"`,
      },
      io,
      onlineUsers
    );
  }


  return share;

};





/**
 * Remove shared user
 */
export const removeSharedUser = async (
  documentId,
  userId
) => {


  const share =
    await DocumentShare.findOneAndDelete({

      documentId,
      userId

    });



  if (!share) {

    throw new ApiError(
      404,
      "User is not shared on this document"
    );

  }



  return share;

};





/**
 * Get users shared on document
 */
export const getSharedUsers = async (
  documentId
) => {


  const users =
    await DocumentShare.find({
      documentId
    })
      .populate(
        "userId",
        "name email avatar"
      )
      .populate(
        "sharedBy",
        "name email"
      );



  return users;

};







/**
 * Check Permission
 */
export const checkPermission = async (
  documentId,
  userId
) => {


  const document =
    await Document.findById(documentId);



  if (!document) {

    throw new ApiError(
      404,
      "Document not found"
    );

  }



  // Owner has full access

  if (
    document.owner.toString()
    ===
    userId.toString()
  ) {

    return {
      permission: "owner"
    };

  }



  const share =
    await DocumentShare.findOne({

      documentId,
      userId

    });



  if (!share) {

    throw new ApiError(
      403,
      "You don't have permission"
    );

  }



  return share;

};







/**
 * Permission helper
 */
export const hasPermission = async (
  documentId,
  userId,
  requiredPermission
) => {


  const access =
    await checkPermission(
      documentId,
      userId
    );


  if (access.permission === "owner") {
    return true;
  }



  const levels = {

    viewer: 1,
    commenter: 2,
    editor: 3

  };



  if (
    levels[access.permission]
    >=
    levels[requiredPermission]
  ) {

    return true;

  }



  return false;

};