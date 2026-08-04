import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2 } from "lucide-react";

/**
 * Find the DOM element of the table that currently contains the selection.
 */
const getActiveTableDom = (editor) => {
  try {
    const { state } = editor;
    const $pos = state.doc.resolve(state.selection.from);
    for (let d = $pos.depth; d > 0; d -= 1) {
      if ($pos.node(d).type.name === "table") {
        const dom = editor.view.nodeDOM($pos.before(d));
        if (dom && typeof dom.querySelector === "function") {
          const table = dom.querySelector("table") || dom;
          return table.closest(".tableWrapper") || table;
        }
        return null;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Floating Google Docs style table controls.
 * When a table is hovered (or the cursor is inside it) the four "+" buttons
 * appear at the edges to add a row above/below or a column left/right, plus a
 * delete button to remove the whole table.
 */
export default function TableControls({ editor, canEdit, scrollRef, currentPage }) {
  const [tableEl, setTableEl] = useState(null);
  const [rect, setRect] = useState(null);
  const elRef = useRef(null);
  const hideTimer = useRef(null);

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimer.current);
  }, []);

  const hide = useCallback(() => {
    if (elRef.current) {
      elRef.current.classList.remove("table-controls-active");
    }
    elRef.current = null;
    setTableEl(null);
    setRect(null);
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hide, 300);
  }, [hide]);

  const updateRect = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    }
  }, []);

  const show = useCallback(
    (el) => {
      if (!el) return;
      clearTimeout(hideTimer.current);
      if (elRef.current && elRef.current !== el) {
        elRef.current.classList.remove("table-controls-active");
      }
      elRef.current = el;
      el.classList.add("table-controls-active");
      setTableEl(el);
      updateRect();
    },
    [updateRect]
  );

  useEffect(() => {
    if (!editor || !canEdit) return;
    let dom;
    try {
      dom = editor.view.dom;
    } catch {
      dom = null;
    }
    if (!dom) return;

    const onMouseOver = (e) => {
      const table = e.target && e.target.closest ? e.target.closest("table") : null;
      if (!table) return;
      show(table.closest(".tableWrapper") || table);
    };

    const onSelection = () => {
      const el = getActiveTableDom(editor);
      if (el) show(el);
      else scheduleHide();
    };

    const refresh = () => updateRect();

    dom.addEventListener("mouseover", onMouseOver);
    editor.on("selectionUpdate", onSelection);
    editor.on("update", refresh);

    const scrollEl = scrollRef?.current;
    scrollEl?.addEventListener("scroll", refresh);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      dom.removeEventListener("mouseover", onMouseOver);
      editor.off("selectionUpdate", onSelection);
      editor.off("update", refresh);
      scrollEl?.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
      if (elRef.current) elRef.current.classList.remove("table-controls-active");
    };
  }, [editor, canEdit, show, scheduleHide, updateRect, scrollRef]);

  // Re-measure once the table element changes (e.g. after adding a row).
  useEffect(() => {
    if (!tableEl) return undefined;
    const id = requestAnimationFrame(updateRect);
    return () => cancelAnimationFrame(id);
  }, [tableEl, updateRect]);

  // Re-measure when the visible page changes (page-flow transform moves).
  useEffect(() => {
    if (tableEl) updateRect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  if (!canEdit || !tableEl || !rect) return null;

  const run = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  // Move the caret into the hovered table before running a table command,
  // so row/column operations work even when the table was only hovered.
  const act = (command) => () => {
    try {
      const table = tableEl.querySelector("table") || tableEl;
      const cell = table.querySelector("td, th");
      const pos = cell ? editor.view.posAtDOM(cell, 0) : null;
      const chain = editor.chain().focus();
      if (pos != null) chain.setTextSelection(pos);
      chain[command]().run();
    } catch {
      // ignore
    }
  };

  const btnCls =
    "pointer-events-auto absolute z-50 flex items-center justify-center w-6 h-6 rounded-full bg-white text-slate-700 border border-slate-300 shadow-md hover:text-blue-700 hover:border-blue-400 hover:shadow-lg transition-all";

  return createPortal(
    <div
      className="table-controls pointer-events-none fixed z-[100]"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
    >
      <button
        className={`${btnCls} -top-3 left-1/2 -translate-x-1/2`}
        title="Add row above"
        onMouseDown={(e) => e.preventDefault()}
        onClick={run(act("addRowBefore"))}
      >
        <Plus size={14} />
      </button>
      <button
        className={`${btnCls} -bottom-3 left-1/2 -translate-x-1/2`}
        title="Add row below"
        onMouseDown={(e) => e.preventDefault()}
        onClick={run(act("addRowAfter"))}
      >
        <Plus size={14} />
      </button>
      <button
        className={`${btnCls} top-1/2 -translate-y-1/2 -left-3`}
        title="Add column left"
        onMouseDown={(e) => e.preventDefault()}
        onClick={run(act("addColumnBefore"))}
      >
        <Plus size={14} />
      </button>
      <button
        className={`${btnCls} top-1/2 -translate-y-1/2 -right-3`}
        title="Add column right"
        onMouseDown={(e) => e.preventDefault()}
        onClick={run(act("addColumnAfter"))}
      >
        <Plus size={14} />
      </button>
      <button
        className={`${btnCls} -top-3 -right-3 text-rose-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50`}
        title="Delete table"
        onMouseDown={(e) => e.preventDefault()}
        onClick={run(act("deleteTable"))}
      >
        <Trash2 size={13} />
      </button>
    </div>,
    document.body
  );
}
