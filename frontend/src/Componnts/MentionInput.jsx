import { useRef, useState } from "react";

// Text content of the editor up to the current caret
const getTextUpToCaret = (el) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return "";
  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString();
};

// Map a global text offset to a specific text node + offset within it
const getNodeAndOffset = (el, offset) => {
  let remaining = offset;
  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node;
  while ((node = walker.nextNode())) {
    if (remaining <= node.textContent.length) {
      return { node, offset: remaining };
    }
    remaining -= node.textContent.length;
  }
  return { node: el.lastChild || el, offset: 0 };
};

// Serialize the contentEditable back into plain text with @[Name](email) mentions
const serializeMentions = (el) => {
  let out = "";
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent;
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList && node.classList.contains("mention-chip")) {
        out += `@[${node.dataset.name || ""}](${node.dataset.email || ""}) `;
        return;
      }
      node.childNodes.forEach(walk);
    }
  };
  el.childNodes.forEach(walk);
  return out;
};

/**
 * Google-Docs style mention input.
 * Type "@" to open a suggestion dropdown. Selecting a user turns the
 * typed text into a blue styled chip. Submitting returns plain text with
 * mentions serialized as @[Name](email).
 */
export default function MentionInput({
  placeholder = "Write a comment... (Type @ to mention)",
  collaborators = [],
  onSubmit,
  onChange,
  autoFocus = false,
  small = false,
}) {
  const editorRef = useRef(null);
  const [query, setQuery] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const candidates = query
    ? collaborators.filter((u) => {
        const q = query.toLowerCase();
        return (
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
        );
      })
    : collaborators;

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const text = getTextUpToCaret(el);
    const match = text.match(/(?:^|\s)@([^\s@]*)$/);
    if (match) {
      setQuery(match[1]);
      setActiveIndex(0);
    } else {
      setQuery(null);
    }
    if (onChange) onChange(serializeMentions(el));
  };

  const insertMention = (user) => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const textBefore = getTextUpToCaret(el);
    const match = textBefore.match(/(?:^|\s)@([^\s@]*)$/);
    if (!match) {
      setQuery(null);
      return;
    }

    const atIndex = textBefore.length - match[0].length;
    const { node, offset } = getNodeAndOffset(el, atIndex);
    if (!node) {
      setQuery(null);
      return;
    }

    const name = user.name || user.email.split("@")[0];

    const editRange = document.createRange();
    editRange.setStart(node, offset);
    editRange.setEnd(
      sel.getRangeAt(0).startContainer,
      sel.getRangeAt(0).startOffset
    );
    editRange.deleteContents();

    const chip = document.createElement("span");
    chip.className = "mention-chip";
    chip.contentEditable = "false";
    chip.dataset.name = name;
    chip.dataset.email = user.email;
    chip.dataset.id = user._id || "";
    chip.textContent = "@" + name;

    editRange.insertNode(chip);
    const spacer = document.createTextNode("\u00A0");
    editRange.setStartAfter(chip);
    editRange.insertNode(spacer);

    const caretRange = document.createRange();
    caretRange.setStartAfter(spacer);
    caretRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(caretRange);

    setQuery(null);
    setActiveIndex(0);
    el.focus();
    if (onChange) onChange(serializeMentions(el));
  };

  const handleKeyDown = (e) => {
    if (query !== null && candidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % candidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + candidates.length) % candidates.length
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        insertMention(candidates[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && query === null) {
      e.preventDefault();
      const text = serializeMentions(editorRef.current);
      if (text.trim()) onSubmit(text.trim());
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        autoFocus={autoFocus}
        data-placeholder={placeholder}
        className={`mention-input w-full border border-slate-300 rounded outline-none focus:border-indigo-500 overflow-x-hidden ${
          small
            ? "text-xs px-2 py-1.5 min-h-[30px]"
            : "text-sm px-3 py-1.5 min-h-[38px]"
        }`}
      />

      {query !== null && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-50">
          <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Mention a collaborator
          </div>
          {candidates.length > 0 ? (
            candidates.map((u, i) => (
              <button
                key={u._id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(u);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition ${
                  i === activeIndex ? "bg-indigo-50" : "hover:bg-indigo-50"
                }`}
              >
                <div
                  className={`${
                    small ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs"
                  } rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0`}
                >
                  {(u.name || u.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-slate-700 leading-tight truncate">
                    {u.name || u.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {u.email}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-500 italic">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
