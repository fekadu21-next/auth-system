import { useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Yjs Setup Hook
 * 
 * 🧠 Concept: This handles real-time collaboration setup
 * 
 * What it does:
 * - Create Yjs document
 * - Connect to server using SocketIOProvider
 * - Join document room
 * 
 * Responsibilities:
 * - Sync setup
 * - Networking bridge
 * - Document sharing logic
 * 
 * What it should NOT do:
 * - No UI
 * - No buttons
 * - No editor rendering
 * 
 * 💡 Think: "How users sync data with each other"
 * 
 * @param {string} documentId - The document ID to connect to
 * @returns {Object} { ydoc, provider, status, error }
 */
export const useYjsSetup = (documentId) => {
  const [ydoc, setYdoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!documentId) return;

    console.log("🔗 Setting up Yjs for document:", documentId);

    let cancelled = false;

    // Create Yjs document
    const doc = new Y.Doc();

    // Create Socket.IO provider
    const socketProvider = new SocketIOProvider(
      SOCKET_URL,
      String(documentId),
      doc,
      { autoConnect: true },
      { withCredentials: true, transports: ["websocket", "polling"] }
    );

    // Handle status changes
    const onStatus = (status) => {
      console.log("📡 Yjs status:", status);
      if (status && status.status) {
        setStatus(status.status);
      } else if (typeof status === 'string') {
        setStatus(status);
      }
    };
    
    // Handle sync events
    const onSync = (isSynced) => {
      console.log("🔄 Yjs sync:", isSynced);
      if (isSynced === true || (Array.isArray(isSynced) && isSynced[0] === true)) {
        setStatus("synced");
      }
    };

    // Listen to events
    socketProvider.on("status", onStatus);
    socketProvider.on("sync", onSync);

    // Set state after the effect body so the provider is fully wired up first
    queueMicrotask(() => {
      if (cancelled) return;
      setYdoc(doc);
      setProvider(socketProvider);
      setStatus("connecting");
    });

    console.log("✅ Yjs setup complete");

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up Yjs connection");
      cancelled = true;
      socketProvider.off("status", onStatus);
      socketProvider.off("sync", onSync);
      socketProvider.destroy();
      doc.destroy();
      setYdoc(null);
      setProvider(null);
    };
  }, [documentId]);

  return { ydoc, provider, status };
};
