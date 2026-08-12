import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import { socket } from "../../socket";
import { getStandardExtensions, getCollaborationExtensions } from "./extensions.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://collaboration-editor-yfm8.onrender.com";

/**
 * Editor Config Hook
 * 
 * 🧠 Concept: This is the core logic of editor setup
 * 
 * What it does:
 * - Creates TipTap editor
 * - Loads extensions
 * - Connects collaboration (Yjs)
 * 
 * Responsibilities:
 * - Editor configuration
 * - Plugins setup
 * - Collaboration enable
 * - Auto-save logic
 * - Content seeding
 * 
 * 💡 Think: "How editor behaves internally"
 * 
 * @param {Object} config - Editor configuration
 * @param {Object} config.ydoc - Yjs document
 * @param {Object} config.provider - Socket.IO provider
 * @param {string} config.documentId - Document ID
 * @param {string} config.userId - User ID
 * @param {string} config.userName - User name (used for caret labels)
 * @param {string} [config.userEmail] - User email (used for typing indicator identity)
 * @param {string} [config.userDisplayName] - Full display name (used for typing indicator)
 * @param {string} config.userColor - User color
 * @param {boolean} config.canEdit - Whether user can edit
 * @param {Object} config.initialContent - Initial content to seed
 * @returns {Object} { editor, seededRef }
 */
