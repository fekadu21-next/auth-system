import DocumentVersion from "../Models/DocumentVersion.js";
import Document from "../Models/Documents.js";

// Get latest version number
export const getLatestVersionNumber = async (documentId) => {
  const latest = await DocumentVersion.findOne({ documentId })
    .sort({ versionNumber: -1 });

  return latest ? latest.versionNumber : 0;
};

// Get the most recent version document (full record)
export const getLatestVersion = async (documentId) => {
  return await DocumentVersion.findOne({ documentId }).sort({
    versionNumber: -1,
  });
};

// Create new version with version limit (keep last 50 versions)
export const createVersion = async (data) => {
  const MAX_VERSIONS = 50; // Keep only last 50 versions
  
  // Create the new version
  const newVersion = await DocumentVersion.create(data);
  
  // Count versions for this document
  const versionCount = await DocumentVersion.countDocuments({ documentId: data.documentId });
  
  // If we exceed the limit, delete oldest versions
  if (versionCount > MAX_VERSIONS) {
    const versionsToDelete = versionCount - MAX_VERSIONS;
    
    // Find and delete oldest versions (lowest version numbers)
    const oldVersions = await DocumentVersion.find({ documentId: data.documentId })
      .sort({ versionNumber: 1 })
      .limit(versionsToDelete)
      .select('_id');
    
    const oldVersionIds = oldVersions.map(v => v._id);
    
    if (oldVersionIds.length > 0) {
      await DocumentVersion.deleteMany({ _id: { $in: oldVersionIds } });
      console.log(`🗑️ Deleted ${oldVersionIds.length} old versions to maintain limit of ${MAX_VERSIONS}`);
    }
  }
  
  return newVersion;
};

// Get all versions
export const getVersionsByDocument = async (documentId) => {
  return await DocumentVersion.find({ documentId })
    .populate("createdBy", "name email")
    .sort({ versionNumber: -1 });
};

// Get single version
export const getVersionById = async (id) => {
  return await DocumentVersion.findById(id);
};

// Rename a version (custom label shown in the version history list)
export const renameVersion = async (versionId, name) => {
  return await DocumentVersion.findByIdAndUpdate(
    versionId,
    { name },
    { new: true }
  );
};

// Update document content (optionally other fields like currentVersion/lastEditedBy)
export const updateDocumentContent = async (documentId, content, extra = {}) => {
  return await Document.findByIdAndUpdate(
    documentId,
    { content, ...extra },
    { new: true }
  );
};