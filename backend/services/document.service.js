import documentRepository from "../repositories/document.repository.js";
import DocumentShare from "../Models/DocumentShare.js";
import Document from "../Models/Documents.js";
import { hasPermission } from "./documentShare.service.js";
import { maybeCreateVersion } from "./version.service.js";


class DocumentService {



  async createDocument(userId, data) {


    const document =
      await documentRepository.create({

        title: data.title,

        owner: userId,

        lastEditedBy: userId,

        content: {}

      });


    return document;

  }





  async getDocument(id, userId) {


    const document =
      await documentRepository.findById(id);


    if (!document) {

      throw new Error(
        "Document not found"
      );

    }


    // permission checking later:
    // owner or shared user


    return document;

  }





  async getMyDocuments(userId) {
    return await Document.find({ owner: userId, isDeleted: false })
      .populate("owner", "name email avatar")
      .sort({ updatedAt: -1 });
  }

  async getSharedWithMe(userId) {
    const shares = await DocumentShare.find({ userId }).populate({
      path: "documentId",
      populate: { path: "owner", select: "name email avatar" }
    });
    // Filter out deleted documents
    return shares
      .filter(share => share.documentId && !share.documentId.isDeleted)
      .map(share => ({ 
        ...share.documentId.toObject(), 
        sharePermission: share.permission 
      }));
  }

  async getRecentDocuments(userId) {
    // Recent can be defined as owned or shared documents recently updated
    const owned = await Document.find({ owner: userId, isDeleted: false })
      .populate("owner", "name email avatar")
      .sort({ updatedAt: -1 })
      .limit(5);
    const shares = await DocumentShare.find({ userId }).populate({
      path: "documentId",
      populate: { path: "owner", select: "name email avatar" }
    }).limit(5);
    
    // Add sharePermission to shared documents and filter out deleted ones
    const sharedWithPermission = shares
      .filter(share => share.documentId && !share.documentId.isDeleted)
      .map(share => ({ 
        ...share.documentId.toObject(), 
        sharePermission: share.permission 
      }));
    
    // Combine owned and shared, ensuring no duplicates
    let all = [...owned, ...sharedWithPermission].filter(Boolean);
    
    // Remove duplicates by _id (prefer owned version)
    const seen = new Set();
    all = all.filter(doc => {
      if (seen.has(doc._id.toString())) {
        return false;
      }
      seen.add(doc._id.toString());
      return true;
    });
    
    all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return all.slice(0, 5);
  }

  // Cleanup orphaned shares for deleted documents
  async cleanupOrphanedShares() {
    // Find all shares where the document is deleted
    const deletedDocumentIds = await Document.find({ isDeleted: true }).select('_id');
    const deletedIds = deletedDocumentIds.map(doc => doc._id);
    
    if (deletedIds.length > 0) {
      const result = await DocumentShare.deleteMany({ documentId: { $in: deletedIds } });
      console.log(`Cleaned up ${result.deletedCount} orphaned shares for deleted documents`);
      return result.deletedCount;
    }
    
    return 0;
  }





  async renameDocument(
    documentId,
    userId,
    title
  ) {


    const document =
      await documentRepository
        .findById(documentId);



    if (!document) {

      throw new Error(
        "Document not found"
      );

    }



    // Allow both owner and editor to rename
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    const userIdStr = userId.toString();
    const isOwner = ownerId === userIdStr;
    const canEdit = await hasPermission(documentId, userId, "editor");

    if (!isOwner && !canEdit) {
      throw new Error(
        "Only owner or editor can rename"
      );
    }



    return await documentRepository.update(
      documentId,
      {
        title,
        lastEditedBy: userId
      }
    );



  }






  async deleteDocument(
    documentId,
    userId
  ) {


    const document =
      await documentRepository
        .findById(documentId);

    console.log("Delete attempt - Document ID:", documentId, "User ID:", userId);
    console.log("Document found:", !!document);
    if (document) {
      console.log("Document owner:", document.owner);
      console.log("Document owner type:", typeof document.owner);
      // Handle both populated object and plain ID
      const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
      console.log("Extracted owner ID:", ownerId);
      console.log("User ID:", userId.toString());
      console.log("User ID type:", typeof userId);
      console.log("Match:", ownerId === userId.toString());
    }

    if (!document) {

      throw new Error(
        "Document not found"
      );

    }

    // Handle both populated object and plain ID
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    const userIdStr = userId.toString();

    console.log("Final comparison - Owner ID:", ownerId, "User ID:", userIdStr, "Equal:", ownerId === userIdStr);

    if (
      ownerId !== userIdStr
    ) {

      throw new Error(
        "Only owner can delete"
      );

    }

    // Delete all document shares for this document
    await DocumentShare.deleteMany({ documentId });



    return await documentRepository
      .softDelete(documentId);



  }






  async duplicateDocument(
    documentId,
    userId
  ) {



    const document =
      await documentRepository
        .findById(documentId);



    if (!document) {

      throw new Error(
        "Document not found"
      );

    }

    // Only owner or editor can duplicate
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    const userIdStr = userId.toString();
    const isOwner = ownerId === userIdStr;
    const canEdit = await hasPermission(documentId, userId, "editor");

    if (!isOwner && !canEdit) {
      throw new Error(
        "Only owner or editor can duplicate"
      );
    }



    return await documentRepository
      .duplicate({
        ...document.toObject(),
        newOwner: userId
      });


  }






  async updateContent(
    documentId,
    userId,
    content
  ) {

    const canEdit = await hasPermission(documentId, userId, "editor");
    if (!canEdit) {
      throw new Error("You don't have permission to edit this document");
    }

    const document =
      await documentRepository
        .findById(documentId);



    if (!document) {

      throw new Error(
        "Document not found"
      );

    }

    console.log("📝 Updating content for document:", documentId, "by user:", userId);

    const updated = await documentRepository.update(
      documentId,
      {
        content,
        lastEditedBy: userId,
      }
    );

    // Auto-save only stores the current state.
    // The smart version engine decides if this is a meaningful checkpoint.
    const result = await maybeCreateVersion({ documentId, content, userId });

    if (result.created) {
      await documentRepository.update(documentId, {
        currentVersion: result.version.versionNumber,
      });
      console.log(
        `📌 Version ${result.version.versionNumber} created (${result.changeSize} change)`
      );
    } else {
      console.log(`💾 Auto-saved (no version: ${result.reason})`);
    }

    console.log("✅ Document content updated successfully");
    return updated;

  }




  async updatePageSettings(
    documentId,
    userId,
    pageNumberSettings
  ) {

    const canEdit = await hasPermission(documentId, userId, "editor");
    if (!canEdit) {
      throw new Error("You don't have permission to change this document's page settings");
    }

    const document =
      await documentRepository
        .findById(documentId);

    if (!document) {
      throw new Error(
        "Document not found"
      );
    }

    console.log("📄 Updating page settings for document:", documentId, "by user:", userId);

    const updated = await documentRepository.update(
      documentId,
      {
        pageNumberSettings,
        lastEditedBy: userId,
      }
    );

    console.log("✅ Page settings updated successfully");
    return updated;

  }


}


export default new DocumentService();