export const useEditorConfig = ({
  ydoc,
  provider,
  documentId,
  userId,
  userName,
  userEmail,
  userDisplayName,
  userColor,
  canEdit,
  initialContent,
}) => {
  const seededRef = useRef(false);

  // Don't create editor until ydoc and provider are ready
  // This prevents the "Cannot read properties of null (reading 'getXmlFragment')" error
  const editor = useEditor({
    extensions: [
      ...getStandardExtensions(),
      ...(ydoc && provider ? getCollaborationExtensions(ydoc, provider, userName, userColor) : []),
    ],
    editable: canEdit,
    immediatelyRender: true,
    editorProps: {
      attributes: { class: "doc-editor-content focus:outline-none" },
    },
  }, [documentId, ydoc, provider, canEdit, userName, userColor]);

  // Seed content from database only if Yjs fragment is empty.
  // Any user can seed an empty fragment - this makes restore reliable even
  // when the owner is offline (restored content always comes from the DB).
  useEffect(() => {
    if (!editor || editor.isDestroyed || !initialContent || seededRef.current || !provider || !ydoc) return;

    const trySeed = () => {
      if (seededRef.current) return;
      
      console.log("🌱 Checking if we need to seed content");
      
      if (!initialContent || Object.keys(initialContent).length === 0) {
        console.log("⚠️ No content to seed");
        seededRef.current = true;
        return;
      }

      const fragment = ydoc.getXmlFragment("default");
      console.log("📊 Fragment length:", fragment.length, "Editor empty:", editor.isEmpty);
      
      // CRITICAL: Only seed if Yjs fragment is completely empty
      // This prevents overwriting content that other users already synced
      if (fragment.length === 0) {
        console.log("📝 Yjs fragment is empty, seeding from database");
        editor.commands.setContent(initialContent, false);
        seededRef.current = true;
      } else {
        console.log("ℹ️ Yjs fragment already has content, trusting Yjs sync");
        seededRef.current = true;
      }
    };

    // Wait for Yjs to sync before checking
    const handler = (isSynced) => {
      if (isSynced === true || (Array.isArray(isSynced) && isSynced[0] === true)) {
        setTimeout(() => {
          trySeed();
        }, 1500);
      }
    };

    if (provider.synced) {
      setTimeout(() => {
        trySeed();
      }, 1500);
    } else {
      provider.on("sync", handler);
      return () => provider.off("sync", handler);
    }
  }, [editor, initialContent, provider, ydoc]);

  // =====================================
  // AUTO-SAVE (continuous backup)
  // =====================================
  // 
  // Core Concept: "Auto-save frequently, version rarely"
  //
  // Auto-save:
  // - Saves current content to the DB shortly after each edit (debounced)
  // - Also flushes periodically while edits are pending
  // - This is a safety backup, NOT a version
  //
  // Version creation:
  // - Decided entirely on the BACKEND by the smart version engine:
  //   no empty versions, no duplicate versions, no version spam
  // =====================================

  useEffect(() => {
    if (!editor || editor.isDestroyed || !documentId) return;

    let dirty = false;
    let saveTimer = null;
    let periodicTimer = null;

    const saveContent = async () => {
      if (!editor || editor.isDestroyed) return;
      const content = editor.getJSON();
      try {
        const response = await fetch(`${API_URL}/api/documents/${documentId}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          dirty = false;
          console.log("💾 Content auto-saved to database");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    };

    const onUpdate = () => {
      dirty = true;
      // Debounce: save shortly after the user pauses typing
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveContent, 3000);
    };

    // Periodic flush: guarantees progress is saved even during continuous typing
    periodicTimer = setInterval(() => {
      if (dirty) saveContent();
    }, 8000);

    // Listen for editor updates
    editor.on("update", onUpdate);

    // Cleanup
    return () => {
      clearTimeout(saveTimer);
      clearInterval(periodicTimer);
      editor.off("update", onUpdate);
      // Flush any pending changes on unmount
      if (dirty) saveContent();
    };
  }, [editor, documentId]);

  // Typing indicator via presence socket.
  //
  // Telegram-style signaling: send `typing: true` on the FIRST keystroke after
  // an idle period, then only a low-frequency "heartbeat" while the user keeps
  // typing (so we don't flood the socket on every keystroke). After a short
  // idle gap we send `typing: false`. The server ALSO auto-expires typing after
  // a timeout, so a dropped tab can never leave a stuck "is typing" state.
  useEffect(() => {
    if (!editor || editor.isDestroyed || !canEdit || !documentId || !userId) return;

    const TYPING_HEARTBEAT = 2500; // ms between keep-alive signals while typing
    const TYPING_STOP_DELAY = 1500; // ms after last keystroke to declare "stopped"

    let typing = false;
    let heartbeatTimer = null;
    let stopTimer = null;

    const clearTypingTimers = () => {
      clearTimeout(stopTimer);
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    };

    const sendTyping = (value) => {
      if (typing === value) return; // no-op if state didn't change
      typing = value;
      socket.emit("typing", {
        documentId,
        userId,
        name: userDisplayName || userName || "",
        email: userEmail || "",
        color: userColor || "",
        isTyping: value,
      });
    };

    const stopTyping = () => {
      clearTypingTimers();
      sendTyping(false);
    };

    const onUpdate = ({ transaction, appendedTransactions = [] }) => {
      // IMPORTANT: Only count the user's OWN edits as "typing".
      // y-prosemirror applies remote collaborators' changes (and our own Yjs
      // echo) with `addToHistory: false` on the transaction. A remote update
      // would otherwise make this client broadcast a false "is typing" signal
      // back to the user who actually typed — the exact bug where typing makes
      // unrelated collaborators appear as "typing".
      const trs = [transaction, ...appendedTransactions].filter(Boolean);
      if (trs.length > 0 && trs.every((tr) => tr.getMeta?.("addToHistory") === false)) {
        return;
      }
      if (!typing) {
        sendTyping(true);
        heartbeatTimer = setInterval(() => {
          socket.emit("typing", {
            documentId,
            userId,
            name: userDisplayName || userName || "",
            email: userEmail || "",
            color: userColor || "",
            isTyping: true,
          });
        }, TYPING_HEARTBEAT);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(stopTyping, TYPING_STOP_DELAY);
    };

    const onSelectionUpdate = () => {
      if (!editor) return;
      const { from, to } = editor.state.selection;

      let line = 0;
      let column = 0;
      try {
        const resolvedPos = editor.state.doc.resolve(from);
        line = resolvedPos.index(0); // approximate line/block
        column = resolvedPos.parentOffset;
      } catch {
        // ignore
      }

      socket.emit("cursor-change", {
        documentId,
        userId,
        cursor: { line, column },
        selection: { start: from, end: to },
      });
    };

    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onSelectionUpdate);

    return () => {
      clearTypingTimers();
      sendTyping(false); // tell peers we're gone even on unmount
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor, canEdit, documentId, userId, userName, userEmail, userDisplayName, userColor]);

  // Update caret user info when props change
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.commands.updateUser?.({ name: userName, color: userColor });
  }, [editor, userName, userColor]);

  // Listen for document-saved events from other users
  // Note: Yjs handles real-time sync automatically, so we only use this
  // to update the UI status, not to set content (which would cause duplication)
  useEffect(() => {
    if (!documentId) return;

    const onDocumentSaved = ({ documentId: savedDocId }) => {
      if (savedDocId === documentId) {
        console.log("📥 Document saved notification received");
        // Yjs automatically syncs content, so we don't need to manually set it
        // This prevents duplication
      }
    };

    socket.on("document-saved", onDocumentSaved);
    return () => socket.off("document-saved", onDocumentSaved);
  }, [documentId]);

  return { editor, seededRef };
};
