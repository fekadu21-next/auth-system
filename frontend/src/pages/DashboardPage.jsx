import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Copy,
  Settings,
  FileText,
  Clock,
  Users,
  Bell,
} from "lucide-react";
import DocumentModal from "../Componnts/DocumentModal.jsx";
import SecuritySessionsPanel from "../Componnts/SecuritySessionsPanel.jsx";
import { useDashboardDocuments } from "../hooks/useDashboardDocuments.js";
import { useDashboardNotifications } from "../hooks/useDashboardNotifications.js";
import { useDashboardSessions } from "../hooks/useDashboardSessions.js";
import { useUi } from "../Componnts/useUi.js";
import { API_URL } from "../api.js";

/**
 * DashboardPage — UI + Layout ONLY.
 * No API calls, no socket logic, no document/notification business logic.
 * Everything is delegated to useDashboardDocuments / useDashboardNotifications.
 */
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("recent"); // "recent", "owned", "shared", "sessions"
  const navigate = useNavigate();

  // Modal + dropdown UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showBell, setShowBell] = useState(false);

  const { showToast, confirm } = useUi();

  // Document + notification logic lives in hooks
  const {
    documents,
    loading,
    createDocument,
    renameDocument,
    deleteDocument,
    duplicateDocument,
  } = useDashboardDocuments({ activeTab });

  const {
    bellNotifications,
    bellUnread,
    fetchUnreadCount,
    markBellRead,
    markAllBellRead,
  } = useDashboardNotifications({ user });

  const {
    sessions: activeSessions,
    loading: sessionsLoading,
    fetchSessions,
    removeSession,
  } = useDashboardSessions();

  // Load profile once
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: "include",
      });
      if (!res.ok) {
        navigate("/");
        return;
      }
      const data = await res.json();
      setUser(data);
    };
    fetchProfile();
  }, [navigate]);

  // ---------- Handlers (UI glue only) ----------

  const handleCreate = async (title) => {
    const result = await createDocument(title);
    if (result.success) {
      showToast("Document created successfully");
      setIsCreateModalOpen(false);
      navigate(`/document/${result.id}`);
    } else {
      showToast(result.message || "Failed to create document", "error");
    }
  };

  const handleRename = async (title) => {
    if (!selectedDocument) return;
    const result = await renameDocument(selectedDocument._id, title);
    if (result.success) {
      showToast("Document renamed successfully");
      setIsRenameModalOpen(false);
      setSelectedDocument(null);
    } else {
      showToast(result.message || "Failed to rename document", "error");
    }
  };

  const handleDelete = async (docId) => {
    const confirmed = await confirm({
      title: "Delete this document?",
      message: "This action cannot be undone. The document and all of its content will be permanently removed.",
      confirmText: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    const result = await deleteDocument(docId);
    if (result.success) {
      showToast("Document deleted successfully");
    } else {
      showToast(result.message || "Failed to delete document", "error");
    }
    setActiveDropdown(null);
  };

  const handleDuplicate = async (docId) => {
    const result = await duplicateDocument(docId);
    if (result.success) {
      showToast("Document duplicated successfully");
    } else {
      showToast(result.message || "Failed to duplicate document", "error");
    }
    setActiveDropdown(null);
  };

  const openRenameModal = (doc) => {
    setSelectedDocument(doc);
    setIsRenameModalOpen(true);
  };

  // Fetch sessions whenever the Security & Sessions tab is opened
  useEffect(() => {
    if (activeTab === "sessions") fetchSessions();
  }, [activeTab, fetchSessions]);

  const handleRemoveSession = async (sid) => {
    const confirmed = await confirm({
      title: "Sign out this session?",
      message: "The session on that device will be ended immediately.",
      confirmText: "Sign out",
      danger: true,
    });
    if (!confirmed) return;
    const result = await removeSession(sid);
    if (result.success) {
      showToast("Session removed successfully");
    } else {
      showToast(result.message || "Failed to remove session", "error");
    }
  };

  const openBellNotification = (n) => {
    setShowBell(false);
    markBellRead(n);
    const docId = n.documentId?._id || n.documentId;
    if (docId) {
      navigate(`/document/${docId}`);
    }
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { credentials: "include" });
    navigate("/");
  };

  const sidebarTabs = [
    { key: "recent", label: "Recent", icon: Clock },
    { key: "owned", label: "My Documents", icon: FileText },
    { key: "shared", label: "Shared with Me", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              SyncWrite
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Document</span>
              <span className="sm:hidden">New</span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-slate-300"></div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  const opening = !showBell;
                  setShowBell(opening);
                  // Opening the bell counts as "seen": clear the badge in real time.
                  if (opening) markAllBellRead();
                  else fetchUnreadCount();
                }}
                className={`relative p-2 rounded-lg transition ${
                  showBell ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
                }`}
                title="Notifications"
              >
                <Bell size={20} />
                {bellUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {bellUnread > 99 ? "99+" : bellUnread}
                  </span>
                )}
              </button>

              {showBell && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-800 text-sm flex justify-between items-center">
                    <span>Notifications</span>
                    <button onClick={() => setShowBell(false)} className="text-slate-400 hover:text-slate-600">×</button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {bellNotifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs italic">No notifications</div>
                    ) : (
                      bellNotifications
                        .map((n) => (
                          <div
                            key={n._id}
                            onClick={() => openBellNotification(n)}
                            className={`p-3 rounded-lg text-xs cursor-pointer transition border ${
                              n.isRead
                                ? "bg-white hover:bg-slate-50 border-slate-100"
                                : "bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100/50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                                {n.senderId?.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-800 leading-relaxed">
                                  <span className="font-semibold">{n.senderId?.name || "Someone"}</span> {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 truncate" title={n.senderId?.email}>
                                  {n.senderId?.email} · {n.documentId?.title || "Document"}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1 ml-auto"></span>}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-600 hover:text-rose-600 transition hidden sm:block"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
              {sidebarTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${
                    activeTab === key ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
              <button
                onClick={() => setActiveTab("sessions")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${
                  activeTab === "sessions"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Settings size={18} /> Security & Sessions
              </button>
            </nav>
          </aside>

          {/* Document List / Security & Sessions */}
          <div className="flex-1 overflow-visible min-w-0">
            {activeTab === "sessions" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Security & Sessions</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Devices and browsers signed in to your account.
                  </p>
                </div>
                <SecuritySessionsPanel
                  sessions={activeSessions}
                  loading={sessionsLoading}
                  onRemove={handleRemoveSession}
                />
              </>
            ) : (
              <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === "owned" ? "My Documents" : activeTab}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
                <p className="text-slate-500 mb-6">Create a new document to get started.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition"
                >
                  Create Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => {
                  const ownerId = doc.owner?._id || doc.owner;
                  const isOwner = ownerId === user?.id;
                  const userRole = isOwner ? "Owner" : doc.sharePermission || "Viewer";

                  return (
                    <div
                      key={doc._id}
                      className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col overflow-visible"
                    >
                      <div
                        className="h-32 bg-slate-100 border-b border-slate-100 p-4 cursor-pointer"
                        onClick={() => navigate(`/document/${doc._id}`)}
                      >
                        <div className="w-full h-full bg-white rounded shadow-sm border border-slate-200 p-2 overflow-hidden text-[8px] text-slate-400 font-mono">
                          <div className="h-2 bg-slate-200 w-3/4 rounded mb-1"></div>
                          <div className="h-2 bg-slate-200 w-full rounded mb-1"></div>
                          <div className="h-2 bg-slate-200 w-5/6 rounded mb-1"></div>
                          <div className="h-2 bg-slate-200 w-1/2 rounded"></div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className="font-semibold text-slate-900 truncate pr-4 cursor-pointer hover:text-indigo-600 transition"
                            onClick={() => navigate(`/document/${doc._id}`)}
                            title={doc.title}
                          >
                            {doc.title}
                          </h3>

                          <div className="relative shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === doc._id ? null : doc._id);
                              }}
                              className="text-slate-600 hover:text-slate-900 p-2 hover:bg-indigo-50 rounded transition-colors bg-slate-50 border border-slate-200 cursor-pointer"
                              title="More options"
                              type="button"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {activeDropdown === doc._id && (
                              <div
                                className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 shadow-xl rounded-lg py-2 z-[100]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    navigate(`/document/${doc._id}`);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                                  type="button"
                                >
                                  <Edit size={16} /> Open
                                </button>
                                {(isOwner || doc.sharePermission === "editor") && (
                                  <button
                                    onClick={() => {
                                      openRenameModal(doc);
                                      setActiveDropdown(null);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <Edit size={16} /> Rename
                                  </button>
                                )}
                                {(isOwner || doc.sharePermission === "editor") && (
                                  <button
                                    onClick={() => {
                                      handleDuplicate(doc._id);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <Copy size={16} /> Duplicate
                                  </button>
                                )}
                                {isOwner && (
                                  <>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => handleDelete(doc._id)}
                                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      type="button"
                                    >
                                      <Trash size={16} /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
                            <span className="truncate">Owner: {doc.owner?.email || doc.owner?.name || "Unknown"}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                                isOwner
                                  ? "bg-emerald-100 text-emerald-700"
                                  : doc.sharePermission === "editor"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {userRole}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                            <span>Modified: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create Document Modal */}
      <DocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Create Document"
      />

      {/* Rename Document Modal */}
      <DocumentModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleRename}
        defaultTitle={selectedDocument?.title || ""}
        title="Rename Document"
      />
    </div>
  );
}
