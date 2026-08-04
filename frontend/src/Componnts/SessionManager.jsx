import { useEffect, useRef } from "react";
import { API_URL } from "../api";

export default function SessionManager() {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Record user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    // Every 5 minutes, check if user was active recently.
    // If active in the last 6 minutes, refresh session.
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // 5 minutes in milliseconds
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeSinceLastActivity <= FIVE_MINUTES) {
        // Refresh session
        fetch(`${API_URL}/api/auth/refresh-session`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("Failed to refresh session:", err);
        });
      }
    }, 5 * 60 * 1000); // 5 minutes interval

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, []);

  return null;
}
