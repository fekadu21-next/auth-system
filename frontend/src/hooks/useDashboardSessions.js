import { useState, useCallback } from "react";
import { API_URL } from "../api.js";

/**
 * useDashboardSessions
 *
 * 🧠 Role: Security & Sessions panel on the dashboard
 * - Fetch all active sessions for the current user (device, browser, OS, location)
 * - Remove / sign out a remote session
 *
 * Every function returns { success, message? } so the UI layer decides feedback.
 */
export function useDashboardSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/sessions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSession = useCallback(
    async (sid) => {
      try {
        const res = await fetch(`${API_URL}/api/auth/sessions/${sid}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          await fetchSessions();
          return { success: true };
        }
        return { success: false, message: data.message || "Failed to remove session" };
      } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to remove session" };
      }
    },
    [fetchSessions]
  );

  return { sessions, loading, fetchSessions, removeSession };
}
