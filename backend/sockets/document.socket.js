import Document from "../Models/Documents.js";
import { maybeCreateVersion } from "../services/version.service.js";
import {
  joinPresenceService,
  leavePresenceService,
  updateCursorService,
  updateTypingService,
} from "../services/presence.service.js";
// =====================================
// IN-MEMORY TYPING TRACKER (server-authoritative)
//
// The client only *signals* that it is typing and includes its own identity
// (name/email/color) so peers can render the indicator instantly without a DB
// round-trip. The server owns the truth:
// - Every "typing" signal resets an auto-expiry timer for that SOCKET.
// - After every change the server broadcasts a full `typing-users` snapshot
//   (the deduped list of typing users) to the rest of the room — never back to
//   the acting socket — so every peer always renders the correct names,
//   including users who join while someone is already typing.
// - When the timer fires (or the client sends isTyping:false, or the socket
//   disconnects) a new snapshot is broadcast so the indicator clears
//   immediately — exactly like Telegram / Google Docs.
// - The DB is only persisted on state transitions (best effort, non-blocking).
// =====================================
const TYPING_TIMEOUT = 4000; // ms — auto-clear if the client goes quiet

// documentId -> Map<socketId, { userId, name, email, color, timer }>
const typingSockets = new Map();
// socketId -> { userId, documentIds: Set } — lets us clean up on disconnect
const socketInfo = new Map();

// Collapse the per-socket map into a deduped list of typing users (one entry
// per userId even if the same user has several tabs/sockets open).
const getTypingUsers = (roomKey) => {
  const sockets = typingSockets.get(roomKey);
  if (!sockets || sockets.size === 0) return [];
  const byUser = new Map();
  sockets.forEach((entry) => {
    const key = String(entry.userId);
    if (!byUser.has(key)) {
      byUser.set(key, {
        userId: entry.userId,
        name: entry.name || "",
        email: entry.email || "",
        color: entry.color || "",
      });
    }
  });
  return Array.from(byUser.values());
};

// Broadcast the current typing snapshot. `exceptSocketId` keeps the acting
// socket out of its own broadcast (the client also self-filters by userId, so
// a snapshot that accidentally includes the actor is harmless too).
const broadcastTyping = ({ io, roomKey, exceptSocketId }) => {
  const users = getTypingUsers(roomKey);
  const payload = { documentId: roomKey, users };
  if (exceptSocketId) {
    io.to(roomKey).except(exceptSocketId).emit("typing-users", payload);
  } else {
    io.to(roomKey).emit("typing-users", payload);
  }
};

// Remove a socket's typing state and re-broadcast the snapshot.
const clearTypingForSocket = ({ io, socket, documentId }) => {
  const roomKey = String(documentId);
  const sockets = typingSockets.get(roomKey);
  if (!sockets) return;

  const entry = sockets.get(socket.id);
  if (!entry) return;

  clearTimeout(entry.timer);
  sockets.delete(socket.id);
  if (sockets.size === 0) typingSockets.delete(roomKey);

  // Best-effort DB sync so a late-joining client sees the correct state.
  updateTypingService({ documentId, userId: entry.userId, isTyping: false }).catch(
    (err) => console.error("Typing persist error:", err.message)
  );

  broadcastTyping({ io, roomKey, exceptSocketId: socket.id });
};

const registerDocumentSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // JOIN DOCUMENT + PRESENCE

    socket.on("join-document", async ({ documentId, userId }) => {
      try {
        socket.join(documentId);

        console.log(`User ${userId} joined document ${documentId}`);

        // Track which rooms this socket is in so we can clean up on disconnect
        const info = socketInfo.get(socket.id) || { userId, documentIds: new Set() };
        info.userId = userId;
        info.documentIds.add(String(documentId));
        socketInfo.set(socket.id, info);

        // SAVE PRESENCE + GET USERS
        const users = await joinPresenceService({
          documentId,
          userId,
          socketId: socket.id,
        });

        // BROADCAST USERS ONLINE
        io.to(documentId).emit("users-online", users);

        // Send the current typing snapshot so a late joiner immediately sees
        // who is already typing (names travel with the event, no roster lookups).
        socket.emit("typing-users", {
          documentId: String(documentId),
          users: getTypingUsers(String(documentId)),
        });
      } catch (error) {
        console.error("Join error:", error.message);
      }
    });

    // =====================================
    // LOAD DOCUMENT
    // =====================================
    socket.on("get-document", async (documentId) => {
      try {
        const document = await Document.findById(documentId);

        if (!document) {
          socket.emit("load-document", {});
          return;
        }

        socket.emit("load-document", document.content);
      } catch (error) {
        console.error("Load error:", error.message);
      }
    });

    // =====================================
    // REAL-TIME CHANGES
    // =====================================
    socket.on("send-changes", ({ documentId, changes, userId }) => {
      try {
        socket.to(documentId).emit("receive-changes", changes);
      } catch (error) {
        console.error("Change error:", error.message);
      }
    });

    // =====================================
    // COMMENTS SYNC
    // =====================================
    socket.on("comments-updated", ({ documentId }) => {
      try {
        socket.to(documentId).emit("comments-updated");
      } catch (error) {
        console.error("Comments sync error:", error.message);
      }
    });

    // =====================================
    // CURSOR MOVEMENT (LIVE)
    // =====================================
    socket.on(
      "cursor-change",
      async ({ documentId, userId, cursor, selection }) => {
        try {
          const users = await updateCursorService({
            documentId,
            userId,
            cursor,
            selection,
          });

          io.to(documentId).emit("users-online", users);
        } catch (error) {
          console.error("Cursor error:", error.message);
        }
      }
    );

    // =====================================
    // TYPING STATUS (fast deltas + server auto-expiry)
    // =====================================
    socket.on("typing", ({ documentId, userId, name, email, color, isTyping }) => {
      try {
        const roomKey = String(documentId);
        if (!typingSockets.has(roomKey)) typingSockets.set(roomKey, new Map());
        const sockets = typingSockets.get(roomKey);

        // Clear any existing expiry timer for this socket
        const existing = sockets.get(socket.id);
        if (existing) clearTimeout(existing.timer);

        if (isTyping) {
          const timer = setTimeout(() => {
            // Client went quiet without saying "stopped" — force-clear
            clearTypingForSocket({ io, socket, documentId });
          }, TYPING_TIMEOUT);

          sockets.set(socket.id, { userId, name, email, color, timer });
          socketInfo.set(socket.id, {
            ...(socketInfo.get(socket.id) || {}),
            userId,
          });

          // Instant snapshot broadcast — no DB round-trip before peers see it
          broadcastTyping({ io, roomKey, exceptSocketId: socket.id });
        } else {
          sockets.delete(socket.id);
          if (sockets.size === 0) typingSockets.delete(roomKey);
          broadcastTyping({ io, roomKey, exceptSocketId: socket.id });
        }

        // Persist transition to the DB (non-blocking, doesn't delay the broadcast)
        updateTypingService({ documentId, userId, isTyping }).catch((err) =>
          console.error("Typing persist error:", err.message)
        );
      } catch (error) {
        console.error("Typing error:", error.message);
      }
    });

    // =====================================
    // AUTO SAVE + VERSION HISTORY
    // =====================================
    socket.on("save-document", async ({ documentId, content, userId }) => {
      try {
        console.log("💾 Saving document:", documentId, "for user:", userId);

        // UPDATE MAIN DOCUMENT
        const updatedDoc = await Document.findByIdAndUpdate(documentId, {
          content,
          lastEditedBy: userId,
        }, { new: true });

        if (updatedDoc) {
          console.log("✅ Document saved successfully to database");
          // Don't broadcast content - Yjs handles real-time sync automatically
          // Just broadcast a notification that save happened
          io.to(documentId).emit("document-saved", { documentId });
        } else {
          console.error("❌ Document not found for save:", documentId);
        }

        // ===== VERSION HISTORY (smart engine, no empty/duplicate spam) =====
        const result = await maybeCreateVersion({ documentId, content, userId });

        if (result.created) {
          await Document.findByIdAndUpdate(documentId, {
            currentVersion: result.version.versionNumber,
          });
          console.log(
            `📌 Auto-saved + version ${result.version.versionNumber} created (${result.changeSize})`
          );
        } else {
          console.log(`💾 Auto-saved (no version: ${result.reason})`);
        }
      } catch (error) {
        console.error("Save error:", error.message);
      }
    });

    // =====================================
    // DOCUMENT RENAME (REAL-TIME UPDATE)
    // =====================================
    socket.on("document-renamed", async ({ documentId, title, userId }) => {
      try {
        console.log("📝 Document renamed:", documentId, "to:", title, "by:", userId);
        
        // Broadcast to all users in the document room
        io.to(documentId).emit("document-renamed", { documentId, title });
        
        // Also broadcast to all connected users (for dashboard updates)
        io.emit("document-updated", { documentId, title, type: 'rename' });
      } catch (error) {
        console.error("Rename broadcast error:", error.message);
      }
    });

    // =====================================
    // DOCUMENT DELETED (REAL-TIME UPDATE)
    // =====================================
    socket.on("document-deleted", async ({ documentId, userId }) => {
      try {
        console.log("🗑️ Document deleted:", documentId, "by:", userId);
        
        // Broadcast to all connected users
        io.emit("document-deleted", { documentId });
      } catch (error) {
        console.error("Delete broadcast error:", error.message);
      }
    });

    // =====================================
    // DISCONNECT (REMOVE PRESENCE + CLEAR TYPING)
    // =====================================
    socket.on("disconnect", async () => {
      try {
        // Force-clear typing for every document this socket was in
        const info = socketInfo.get(socket.id);
        if (info) {
          info.documentIds.forEach((docId) => {
            clearTypingForSocket({ io, socket, documentId: docId });
          });
          socketInfo.delete(socket.id);
        }

        const users = await leavePresenceService(socket.id);

        if (users && users.length > 0) {
          const documentId = users[0].documentId;

          io.to(documentId).emit("users-online", users);
        }

        console.log("🔴 Disconnected:", socket.id);
      } catch (error) {
        console.error("Disconnect error:", error.message);
      }
    });
  });
};

export default registerDocumentSocket;