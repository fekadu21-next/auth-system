import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../api.js";

/**
 * useDocumentCore
 *
 * 🧠 Role: Core document logic (no UI)
 * - Fetch profile + document + permission
 * - Update document title
 * - Manage document state (user, document, permission, loading)
 *
 * @param {string} documentId - Document ID from the URL
 * @param {Function} navigate - React Router navigate
 * @returns {Object} { user, document, setDocument, permission, loading, updateTitle, currentUserId }
 */
export function useDocumentCore(documentId, navigate) {
  const [user, setUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndDocument = useCallback(async () => {
    setLoading(true);
    try {
      const profRes = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: "include",
      });
      if (!profRes.ok) {
        navigate(`/?redirect=/document/${documentId}`);
        return;
      }
      const profData = await profRes.json();
      setUser(profData);

      const docRes = await fetch(`${API_URL}/api/documents/${documentId}`, {
        credentials: "include",
      });
      if (!docRes.ok) {
        navigate("/dashboard");
        return;
      }
      const docData = await docRes.json();
      setDocument(docData.data);

      const permRes = await fetch(`${API_URL}/api/shares/${documentId}/permission`, {
        credentials: "include",
      });
      if (permRes.ok) {
        const permData = await permRes.json();
        const perm = permData.permission?.permission || permData.permission;
        setPermission(typeof perm === "string" ? perm : perm?.permission || "viewer");
      } else {
        const ownerId = docData.data?.owner?._id || docData.data?.owner;
        const userId = profData._id || profData.id;
        if (ownerId && userId && String(ownerId) === String(userId)) {
          setPermission("owner");
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [documentId, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProfileAndDocument(), 0);
    return () => clearTimeout(timer);
  }, [fetchProfileAndDocument]);

  const updateTitle = useCallback(
    async (newTitle) => {
      if (!newTitle || newTitle === document?.title || permission === "viewer") return;
      setDocument({ ...document, title: newTitle });
      try {
        await fetch(`${API_URL}/api/documents/${documentId}/title`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: newTitle }),
        });
      } catch (e) {
        console.error(e);
      }
    },
    [document, permission, documentId]
  );

  const currentUserId = user?._id || user?.id;

  return {
    user,
    setUser,
    document,
    setDocument,
    permission,
    loading,
    updateTitle,
    currentUserId,
  };
}
