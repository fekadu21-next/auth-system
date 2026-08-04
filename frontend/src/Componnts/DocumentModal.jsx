import { useState } from "react";
import { X, FileText } from "lucide-react";

/**
 * DocumentModal Component
 * 
 * Used for creating new documents with better UX than browser prompt
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {string} props.defaultTitle - Default title for the document
 * @param {string} props.title - Modal title
 */
export default function DocumentModal({ isOpen, onClose, onSubmit, defaultTitle = "", title = "Create Document" }) {
  const [documentTitle, setDocumentTitle] = useState(defaultTitle);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!documentTitle.trim()) {
      setError("Document title is required");
      return;
    }
    
    if (documentTitle.trim().length < 3) {
      setError("Document title must be at least 3 characters");
      return;
    }
    
    if (documentTitle.trim().length > 100) {
      setError("Document title must be less than 100 characters");
      return;
    }
    
    onSubmit(documentTitle.trim());
    setDocumentTitle("");
    setError("");
  };

  const handleClose = () => {
    setDocumentTitle("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="documentTitle" className="block text-sm font-medium text-slate-700 mb-2">
              Document Title
            </label>
            <input
              id="documentTitle"
              type="text"
              value={documentTitle}
              onChange={(e) => {
                setDocumentTitle(e.target.value);
                setError("");
              }}
              placeholder="Enter document title..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500">{error}</p>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
            >
              {title === "Rename Document" ? "Rename" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
