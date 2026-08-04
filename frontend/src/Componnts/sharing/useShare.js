import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * useShare Hook
 * 
 * 🧠 Concept: This is the brain of sharing system
 * 
 * What it handles:
 * - Data State (sharedUsers, loading, error)
 * - All Actions:
 *   1. Fetch users - Get who has access
 *   2. Share user - Email → find user → share document
 *   3. Update permission - Change role (viewer/editor)
 *   4. Remove user - Remove access
 * 
 * 💡 Think: "All logic + all backend communication lives here"
 * 
 * @param {string} documentId - The document ID to share
 * @returns {Object} { sharedUsers, loading, error, handleShare, updatePermission, removeUser, refreshUsers }
 */
export const useShare = (documentId) => {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  /**
   * Search users for the email input suggestions (fetched from DB)
   * @param {string} query - Partial email or name to match
   */
  const searchUsers = useCallback((query) => {
    clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/users/search?q=${encodeURIComponent(trimmed)}`, {
          credentials: "include",
        });
        if (res.ok) {
          const { data } = await res.json();
          setSuggestions(data || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  /**
   * Fetch shared users from backend
   */
  const fetchSharedUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/shares/${documentId}/shared-users`, {
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        setSharedUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch shared users:", err);
    }
  }, [documentId]);

  /**
   * Fetch users on documentId change
   */
  useEffect(() => {
    if (!documentId) return;
    const timer = setTimeout(() => fetchSharedUsers(), 0);
    return () => clearTimeout(timer);
  }, [documentId, fetchSharedUsers]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  /**
   * Share document with a user by email
   * @param {string} email - User email to share with
   * @param {string} permission - Permission level (viewer, commenter, editor)
   */
  const handleShare = async (email, permission) => {
    setLoading(true);
    setError("");
    
    try {
      // First, lookup user by email
      const res = await fetch(`${API_URL}/api/auth/users?email=${email}`, {
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("User not found");
      const { data } = await res.json();
      const userId = data._id || data.id;

      // Share the document with the user
      const shareRes = await fetch(`${API_URL}/api/shares/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, permission })
      });
      
      if (!shareRes.ok) throw new Error("Failed to share document");
      
      // Refresh the list of shared users
      await fetchSharedUsers();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update permission for a shared user
   * @param {string} userId - User ID to update
   * @param {string} newPerm - New permission level
   */
  const updatePermission = async (userId, newPerm) => {
    try {
      await fetch(`${API_URL}/api/shares/${documentId}/share/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permission: newPerm })
      });
      await fetchSharedUsers();
    } catch (err) {
      console.error("Failed to update permission:", err);
    }
  };

  /**
   * Remove a user from shared list
   * @param {string} userId - User ID to remove
   */
  const removeUser = async (userId) => {
    try {
      await fetch(`${API_URL}/api/shares/${documentId}/share/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchSharedUsers();
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  };

  /**
   * Refresh the shared users list
   */
  const refreshUsers = async () => {
    await fetchSharedUsers();
  };

  return {
    // Data State
    sharedUsers,
    loading,
    error,
    // Suggestions
    suggestions,
    searching,
    searchUsers,
    // Actions
    handleShare,
    updatePermission,
    removeUser,
    refreshUsers,
  };
};
