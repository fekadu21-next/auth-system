import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../api.js";
import { socket } from "../socket.js";

/**
 * useDashboardNotifications
 *
 * 🧠 Role: Notification system for the dashboard bell (🔔)
 * - Fetch notifications
 * - Fetch unread count
 * - Mark a notification as read
 * - Register user + live socket updates (new-notification)
 *
 * @param {Object} params
 * @param {Object|null} params.user - Current logged in user
 * @returns {Object} { bellNotifications, bellUnread, fetchNotifications, fetchUnreadCount, markBellRead }
 */
export function useDashboardNotifications({ user }) {
  const [bellNotifications, setBellNotifications] = useState([]);
  const [bellUnread, setBellUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBellNotifications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread/${user.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBellUnread(data.count || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const markBellRead = useCallback(
    async (n) => {
      setBellNotifications((prev) => prev.filter((x) => x._id !== n._id));
      setBellUnread((prev) => Math.max(0, prev - (n.isRead ? 0 : 1)));
      try {
        await fetch(`${API_URL}/api/notifications/read/${n._id}`, {
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

  // Mark every notification as read (called when the bell is opened so the
  // badge clears as soon as the user has seen the notifications).
  const markAllBellRead = useCallback(async () => {
    if (!user) return;
    setBellNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBellUnread(0);
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (e) {
      console.error(e);
    }
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  // Register user for real-time notifications + fetch on login
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("register-user", user.id);
    Promise.resolve().then(() => {
      fetchNotifications();
      fetchUnreadCount();
    });

    const onConnect = () => socket.emit("register-user", user.id);
    const onNewNotification = () => {
      fetchNotifications();
      fetchUnreadCount();
    };
    // Fired after notifications are marked read on the server (from any tab),
    // so badges stay in sync everywhere without a page refresh.
    const onNotificationsUpdated = () => {
      fetchNotifications();
      fetchUnreadCount();
    };

    socket.on("connect", onConnect);
    socket.on("new-notification", onNewNotification);
    socket.on("notifications-updated", onNotificationsUpdated);

    return () => {
      socket.off("connect", onConnect);
      socket.off("new-notification", onNewNotification);
      socket.off("notifications-updated", onNotificationsUpdated);
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

  return {
    bellNotifications,
    bellUnread,
    fetchNotifications,
    fetchUnreadCount,
    markBellRead,
    markAllBellRead,
  };
}
