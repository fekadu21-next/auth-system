import {
  saveVersionService,
  getVersionsService,
  restoreVersionService,
  renameVersionService,
} from "../services/version.service.js";
import {
  validateCreateVersion,
  validateRestoreVersion,
  validateRenameVersion,
} from "../validators/version.validator.js";

// SAVE VERSION
export const saveVersion = async (req, res) => {
  try {
    validateCreateVersion(req.body);

    const { documentId, content, changeSummary, meta } = req.body;

    const result = await saveVersionService({
      documentId,
      content,
      userId: req.user.id,
      changeSummary,
      meta,
    });

    if (!result.created) {
      return res.json({
        success: true,
        created: false,
        reason: result.reason,
        message: `No version created (${result.reason})`,
      });
    }

    res.status(201).json({
      success: true,
      created: true,
      data: result.version,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET VERSIONS
export const getVersions = async (req, res) => {
  try {
    const { documentId } = req.params;

    const versions = await getVersionsService(documentId);

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESTORE VERSION
export const restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    validateRestoreVersion(versionId);

    const version = await restoreVersionService(versionId, req.user.id);

    // Tell every connected client to reload so they all show the restored content
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(String(version.documentId)).emit("document-restored", {
          documentId: version.documentId,
        });
      }
    } catch (e) {
      console.error("Restore broadcast error:", e.message);
    }

    res.json({
      success: true,
      message: "Version restored successfully",
      data: version,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// RENAME VERSION
export const renameVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { name } = req.body;

    validateRenameVersion(versionId, name);

    const version = await renameVersionService(versionId, name);

    res.json({
      success: true,
      message: "Version renamed successfully",
      data: version,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
