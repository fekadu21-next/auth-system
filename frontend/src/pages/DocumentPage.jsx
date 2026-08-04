import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "../Componnts/editor/Editor.jsx";
import ShareModal from "../Componnts/sharing/ShareModal.jsx";
import MentionInput from "../Componnts/MentionInput.jsx";
import TypingIndicator from "../Componnts/TypingIndicator.jsx";
import { useDocumentCore } from "../hooks/useDocumentCore.js";
import { useDocumentFeatures } from "../hooks/useDocumentFeatures.js";
import { useUi } from "../Componnts/useUi.js";
import { getUserColor } from "../utils/userColor.js";
import { ArrowLeft, Share, History, MessageSquare } from "lucide-react";
import { API_URL } from "../api.js";

/**
 * DocumentPage — Main UI + Layout ONLY.
 * - Editor, panels, share modal, online users UI
 * - No API calls, no socket logic, no comment/version/notification business logic
 *   (all delegated to useDocumentCore + useDocumentFeatures)
 */
export default function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core document logic (profile, document, permission, title)
  const { user, document, setDocument, permission, loading, updateTitle, currentUserId } =
    useDocumentCore(id, navigate);

  // All collaboration features (comments, notifications, versions, socket)
  const features = useDocumentFeatures({ documentId: id, user, currentUserId, document });

  const { showToast, prompt } = useUi();

  const [showShareModal, setShowShareModal] = useState(false);

  // File menu -> New: create a fresh document and open it in the editor.
  const handleNewDocument = async () => {
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Untitled Document" }),
      });
      if (res.ok) {
        const { data } = await res.json();
        navigate(`/document/${data._id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Failed to create a new document", "error");
      }
    } catch (err) {
      console.error("Failed to create a new document:", err);
      showToast("Failed to create a new document", "error");
    }
  };

  if (loading || !document || String(document._id || "") !== String(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Loading document...
      </div>
    );
  }

  const userColor = user?.email ? getUserColor(user.email) : "#4f46e5";

  // Live set of users currently typing (from the real-time `typing-users`
  // snapshots). Drives both the pill and the per-avatar "Typing..." state.
  const typingUserIdSet = new Set(
    features.typingUsers.map((t) => String(t.userId))
  );
  const isUserTyping = (u) => {
    const id = u.userId?._id || u.userId || u._id;
    return id != null && typingUserIdSet.has(String(id));
  };

  const effectiveRole = permission === "owner" ? "editor" : permission;
  const canEditTitle = permission === "owner" || permission === "editor";

  const isCommentAuthor = (commentUserId) => {
    if (!user) return false;
    const authorId = commentUserId?._id || commentUserId;
    return String(currentUserId) === String(authorId);
  };

  const handleRenameVersion = async (v) => {
    const name = await prompt({
      title: "Rename Version",
      message: "Give this version a name so it is easy to find later.",
      placeholder: "e.g. Final draft, After peer review",
      defaultValue: v.name || "",
      confirmText: "Save",
    });
    if (name === null) return;
    const result = await features.renameVersion(v._id, name);
    if (result.success) {
      showToast("Version renamed successfully");
    } else {
      showToast(result.message || "Failed to rename version", "error");
    }
  };

  // ---------- View helpers (pure) ----------

  const extractVersionPreview = (content) => {
    if (!content || typeof content !== "object") return "";
    const parts = [];
    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "text" && typeof node.text === "string") parts.push(node.text);
      if (node.type === "hardBreak") parts.push("\n");
      if (Array.isArray(node.content)) node.content.forEach(walk);
    };
    walk(content);
    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    return text.length > 140 ? text.slice(0, 140) + "…" : text;
  };

  const renderCommentText = (text) => {
    if (!text) return "";
    const mentionRegex = /(@\[.*?\]\(.*?\))/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, i) => {
      if (part.startsWith("@[") && part.endsWith(")")) {
        const nameMatch = part.match(/@\[(.*?)\]/);
        const emailMatch = part.match(/\((.*?)\)$/);
        const name = nameMatch ? nameMatch[1] : "User";
        const email = emailMatch ? emailMatch[1] : "";
        return (
          <span key={i} className="mention-view" title={email}>
            @{name}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const panelClass =
    "absolute inset-y-0 right-0 z-40 w-full bg-white border-l border-slate-200 flex flex-col shadow-xl sm:static sm:w-80 sm:shrink-0";

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      <header className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-white border-b border-slate-200 shadow-sm relative z-[60]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={document?.title || "Untitled Document"}
            onChange={(e) => setDocument({ ...document, title: e.target.value })}
            onBlur={(e) => updateTitle(e.target.value)}
            disabled={!canEditTitle}
            className="text-base sm:text-lg font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 min-w-0 w-40 sm:w-auto sm:max-w-xs truncate"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Online users / presence */}
          <div className="flex items-center gap-1 mr-1">
            {features.onlineUsers.slice(0, 3).map((u, i) => {
              const email = u.userId?.email || u.email || u.name || "User";
              const name = u.userId?.name || email.split("@")[0];
              const initial = name.charAt(0).toUpperCase();
              const color = getUserColor(email);

              return (
                <div
                  key={u._id || u.userId?._id || i}
                  className="relative group h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold shadow-sm cursor-help"
                  style={{ backgroundColor: color, zIndex: 5 - i }}
                >
                  {initial}

                  <div className="absolute top-10 right-0 bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50 flex flex-col gap-1 min-w-[120px]">
                    <div className="font-semibold">{name}</div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Online</span>
                    </div>
                    {isUserTyping(u) ? (
                      <div className="text-indigo-300 italic text-[10px]">Typing...</div>
                    ) : u.cursor && u.cursor.line !== undefined ? (
                      <div className="text-slate-400 text-[10px]">Editing Line {u.cursor.line + 1}</div>
                    ) : (
                      <div className="text-slate-400 text-[10px]">Viewing</div>
                    )}
                  </div>
                </div>
              );
            })}
            {features.onlineUsers.length > 3 && (
              <span className="text-xs text-slate-500 ml-1 font-medium bg-slate-100 px-2 py-1 rounded-full shadow-inner hidden sm:inline">
                +{features.onlineUsers.length - 3}
              </span>
            )}
          </div>

          {/* Live "who is typing" indicator (Telegram style) */}
          {features.typingUsers.length > 0 && (
            <TypingIndicator
              users={features.typingUsers}
              className="hidden md:inline-flex text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1"
            />
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={features.openNotificationsPanel}
              className={`p-2 rounded-lg transition relative ${features.showNotifications ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
                }`}
              title="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {features.docUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {features.docUnread > 99 ? "99+" : features.docUnread}
                </span>
              )}
            </button>

            {features.showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-800 text-sm flex justify-between items-center">
                  <span>Notifications</span>
                  <button onClick={() => features.setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {features.docNotifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs italic">No notifications</div>
                  ) : (
                    features.docNotifications
                      .map((n) => (
                        <div
                          key={n._id}
                          onClick={() => features.openNotification(n)}
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

          <button
            onClick={features.openComments}
            className={`p-2 rounded-lg transition relative ${features.showComments ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
              }`}
            title="Comments"
          >
            <MessageSquare size={18} />
            {features.commentUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                {features.commentUnread}
              </span>
            )}
          </button>

          <button
            onClick={features.toggleVersions}
            className={`p-2 rounded-lg transition ${features.showVersions ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
              }`}
            title="Version History"
          >
            <History size={18} />
          </button>

          {(permission === "owner" || permission === "editor") && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Share size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            key={id}
            documentId={id}
            userId={currentUserId}
            userName={user?.email?.split("@")[0]}
            userEmail={user?.email || ""}
            userDisplayName={user?.name || user?.email?.split("@")[0]}
            userRole={effectiveRole}
            userColor={userColor}
            initialContent={document?.content}
            initialPageNumberSettings={document?.pageNumberSettings}
            onNewDocument={handleNewDocument}
            documentTitle={document?.title || "Untitled Document"}
            typingUsers={features.typingUsers}
          />
        </div>

        {features.showVersions && (
          <div className={panelClass}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <History size={18} /> Version History
              </h3>
              <button onClick={() => features.setShowVersions(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50">
                <p className="text-sm font-medium text-indigo-900">Current Version</p>
                <p className="text-xs text-indigo-700">{new Date(document?.updatedAt).toLocaleString()}</p>
              </div>
              {features.versions.map((v) => {
                const preview = extractVersionPreview(v.content);
                return (
                  <div key={v._id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition group">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {v.name || `Version ${v.versionNumber}`}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                        {v.meta?.changeSize || "edit"}
                      </span>
                    </div>
                    {v.name && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Version {v.versionNumber}</p>
                    )}
                    <p className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">
                        {v.createdBy?.name || v.createdBy?.email || "Unknown"}
                      </span>
                      {v.createdBy?.email && v.createdBy?.name && (
                        <span className="text-slate-400"> · {v.createdBy.email}</span>
                      )}
                    </p>
                    {v.changeSummary && <p className="text-xs text-slate-400 mt-0.5">{v.changeSummary}</p>}
                    {preview && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 border border-slate-100 rounded px-2 py-1.5 line-clamp-3 break-words">
                        {preview}
                      </p>
                    )}
                    {(permission === "owner" || permission === "editor") && (
                      <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleRenameVersion(v)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => features.restoreVersion(v._id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Restore this version
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {features.versions.length === 0 && (
                <p className="text-xs text-slate-500 text-center italic py-4">
                  No previous versions yet. Versions are saved automatically.
                </p>
              )}
            </div>
          </div>
        )}

        {features.showComments && (
          <div className={panelClass}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} /> Comments
              </h3>
              <button onClick={() => features.setShowComments(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {features.comments
                .filter((c) => !c.parentComment)
                .map((c) => {
                  const threadReplies = features.comments.filter(
                    (r) => String(r.parentComment) === String(c._id)
                  );
                  return (
                    <div
                      key={c._id}
                      id={`comment-${c._id}`}
                      className={`p-3 border rounded-lg transition-colors duration-500 ${c.isResolved
                          ? "bg-slate-50 border-slate-200 opacity-70"
                          : "bg-white border-slate-200 shadow-sm"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold text-slate-700">
                          {c.userId?.name || c.userId?.email || "User"}
                        </p>
                        <p className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-slate-800 mb-2 whitespace-pre-wrap">
                        {renderCommentText(c.text || c.content)}
                      </p>
                      <div className="flex gap-2 text-xs font-medium mb-2">
                        {!c.isResolved && (
                          <button onClick={() => features.resolveComment(c._id)} className="text-indigo-600 hover:text-indigo-800">
                            Resolve
                          </button>
                        )}
                        {!c.isResolved && (
                          <button
                            onClick={() =>
                              features.setReplyingTo(features.replyingTo === c._id ? null : c._id)
                            }
                            className="text-slate-600 hover:text-slate-800"
                          >
                            Reply
                          </button>
                        )}
                        {(isCommentAuthor(c.userId) || permission === "owner") && (
                          <button
                            onClick={() => features.deleteComment(c._id)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      {threadReplies.length > 0 && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-100 space-y-2 mt-2">
                          {threadReplies.map((r) => (
                            <div key={r._id} id={`comment-${r._id}`} className="pt-1 rounded-lg transition-colors duration-500">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-slate-700">
                                  {r.userId?.name || r.userId?.email || "User"}
                                </p>
                                <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                              </div>
                              <p className="text-xs text-slate-800 mb-1 whitespace-pre-wrap">
                                {renderCommentText(r.text || r.content)}
                              </p>
                              {(isCommentAuthor(r.userId) || permission === "owner") && (
                                <button
                                  onClick={() => features.deleteComment(r._id)}
                                  className="text-[10px] font-medium text-rose-500 hover:text-rose-700"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {features.replyingTo === c._id && !c.isResolved && (
                        <div className="mt-3 flex flex-col gap-2 relative">
                          <MentionInput
                            key={features.replyResetSignal}
                            placeholder="Write a reply... (Type @ to mention)"
                            collaborators={features.collaborators}
                            onSubmit={(t) => features.addReply(c._id, t)}
                            autoFocus
                            small
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                features.setReplyingTo(null);
                                features.setReplyResetSignal((s) => s + 1);
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              {features.comments.length === 0 && (
                <p className="text-xs text-slate-500 text-center italic py-4">No comments yet.</p>
              )}
            </div>
            {permission !== "viewer" && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 relative">
                <MentionInput
                  key={features.commentResetSignal}
                  placeholder="Add a comment... (Type @ to mention)"
                  collaborators={features.collaborators}
                  onSubmit={features.addComment}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showShareModal && <ShareModal documentId={id} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}
