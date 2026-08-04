import { useState } from "react";
import { Users, X } from "lucide-react";
import { useShare } from "./useShare";

// ShareModal Component (UI Layer)

export default function ShareModal({ documentId, onClose }) {
  // UI State only
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // All logic and API calls from hook
  const {
    sharedUsers,
    loading,
    error,
    handleShare,
    updatePermission,
    removeUser,
    suggestions,
    searching,
    searchUsers,
  } = useShare(documentId);

  // Handle share form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await handleShare(email, permission);
    if (result.success) {
      setEmail("");
      setShowSuggestions(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setShowSuggestions(true);
    searchUsers(value);
  };

  const selectSuggestion = (user) => {
    setEmail(user.email);
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Users size={20} /> Share Document
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1 min-w-0">
              <input
                type="email"
                placeholder="User email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {showSuggestions && (email.trim().length > 0 || searching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searching ? (
                    <p className="px-3 py-2 text-xs text-slate-400">Searching users...</p>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(user);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-indigo-50 transition"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-xs text-slate-400">No matching users found</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="flex-1 sm:flex-none border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none"
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
              >
                Share
              </button>
            </div>
          </form>

          {error && <p className="text-rose-500 text-xs mb-4">{error}</p>}

          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">People with access</h3>

          <div className="space-y-3">
            {sharedUsers.map((share) => (
              <div key={share.userId._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {share.userId.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{share.userId.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{share.permission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <select
                    value={share.permission}
                    onChange={(e) => updatePermission(share.userId._id, e.target.value)}
                    className="text-xs border-none bg-slate-100 rounded px-2 py-1 outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={() => removeUser(share.userId._id)}
                    className="text-slate-400 hover:text-rose-500 text-xs font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {sharedUsers.length === 0 && (
              <p className="text-sm text-slate-500 italic text-center py-4">No one else has access</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
