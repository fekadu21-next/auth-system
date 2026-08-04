import {
  getLatestVersion,
  getVersionsByDocument,
  getVersionById,
  createVersion,
  updateDocumentContent,
  renameVersion,
} from "../Repositories/version.repository.js";
import { clearYjsDocument } from "../config/yjs.js";

// Version cadence (Google-Docs-style): versions are snapshots, not every keystroke
const MIN_LARGE_INTERVAL_MS = 30 * 1000; // large change: allow every 30s
const MIN_MEDIUM_INTERVAL_MS = 90 * 1000; // medium change: every 90s
const MIN_SMALL_INTERVAL_MS = 180 * 1000; // small change: every 3 min

/**
 * Extract plain text from TipTap / ProseMirror JSON.
 * Used for empty + duplicate detection.
 */
export const extractPlainText = (content) => {
  if (!content || typeof content !== "object") return "";

  const parts = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;

    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text);
    }

    if (node.type === "hardBreak") {
      parts.push("\n");
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  };

  walk(content);

  return parts.join("").trim();
};

/**
 * A document is "empty" when it has no text at all.
 * We never create a version for empty content.
 */
const isContentEmpty = (content) => {
  return extractPlainText(content).length === 0;
};

/**
 * Classify how meaningful a change is.
 */
const getChangeSize = (oldText, newText) => {
  const change = Math.abs(newText.length - oldText.length);
  const percent =
    oldText.length > 0 ? (change / oldText.length) * 100 : change > 0 ? 100 : 0;

  if (change > 200 || percent > 30) return "large";
  if (change > 40 || percent > 10) return "medium";
  return "small";
};

const getCooldown = (size) => {
  if (size === "large") return MIN_LARGE_INTERVAL_MS;
  if (size === "medium") return MIN_MEDIUM_INTERVAL_MS;
  return MIN_SMALL_INTERVAL_MS;
};

/**
 * Smart version decision engine.
 *
 * A version is created ONLY if ALL of these are true:
 *  1. Content is NOT empty
 *  2. Content is DIFFERENT from the last saved version (no duplicates)
 *  3. Enough time has passed since the last version (not too frequent),
 *     OR the change is large and was forced.
 *
 * @returns {{ created: boolean, reason: string, version?: object, changeSize?: string }}
 */
export const maybeCreateVersion = async ({
  documentId,
  content,
  userId,
  changeSummary = "",
  meta = {},
  force = false,
}) => {
  // Rule 1: never save empty content
  if (isContentEmpty(content)) {
    return { created: false, reason: "empty" };
  }

  const text = extractPlainText(content);
  const latest = await getLatestVersion(documentId);

  // Rule 2: never save a duplicate of the last version
  if (latest) {
    const latestText = extractPlainText(latest.content);
    if (latestText === text) {
      return { created: false, reason: "duplicate" };
    }
  }

  // Rule 3: don't create versions too frequently
  const changeSize = getChangeSize(
    latest ? extractPlainText(latest.content) : "",
    text
  );

  if (!force) {
    const cooldown = getCooldown(changeSize);
    const timeSinceLast = latest
      ? Date.now() - new Date(latest.createdAt).getTime()
      : Infinity;

    if (latest && timeSinceLast < cooldown) {
      return { created: false, reason: "cooldown", changeSize };
    }
  }

  // Rule 4: only now do we create a full snapshot version
  const versionNumber = latest ? latest.versionNumber + 1 : 1;

  const summary =
    changeSummary ||
    (changeSize === "large"
      ? "Large edit"
      : changeSize === "medium"
      ? "Substantial edit"
      : "Minor edit");

  const version = await createVersion({
    documentId,
    versionNumber,
    content,
    createdBy: userId,
    changeSummary: summary,
    meta: {
      changeSize,
      operations: 1,
      type: changeSize === "large" ? "structural_change" : "content_edit",
      ...meta,
    },
  });

  return { created: true, reason: "created", version, changeSize };
};

// SAVE VERSION (manual endpoint, uses the same rules)
export const saveVersionService = async ({
  documentId,
  content,
  userId,
  changeSummary = "",
  meta = {},
}) => {
  return await maybeCreateVersion({
    documentId,
    content,
    userId,
    changeSummary,
    meta,
  });
};

// GET ALL VERSIONS
export const getVersionsService = async (documentId) => {
  return await getVersionsByDocument(documentId);
};

// RENAME VERSION
export const renameVersionService = async (versionId, name) => {
  const trimmed = String(name || "").trim();

  if (!trimmed) {
    throw new Error("Version name is required");
  }

  const version = await renameVersion(versionId, trimmed);

  if (!version) {
    throw new Error("Version not found");
  }

  return version;
};

// RESTORE VERSION
export const restoreVersionService = async (versionId, userId) => {
  const version = await getVersionById(versionId);

  if (!version) {
    throw new Error("Version not found");
  }

  // Safety net: never let an empty snapshot wipe the current document
  if (isContentEmpty(version.content)) {
    throw new Error("This version is empty and cannot be restored");
  }

  // Replace the live document content with the full snapshot
  await updateDocumentContent(version.documentId, version.content, {
    currentVersion: version.versionNumber,
    lastEditedBy: userId,
  });

  // Clear in-memory Yjs state so all clients reload restored content from DB
  await clearYjsDocument(version.documentId);

  return {
    ...version.toObject(),
    documentId: version.documentId,
    content: version.content,
  };
};
