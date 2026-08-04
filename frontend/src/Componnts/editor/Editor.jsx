import { useState, useRef, useEffect, useCallback } from "react";
import { EditorContent } from "@tiptap/react";
import MenuBar from "./MenuBar";
import TableControls from "./TableControls";
import { useYjsSetup } from "./yjsSetup";
import { useEditorConfig } from "./useEditorConfig";
import TypingIndicator from "../TypingIndicator";
import { API_URL } from "../../api";
import { normalizePageSettings, getPageNumberLabel } from "./pageSettings";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN_X,
  PAGE_MARGIN_Y,
  CONTENT_HEIGHT,
} from "./pageGeometry";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Editor Component (Main Controller)
 *
 * Pagination model:
 * - The document is ONE continuous flow (stored as a single document).
 * - Pages are visual only: we measure the total content height, compute how
 *   many fixed-height pages it fills, and display ONE page sheet at a time.
 * - As you type past the bottom of a page, a new page is created automatically
 *   and the viewport follows the cursor. Deleting pulls content back.
 * - Page numbering is configurable (none / roman / decimal, start page & value).
 */
export default function Editor({
  documentId,
  userId,
  userName,
  userEmail,
  userDisplayName,
  userRole,
  userColor,
  initialContent,
  initialPageNumberSettings,
  onNewDocument,
  documentTitle,
  typingUsers = [],
}) {
  const canEdit = !["viewer"].includes((userRole || "").toLowerCase());

  // Setup Yjs collaboration
  const { ydoc, provider, status } = useYjsSetup(documentId);

  // Only setup editor when Yjs is ready
  const { editor } = useEditorConfig({
    ydoc,
    provider,
    documentId,
    userId,
    userName,
    userEmail,
    userDisplayName,
    userColor,
    canEdit,
    initialContent,
  });

  const [settings, setSettings] = useState(() =>
    normalizePageSettings(initialPageNumberSettings)
  );
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPageSettings, setShowPageSettings] = useState(false);

  const contentRef = useRef(null);
  const pageCountRef = useRef(1);
  const scrollRef = useRef(null);

  const ready = !!(ydoc && provider && editor) && !editor?.isDestroyed;

  // =====================================
  // MEASURE CONTENT -> COMPUTE PAGE COUNT
  // =====================================
  useEffect(() => {
    if (!ready || !editor || editor.isDestroyed) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const measure = () => {
      const height = contentEl.scrollHeight;
      const pages = Math.max(1, Math.ceil(height / CONTENT_HEIGHT));
      pageCountRef.current = pages;
      setPageCount(pages);
      setCurrentPage((p) => Math.min(p, pages));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(contentEl);
    try {
      const dom = editor.view.dom;
      if (dom) ro.observe(dom);
    } catch {
      // The editor view is not mounted yet; the contentEl observation
      // already tracks content height changes, so this is safe to skip.
    }

    const onUpdate = () => requestAnimationFrame(measure);
    editor.on("update", onUpdate);

    return () => {
      ro.disconnect();
      editor.off("update", onUpdate);
    };
  }, [editor, ready]);

  // =====================================
  // KEEP THE VISIBLE PAGE FOLLOWING THE CURSOR
  // =====================================
  // While typing/clicking, the page shown always matches the page the caret is
  // on. This gives the "Enter at the bottom -> cursor goes to the next page"
  // flow and "Backspace pulls content back" naturally.
  useEffect(() => {
    if (!ready || !editor || editor.isDestroyed) return;
    const follow = () => {
      let dom;
      try {
        dom = editor.view.dom;
      } catch {
        return;
      }
      if (!dom) return;
      try {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        const flowTop = coords.top - dom.getBoundingClientRect().top;
        const target = Math.floor(flowTop / CONTENT_HEIGHT) + 1;
        const clamped = Math.max(1, Math.min(pageCountRef.current, target));
        setCurrentPage(clamped);
      } catch {
        // ignore
      }
    };

    editor.on("selectionUpdate", follow);
    editor.on("update", follow);
    return () => {
      editor.off("selectionUpdate", follow);
      editor.off("update", follow);
    };
  }, [editor, ready]);

  // =====================================
  // PAGE NAVIGATION KEYS (PageUp / PageDown)
  // =====================================
  useEffect(() => {
    if (!ready || !editor || editor.isDestroyed) return;
    let dom;
    try {
      dom = editor.view.dom;
    } catch {
      dom = null;
    }
    if (!dom) return;
    const onKey = (e) => {
      if (e.key === "PageDown") {
        e.preventDefault();
        setCurrentPage((p) => Math.min(pageCountRef.current, p + 1));
      } else if (e.key === "PageUp") {
        e.preventDefault();
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    };
    dom.addEventListener("keydown", onKey);
    return () => dom.removeEventListener("keydown", onKey);
  }, [editor, ready]);

  // =====================================
  // SAVE PAGE SETTINGS
  // =====================================
  const savePageSettings = useCallback(
    async (next) => {
      const normalized = normalizePageSettings(next);
      setSettings(normalized);
      if (!documentId) return;
      try {
        await fetch(`${API_URL}/api/documents/${documentId}/page-settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ pageNumberSettings: normalized }),
        });
      } catch (err) {
        console.error("Failed to save page settings:", err);
      }
    },
    [documentId]
  );

  // Show loading state while connecting
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p>Connecting to document...</p>
        </div>
      </div>
    );
  }

  const statusLabel =
    status === "connected" || status === "synced"
      ? "Saved"
      : status === "connecting"
        ? "Connecting..."
        : "Offline";

  const pageLabel = getPageNumberLabel(currentPage, settings);

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* MenuBar - UI Controls */}
      {canEdit && (
        <div className="editor-menubar bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <MenuBar
            editor={editor}
            canEdit={canEdit}
            pageNumberSettings={settings}
            onUpdatePageSettings={savePageSettings}
            showPageSettings={showPageSettings}
            onTogglePageSettings={() => setShowPageSettings((s) => !s)}
            onNewDocument={onNewDocument}
            documentTitle={documentTitle}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="editor-statusbar flex items-center justify-between px-4 py-1 bg-white border-b border-slate-100 text-xs text-slate-500">
        <span>{canEdit ? "Editing" : "View only"}</span>
        <span className="flex items-center gap-3 min-w-0">
          {/* Live typing indicator — "Name is typing…" */}
          <TypingIndicator
            users={typingUsers}
            className="text-indigo-600 min-w-0 truncate"
            textClassName="truncate"
          />
          <span className="hidden sm:inline text-slate-400 shrink-0">
            Page {currentPage} of {pageCount}
          </span>
          <span
            className={`flex items-center gap-1 shrink-0 ${status === "connected" || status === "synced" ? "text-green-600" : "text-amber-600"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status === "connected" || status === "synced" ? "bg-green-500" : "bg-amber-500"}`}
            />
            {statusLabel}
          </span>
        </span>
      </div>

      {/* Editor Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto py-6 px-4 md:px-8">
        <TableControls editor={editor} canEdit={canEdit} scrollRef={scrollRef} currentPage={currentPage} />
        <div className="flex flex-col items-center gap-4">
          {!canEdit && (
            <div className="mb-1 text-center">
              <span className="bg-amber-50 text-amber-800 px-3 py-1 text-xs rounded-full border border-amber-200">
                Read-only — you have viewer access
              </span>
            </div>
          )}

          {/* Page sheet (one visible page at a time) */}
          <div
            className="page-sheet relative bg-white shadow-lg border border-slate-200"
            style={{ width: PAGE_WIDTH, maxWidth: "100%", height: PAGE_HEIGHT }}
          >
            {/* Content window = page area minus the margins. Clips the flow so a
                page never shows content that belongs to the next page. */}
            <div
              className="page-content-window"
              style={{
                position: "absolute",
                left: PAGE_MARGIN_X,
                right: PAGE_MARGIN_X,
                top: PAGE_MARGIN_Y,
                bottom: PAGE_MARGIN_Y,
                overflow: "hidden",
              }}
            >
              {/* Continuous document flow, translated to the current page */}
              <div
                ref={contentRef}
                className="page-flow"
                style={{
                  minHeight: CONTENT_HEIGHT,
                  transform: `translateY(-${(currentPage - 1) * CONTENT_HEIGHT}px)`,
                }}
              >
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Page number */}
            {settings.showPageNumbers && pageLabel && (
              <div className="page-number-footer" aria-hidden="true">
                {pageLabel}
              </div>
            )}
          </div>

          {/* Page navigation */}
          <div className="page-nav flex items-center gap-2 text-xs text-slate-600 select-none">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              title="Previous page (PageUp)"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 py-1 rounded-full border border-slate-200 bg-white shadow-sm font-medium">
              Page {currentPage} <span className="text-slate-400">of {pageCount}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCountRef.current, p + 1))}
              disabled={currentPage >= pageCount}
              className="p-1.5 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              title="Next page (PageDown)"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
