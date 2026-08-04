import { useState, useEffect, useMemo, useCallback } from "react";
import { API_URL } from "../api.js";
import { socket } from "../socket.js";
import { useUi } from "../Componnts/useUi.js";
import { getUserColor } from "../utils/userColor.js";

// Client-side safety net: even if a `typing-users` snapshot is lost, a stale
// entry is removed once it is older than this.
const TYPING_STALE_MS = 5000;

/**
 * useDocumentFeatures
 *
 * 🧠 Role: ALL collaboration features for the document page
 *
 * 🔹 A. Comments — fetch, add, reply, resolve, delete
 * 🔹 B. Notifications — fetch, unread count, mark read / all read
 * 🔹 C. Versions — fetch, restore
 * 🔹 D. Real-time (Socket) — join room, online users, live updates
 *
 * @param {Object} params
 * @param {string} params.documentId - Document ID from the URL
 * @param {Object|null} params.user - Current logged in user
 * @param {string|null} params.currentUserId - Resolved user id
 * @param {Object|null} params.document - Document object (from useDocumentCore)
 */
export function useDocumentFeatures({ documentId, user, currentUserId, document }) {
  const { showToast, confirm } = useUi();
  const [onlineUsers, setOnlineUsers] = useState([]);
  // userId -> { userId, name, email, color, lastAt } — who is typing right now
  const [typingUsers, setTypingUsers] = useState({});
  const [documentUsers, setDocumentUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [highlightIds, setHighlightIds] = useState([]);
  const [commentResetSignal, setCommentResetSignal] = useState(0);
  const [replyResetSignal, setReplyResetSignal] = useState(0);

  // Panel visibility (UI state owned here so toggles can bundle side-effects)
  const [showComments, setShowComments] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // ---------- FETCHERS ----------

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${currentUserId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user, currentUserId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread/${currentUserId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user, currentUserId]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${documentId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [documentId]);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/versions/${documentId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [documentId]);

  const fetchDocumentUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/shares/${documentId}/shared-users`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDocumentUsers(data.data?.map((s) => s.userId) || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [documentId]);

  // ---------- SOCKET: notifications ----------

  useEffect(() => {
    if (!user || !currentUserId) return;

    socket.emit("register-user", currentUserId);
    Promise.resolve().then(() => {
      fetchNotifications();
      fetchUnreadCount();
    });

    const onConnect = () => socket.emit("register-user", currentUserId);
    socket.on("connect", onConnect);

    return () => socket.off("connect", onConnect);
  }, [user, currentUserId, fetchNotifications, fetchUnreadCount]);

  // ---------- SOCKET: presence + live updates ----------

  useEffect(() => {
    if (!documentId || !user) return;

    const joinRoom = () =>
      socket.emit("join-document", { documentId, userId: currentUserId });
    joinRoom();

    const onUsersOnline = (users) => setOnlineUsers(users || []);
    // The server broadcasts the full snapshot of who is typing (with their
    // identity included) on every start/stop/heartbeat. We replace the whole
    // state so late joiners and multi-tab users always converge correctly.
    const onTypingUsers = ({ documentId: dId, users }) => {
      if (String(dId) !== String(documentId)) return;
      const myKey = String(currentUserId || "");
      const next = {};
      (users || []).forEach((u) => {
        const key = String(u.userId);
        // Never show your own typing indicator
        if (key === myKey) return;
        if (!next[key]) {
          next[key] = {
            userId: u.userId,
            name: u.name || "Someone",
            email: u.email || "",
            color: u.color || getUserColor(u.name || u.email || "Someone"),
            lastAt: Date.now(),
          };
        }
      });
      setTypingUsers(next);
    };
    const onCommentsUpdated = () => {
      fetchComments();
      fetchNotifications();
      fetchUnreadCount();
    };
    const onNotification = () => {
      fetchNotifications();
      fetchUnreadCount();
    };
    const onDocumentRestored = ({ documentId: restoredDocId }) => {
      if (String(restoredDocId) === String(documentId)) {
        window.location.reload();
      }
    };
    // Fired after notifications are marked read on the server (from any tab),
    // so unread badges stay in sync everywhere without a page refresh.
    const onNotificationsUpdated = () => {
      fetchNotifications();
      fetchUnreadCount();
    };

    socket.on("connect", joinRoom);
    socket.on("users-online", onUsersOnline);
    socket.on("typing-users", onTypingUsers);
    socket.on("comments-updated", onCommentsUpdated);
    socket.on("new-notification", onNotification);
    socket.on("notifications-updated", onNotificationsUpdated);
    socket.on("document-restored", onDocumentRestored);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("users-online", onUsersOnline);
      socket.off("typing-users", onTypingUsers);
      socket.off("comments-updated", onCommentsUpdated);
      socket.off("new-notification", onNotification);
      socket.off("notifications-updated", onNotificationsUpdated);
      socket.off("document-restored", onDocumentRestored);
    };
  }, [documentId, user, currentUserId, fetchComments, fetchNotifications, fetchUnreadCount]);

  // Safety net: prune typing entries whose server heartbeat has gone stale
  // (e.g. a dropped connection never sent typing:false).
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const staleKeys = Object.keys(prev).filter(
          (k) => now - prev[k].lastAt > TYPING_STALE_MS
        );
        if (staleKeys.length === 0) return prev;
        const next = { ...prev };
        staleKeys.forEach((k) => delete next[k]);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---------- NOTIFICATIONS: actions ----------

  const markNotificationRead = useCallback(
    async (notifId) => {
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await fetch(`${API_URL}/api/notifications/read/${notifId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {
        console.error(e);
      }
      fetchUnreadCount();
    },
    [fetchUnreadCount]
  );

  const markAllDocumentRead = useCallback(
    async (types = ["comment", "reply", "mention", "resolve"]) => {
      if (!user || !documentId) return;
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.documentId?._id || n.documentId) === String(documentId) &&
          !n.isRead &&
          (!types || types.includes(n.type))
            ? { ...n, isRead: true }
            : n
        )
      );
      try {
        await fetch(`${API_URL}/api/notifications/read-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: currentUserId,
            documentId,
            types,
          }),
        });
      } catch (e) {
        console.error(e);
      }
      fetchUnreadCount();
    },
    [user, documentId, currentUserId, fetchUnreadCount]
  );

  // ---------- COMMENTS: actions ----------

  const addComment = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;
      try {
        const res = await fetch(`${API_URL}/api/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentId, text }),
        });
        if (res.ok) {
          setCommentResetSignal((s) => s + 1);
          fetchComments();
          socket.emit("comments-updated", { documentId });
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to add comment", "error");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [documentId, fetchComments, showToast]
  );

  const addReply = useCallback(
    async (parentId, text) => {
      if (!text || !text.trim()) return;
      try {
        const res = await fetch(`${API_URL}/api/comments/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentId, text, parentCommentId: parentId }),
        });
        if (res.ok) {
          setReplyResetSignal((s) => s + 1);
          setReplyingTo(null);
          fetchComments();
          socket.emit("comments-updated", { documentId });
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to reply", "error");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [documentId, fetchComments, showToast]
  );

  const resolveComment = useCallback(
    async (commentId) => {
      try {
        const res = await fetch(`${API_URL}/api/comments/resolve/${commentId}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          fetchComments();
          socket.emit("comments-updated", { documentId });
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to resolve", "error");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [documentId, fetchComments, showToast]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      try {
        const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          fetchComments();
          fetchNotifications();
          fetchUnreadCount();
          socket.emit("comments-updated", { documentId });
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to delete", "error");
        }
      } catch (e) {
        console.error(e);
      }
    },
    [documentId, fetchComments, fetchNotifications, fetchUnreadCount, showToast]
  );

  // ---------- VERSIONS: actions ----------

  const restoreVersion = useCallback(
    async (versionId) => {
      const confirmed = await confirm({
        title: "Restore this version?",
        message: "Your current document will be completely replaced by this older version.",
        confirmText: "Restore",
      });
      if (!confirmed) return;
      try {
        const res = await fetch(`${API_URL}/api/versions/restore/${versionId}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          window.location.reload();
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to restore version", "error");
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to restore version", "error");
      }
    },
    [confirm, showToast]
  );

  const renameVersion = useCallback(async (versionId, name) => {
    try {
      const res = await fetch(`${API_URL}/api/versions/rename/${versionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setVersions((prev) =>
          prev.map((v) => (v._id === versionId ? { ...v, name: data.data?.name ?? name } : v))
        );
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to rename version" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Failed to rename version" };
    }
  }, []);

  // ---------- PANELS: open/toggle with side-effects ----------

  const openComments = useCallback(() => {
    setShowComments(true);
    setShowNotifications(false);
    setShowVersions(false);
    fetchComments();
    fetchDocumentUsers();
    const newIds = notifications
      .filter(
        (n) =>
          !n.isRead &&
          String(n.documentId?._id || n.documentId) === String(documentId) &&
          ["comment", "reply", "mention", "resolve"].includes(n.type) &&
          n.commentId
      )
      .map((n) => String(n.commentId));
    if (newIds.length) setHighlightIds(newIds);
    markAllDocumentRead();
  }, [notifications, documentId, fetchComments, fetchDocumentUsers, markAllDocumentRead]);

  const openNotificationsPanel = useCallback(() => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    setShowComments(false);
    setShowVersions(false);
    // Opening the bell counts as "seen": clear this document's badges in real time.
    if (opening) markAllDocumentRead(null);
    fetchUnreadCount();
  }, [showNotifications, markAllDocumentRead, fetchUnreadCount]);

  const openNotification = useCallback(
    (n) => {
      setShowNotifications(false);
      setShowComments(true);
      setShowVersions(false);
      if (n.commentId) {
        setHighlightIds([String(n.commentId)]);
        fetchComments();
      }
      markNotificationRead(n._id);
      markAllDocumentRead(null);
    },
    [fetchComments, markNotificationRead, markAllDocumentRead]
  );

  const toggleVersions = useCallback(() => {
    setShowComments(false);
    setShowNotifications(false);
    setShowVersions((prev) => !prev);
  }, []);

  // Fetch versions when the panel opens
  useEffect(() => {
    if (!showVersions) return;
    const timer = setTimeout(() => fetchVersions(), 0);
    return () => clearTimeout(timer);
  }, [showVersions, fetchVersions]);

  // ---------- DERIVED STATE ----------

  const collaborators = useMemo(() => {
    const map = new Map();
    if (document?.owner?._id) map.set(document.owner._id, document.owner);
    documentUsers.forEach((u) => u?._id && map.set(u._id, u));
    onlineUsers.forEach((u) => {
      const uObj = u.userId || u;
      if (uObj?._id) map.set(uObj._id, uObj);
    });
    if (user) map.delete(currentUserId);
    return Array.from(map.values());
  }, [document, documentUsers, onlineUsers, user, currentUserId]);

  // Notifications belonging to this document (drives the document-page bell).
  const docNotifications = useMemo(
    () =>
      notifications.filter(
        (n) => String(n.documentId?._id || n.documentId) === String(documentId)
      ),
    [notifications, documentId]
  );

  // Unread count for this document's bell (all types).
  const docUnread = useMemo(
    () => docNotifications.filter((n) => !n.isRead).length,
    [docNotifications]
  );

  // The comments badge only counts NEW comments and replies — @mentions show in
  // the notification bell, and "resolved"/"deleted" events are not new comments.
  const commentUnread = useMemo(
    () =>
      docNotifications.filter((n) => !n.isRead && ["comment", "reply"].includes(n.type))
        .length,
    [docNotifications]
  );

  // Scroll to + highlight the comments referenced by notifications
  useEffect(() => {
    if (!highlightIds.length) return;
    const timers = [];
    highlightIds.forEach((cid, idx) => {
      const timer = setTimeout(() => {
        const el = globalThis.document.getElementById(`comment-${cid}`);
        if (el) {
          if (idx === 0) el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("comment-highlight");
          timers.push(setTimeout(() => el.classList.remove("comment-highlight"), 2600));
        }
      }, 180 + idx * 250);
      timers.push(timer);
    });
    const clearTimer = setTimeout(() => setHighlightIds([]), 8000);
    return () => {
      timers.forEach((t) => clearTimeout(t));
      clearTimeout(clearTimer);
    };
  }, [highlightIds, comments]);

  // Who is typing right now, most recent first (drives the Telegram-style indicator)
  const typingUserList = useMemo(
    () => Object.values(typingUsers).sort((a, b) => b.lastAt - a.lastAt),
    [typingUsers]
  );

  return {
    // Comments
    comments,
    addComment,
    addReply,
    resolveComment,
    deleteComment,
    replyingTo,
    setReplyingTo,
    commentResetSignal,
    setCommentResetSignal,
    replyResetSignal,
    setReplyResetSignal,
    // Notifications
    notifications,
    docNotifications,
    unreadCount,
    docUnread,
    markNotificationRead,
    markAllDocumentRead,
    // Versions
    versions,
    restoreVersion,
    renameVersion,
    // Real-time / presence
    onlineUsers,
    typingUsers: typingUserList,
    documentUsers,
    collaborators,
    commentUnread,
    // Panels
    showComments,
    setShowComments,
    showNotifications,
    setShowNotifications,
    showVersions,
    setShowVersions,
    openComments,
    openNotificationsPanel,
    openNotification,
    toggleVersions,
  };
}
