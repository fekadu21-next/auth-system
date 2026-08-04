import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../api.js";
import { socket } from "../socket.js";

/**
 * useDashboardDocuments
 *
 * 🧠 Role: All document operations for the dashboard
 * - Fetch documents (recent / owned / shared)
 * - Create document
 * - Delete document
 * - Rename document
 * - Duplicate document
 * - Live socket updates (renamed / deleted)
 *
 * Every function returns { success, message?, id? } so the UI layer
 * decides how to show feedback without touching the API.
 *
 * @param {Object} params
 * @param {string} params.activeTab - "recent" | "owned" | "shared"
 * @returns {Object} { documents, loading, fetchDocuments, createDocument, deleteDocument, renameDocument, duplicateDocument }
 */
export function useDashboardDocuments({ activeTab }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    let endpoint = "recent";
    if (activeTab === "owned") endpoint = "";
    if (activeTab === "shared") endpoint = "shared";

    try {
      const res = await fetch(`${API_URL}/api/documents/${endpoint}`, {
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "sessions") return;
    const timer = setTimeout(() => fetchDocuments(), 0);
    return () => clearTimeout(timer);
  }, [fetchDocuments, activeTab]);

  // Real-time updates from other collaborators
  useEffect(() => {
    const onRenamed = ({ documentId, title }) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc._id === documentId ? { ...doc, title } : doc))
      );
    };
    const onDeleted = ({ documentId }) => {
      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
    };

    socket.on("document-renamed", onRenamed);
    socket.on("document-deleted", onDeleted);

    return () => {
      socket.off("document-renamed", onRenamed);
      socket.off("document-deleted", onDeleted);
    };
  }, []);

  const createDocument = async (title) => {
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const { data } = await res.json();
        return { success: true, id: data._id };
      }
      return { success: false, message: "Failed to create document" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to create document" };
    }
  };

  const renameDocument = async (documentId, title) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchDocuments();
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to rename document" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to rename document" };
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        await fetchDocuments();
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to delete document" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to delete document" };
    }
  };

  const duplicateDocument = async (documentId) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        await fetchDocuments();
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to duplicate document" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to duplicate document" };
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    renameDocument,
    deleteDocument,
    duplicateDocument,
  };
}
