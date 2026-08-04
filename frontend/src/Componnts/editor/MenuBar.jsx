import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, CheckSquare, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Code, Highlighter, Type, Undo, Redo,
  Plus, Minus, Printer,
  Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Layout as LayoutIcon, Loader2,
  FilePlus2, FolderOpen, Download, FileText, FileDown, Undo2, Redo2, ChevronRight,
  ChevronDown, Check
} from "lucide-react";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "./extensions.jsx";
import PageSettingsPanel from "./PageSettingsPanel";
import TableInsertMenu from "./TableInsertMenu";
import { API_URL } from "../../api";
import { useUi } from "../useUi.js";
import { exportHtmlAsPdf } from "../../utils/exportPdf.js";

function MenuBar({
  editor,
  canEdit,
  pageNumberSettings,
  onUpdatePageSettings,
  showPageSettings,
  onTogglePageSettings,
  onNewDocument,
  documentTitle,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [showOrderedMenu, setShowOrderedMenu] = useState(false);

  // Top menu bar (File / Edit / Insert) state
  const [openMenu, setOpenMenu] = useState(null); // "file" | "edit" | "insert" | null
  const [fileSection, setFileSection] = useState(null); // null | "download"
  const [insertSection, setInsertSection] = useState(null); // null | "image" | "table" | "link"

  const { showToast, prompt } = useUi();

  const colorRef = useRef(null);
  const highlightRef = useRef(null);
  const linkRef = useRef(null);
  const imageRef = useRef(null);
  const tableRef = useRef(null);
  const pageRef = useRef(null);
  const fileRef = useRef(null);
  const editRef = useRef(null);
  const insertRef = useRef(null);
  const openFileInputRef = useRef(null);
  const bulletRef = useRef(null);
  const orderedRef = useRef(null);

  // Close every open dropdown when the user clicks outside of them.
  const closeMenus = useCallback(() => {
    setShowColorPicker(false);
    setShowHighlightPicker(false);
    setShowLinkMenu(false);
    setShowImageMenu(false);
    setShowTableMenu(false);
    setShowBulletMenu(false);
    setShowOrderedMenu(false);
    setOpenMenu(null);
    setFileSection(null);
    setInsertSection(null);
    if (showPageSettings) onTogglePageSettings();
  }, [showPageSettings, onTogglePageSettings]);

  const closeMenusRef = useRef(closeMenus);
  useEffect(() => {
    closeMenusRef.current = closeMenus;
  });

  useEffect(() => {
    const onMouseDown = (e) => {
      const wrappers = [colorRef, highlightRef, linkRef, imageRef, tableRef, pageRef, fileRef, editRef, insertRef, bulletRef, orderedRef];
      const inside = wrappers.some((r) => r.current && r.current.contains(e.target));
      if (!inside) closeMenusRef.current?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeMenusRef.current?.();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!editor || !canEdit) return null;

  const btnClass = (active) =>
    `p-1.5 rounded hover:bg-gray-200 transition-colors flex items-center justify-center ${
      active ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
    }`;

  const dropdownBtnClass = "px-3 py-1.5 hover:bg-gray-100 text-left text-xs text-gray-700 flex items-center gap-2 w-full transition-colors";

  const menuBtnClass = (active) =>
    `px-2 py-1 rounded hover:bg-gray-200 text-gray-800 font-medium transition-colors ${
      active ? "bg-gray-200" : ""
    }`;

  const topDropdownClass = "absolute top-full left-0 mt-0.5 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-[100] text-xs";

  const safeName = (name) => (name || "document").replace(/[\\/:*?"<>|]+/g, "").trim() || "document";

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ---------- File menu actions ----------

  const handleNew = () => {
    closeMenus();
    if (onNewDocument) onNewDocument();
  };

  const handleOpenFile = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        editor.chain().focus().setContent(text).run();
        showToast("File imported. You can edit it in the editor now.", "success");
      } catch (err) {
        console.error("Open markdown failed:", err);
        showToast("Failed to import file: " + err.message, "error");
      } finally {
        closeMenus();
      }
    };
    reader.readAsText(file);
  };

  const downloadMarkdown = () => {
    try {
      const md =
        typeof editor.storage?.markdown?.getMarkdown === "function"
          ? editor.storage.markdown.getMarkdown()
          : null;
      const content = typeof md === "string" && md.trim() ? md : editor.getText();
      downloadBlob(content, `${safeName(documentTitle)}.md`, "text/markdown;charset=utf-8");
    } catch (err) {
      console.error("Markdown export failed:", err);
      showToast("Failed to download markdown: " + err.message, "error");
    } finally {
      closeMenus();
    }
  };

  const downloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      await exportHtmlAsPdf({
        html: editor.getHTML(),
        documentTitle,
        pageNumberSettings,
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed: " + err.message, "error");
    } finally {
      setDownloadingPdf(false);
      closeMenus();
    }
  };

  // ---------- Edit menu actions ----------

  const handleUndo = () => {
    editor.chain().focus().undo().run();
    closeMenus();
  };

  const handleRedo = () => {
    editor.chain().focus().redo().run();
    closeMenus();
  };

  // ---------- Insert menu actions ----------

  const uploadAndInsertImage = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        setUploadingImage(true);
        const res = await fetch(`${API_URL}/api/uploads/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dataUrl: ev.target.result }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Upload failed");
        }
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url, alt: file.name || "Uploaded image" }).run();
      } catch (err) {
        console.error("Image upload failed:", err);
        showToast("Image upload failed: " + err.message, "error");
      } finally {
        setUploadingImage(false);
        closeMenus();
      }
    };
    reader.readAsDataURL(file);
  };

  const addImageByURL = async () => {
    const url = await prompt({
      title: "Insert image by URL",
      message: "Paste the web address of the image you want to add.",
      placeholder: "https://example.com/image.png",
      confirmText: "Insert",
    });
    if (url) editor.chain().focus().setImage({ src: url }).run();
    closeMenus();
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    closeMenus();
  };

  const toggleLinkMenu = () => {
    setShowLinkMenu((s) => !s);
    if (!showLinkMenu) setLinkUrl(editor.getAttributes("link").href || "");
  };

  const currentSize = editor.getAttributes("textStyle").fontSize || "11px";

  const handleSizeChange = (delta) => {
    const currentInt = parseInt(currentSize, 10) || 11;
    const newSize = `${Math.max(6, Math.min(120, currentInt + delta))}px`;
    editor.chain().focus().setFontSize(newSize).run();
  };

  // ---------- List style actions ----------

  const applyBulletStyle = (style) => {
    const chain = editor.chain().focus();
    if (!editor.isActive("bulletList")) chain.toggleBulletList();
    chain.updateAttributes("bulletList", { listStyleType: style }).run();
    closeMenus();
  };

  const applyOrderedStyle = (style) => {
    const chain = editor.chain().focus();
    if (!editor.isActive("orderedList")) chain.toggleOrderedList();
    chain.updateAttributes("orderedList", { listStyleType: style }).run();
    closeMenus();
  };

  const BULLET_STYLES = [
    { value: "disc", symbol: "•", label: "Bulleted list" },
    { value: "circle", symbol: "○", label: "Circle bullets" },
    { value: "square", symbol: "■", label: "Square bullets" },
  ];

  const ORDERED_STYLES = [
    { value: "decimal", symbol: "1", label: "Numbers" },
    { value: "lower-alpha", symbol: "a", label: "Lowercase letters" },
    { value: "upper-alpha", symbol: "A", label: "Uppercase letters" },
    { value: "lower-roman", symbol: "i", label: "Roman numerals" },
  ];

  return (
    <div className="w-full bg-[#f9bf02]/5 border-b border-gray-300 select-none font-sans text-xs">
      {/* Top Google Docs Actions Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#f9fbfd] border-b border-gray-200">
        <div className="flex items-center gap-1 text-gray-600">
          {/* File menu */}
          <div className="relative" ref={fileRef}>
            <button
              onClick={() => {
                setOpenMenu(openMenu === "file" ? null : "file");
                setFileSection(null);
              }}
              className={menuBtnClass(openMenu === "file")}
            >
              File
            </button>
            {openMenu === "file" && (
              <div className={topDropdownClass} style={{ width: "13rem" }}>
                <button className={dropdownBtnClass} onClick={handleNew}>
                  <FilePlus2 size={13} /> New
                </button>
                <button className={dropdownBtnClass} onClick={() => openFileInputRef.current?.click()}>
                  <FolderOpen size={13} /> Open…
                </button>
                <input
                  ref={openFileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,text/markdown,text/plain"
                  className="hidden"
                  onChange={handleOpenFile}
                />

                <div className="border-t border-gray-200 my-1" />

                <div className="relative">
                  <button
                    className={`${dropdownBtnClass} justify-between pr-2`}
                    onClick={() => setFileSection(fileSection === "download" ? null : "download")}
                  >
                    <span className="flex items-center gap-2">
                      <Download size={13} /> Download
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  {fileSection === "download" && (
                    <div
                      className="absolute left-full top-0 ml-0.5 bg-white border border-gray-200 shadow-xl rounded-md py-1 text-xs z-[101]"
                      style={{ width: "12rem" }}
                    >
                      <button className={dropdownBtnClass} onClick={downloadMarkdown}>
                        <FileText size={13} /> Markdown (.md)
                      </button>
                      <button
                        className={`${dropdownBtnClass} ${downloadingPdf ? "opacity-60 pointer-events-none" : ""}`}
                        onClick={downloadPDF}
                        disabled={downloadingPdf}
                      >
                        {downloadingPdf ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                        PDF (.pdf)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit menu */}
          <div className="relative" ref={editRef}>
            <button
              onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")}
              className={menuBtnClass(openMenu === "edit")}
            >
              Edit
            </button>
            {openMenu === "edit" && (
              <div className={topDropdownClass} style={{ width: "13rem" }}>
                <button className={`${dropdownBtnClass} justify-between pr-2`} onClick={handleUndo}>
                  <span className="flex items-center gap-2">
                    <Undo2 size={13} /> Undo
                  </span>
                  <span className="text-gray-400">Ctrl+Z</span>
                </button>
                <button className={`${dropdownBtnClass} justify-between pr-2`} onClick={handleRedo}>
                  <span className="flex items-center gap-2">
                    <Redo2 size={13} /> Redo
                  </span>
                  <span className="text-gray-400">Ctrl+Y</span>
                </button>
              </div>
            )}
          </div>

          {/* Insert menu */}
          <div className="relative" ref={insertRef}>
            <button
              onClick={() => {
                setOpenMenu(openMenu === "insert" ? null : "insert");
                setInsertSection(null);
              }}
              className={menuBtnClass(openMenu === "insert")}
            >
              Insert
            </button>
            {openMenu === "insert" && (
              <div className={topDropdownClass} style={{ width: "13rem" }}>
                {/* Image */}
                <div className="relative">
                  <button
                    className={`${dropdownBtnClass} justify-between pr-2`}
                    onClick={() => setInsertSection(insertSection === "image" ? null : "image")}
                  >
                    <span className="flex items-center gap-2">
                      <ImageIcon size={13} /> Image
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  {insertSection === "image" && (
                    <div
                      className="absolute left-full top-0 ml-0.5 bg-white border border-gray-200 shadow-xl rounded-md py-1 text-xs z-[101]"
                      style={{ width: "12rem" }}
                    >
                      <label
                        className={`${dropdownBtnClass} ${uploadingImage ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                      >
                        <span>{uploadingImage ? "Uploading..." : "Upload from computer"}</span>
                        {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : null}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) uploadAndInsertImage(file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button className={dropdownBtnClass} onClick={addImageByURL}>
                        By URL
                      </button>
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="relative">
                  <button
                    className={`${dropdownBtnClass} justify-between pr-2`}
                    onClick={() => setInsertSection(insertSection === "table" ? null : "table")}
                  >
                    <span className="flex items-center gap-2">
                      <TableIcon size={13} /> Table
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  {insertSection === "table" && (
                    <div className="absolute left-full top-0 ml-0.5 z-[101]">
                      <TableInsertMenu editor={editor} onClose={closeMenus} />
                    </div>
                  )}
                </div>

                {/* Link */}
                <div className="relative">
                  <button
                    className={`${dropdownBtnClass} justify-between pr-2`}
                    onClick={() => {
                      const opening = insertSection !== "link";
                      setInsertSection(opening ? "link" : null);
                      if (opening) setLinkUrl(editor.getAttributes("link").href || "");
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <LinkIcon size={13} /> Link
                    </span>
                    <ChevronRight size={12} />
                  </button>
                  {insertSection === "link" && (
                    <div
                      className="absolute left-full top-0 ml-0.5 bg-white border border-gray-200 shadow-xl rounded-md p-2 text-xs z-[101]"
                      style={{ width: "16rem" }}
                    >
                      <div className="text-[10px] text-gray-500 font-semibold mb-1">LINK</div>
                      <div className="flex items-center gap-1">
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") applyLink();
                          }}
                          placeholder="https://example.com"
                          className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          autoFocus
                        />
                        <button
                          onClick={applyLink}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                      {editor.isActive("link") && (
                        <button
                          className={`${dropdownBtnClass} mt-1 text-red-600`}
                          onClick={() => {
                            editor.chain().focus().extendMarkRange("link").unsetLink().run();
                            closeMenus();
                          }}
                        >
                          <Trash2 size={13} /> Remove link
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1 bg-[#edf2fa] rounded-full mx-2 my-1 shadow-xs border border-gray-200">
        {/* Undo/Redo & Print */}
        <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} title="Undo (Ctrl+Z)">
          <Undo size={15} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} title="Redo (Ctrl+Y)">
          <Redo size={15} />
        </button>
        <button onClick={() => window.print()} className={btnClass(false)} title="Print (Ctrl+P)">
          <Printer size={15} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Style Selector */}
        <div className="relative">
          <select
            className="text-xs border-none rounded bg-transparent px-2 py-1 text-gray-700 hover:bg-gray-200 focus:outline-none cursor-pointer font-medium"
            value={
              editor.isActive("heading", { level: 1 }) ? "h1" :
              editor.isActive("heading", { level: 2 }) ? "h2" :
              editor.isActive("heading", { level: 3 }) ? "h3" : "p"
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: parseInt(v.replace("h", ""), 10) }).run();
            }}
          >
            <option value="p">Normal text</option>
            <option value="h1">Title / Heading 1</option>
            <option value="h2">Subtitle / Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded px-1">
          <button onClick={() => handleSizeChange(-1)} className="p-1 hover:bg-gray-300 rounded text-gray-600">
            <Minus size={12} />
          </button>
          <input
            type="text"
            className="w-7 text-center bg-transparent border-none text-xs text-gray-800 font-medium focus:outline-none"
            value={parseInt(currentSize, 10) || 11}
            onChange={(e) => {
              const val = e.target.value;
              if (val) editor.chain().focus().setFontSize(`${val}px`).run();
            }}
          />
          <button onClick={() => handleSizeChange(1)} className="p-1 hover:bg-gray-300 rounded text-gray-600">
            <Plus size={12} />
          </button>
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Styles */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold">
          <Bold size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic">
          <Italic size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline">
          <UnderlineIcon size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))} title="Strikethrough">
          <Strikethrough size={15} />
        </button>

        {/* Text Color Picker */}
        <div className="relative" ref={colorRef}>
          <button onClick={() => setShowColorPicker(!showColorPicker)} className={btnClass(false)} title="Text color">
            <div className="flex flex-col items-center">
              <Type size={14} />
              <div className="w-3 h-1 rounded-full mt-0.5" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }} />
            </div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 shadow-xl rounded-md p-2 z-50 w-52">
              <div className="text-[10px] text-gray-500 font-semibold mb-1">COLOR PALETTE</div>
              <div className="grid grid-cols-10 gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      editor.chain().focus().setColor(c).run();
                      setShowColorPicker(false);
                    }}
                    className="w-4 h-4 rounded-full border border-gray-200 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative" ref={highlightRef}>
          <button onClick={() => setShowHighlightPicker(!showHighlightPicker)} className={btnClass(editor.isActive("highlight"))} title="Highlight color">
            <div className="flex flex-col items-center">
              <Highlighter size={14} />
              <div className="w-3 h-1 rounded-full mt-0.5" style={{ backgroundColor: editor.getAttributes("highlight").color || "#ffff00" }} />
            </div>
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 shadow-xl rounded-md p-2 z-50 w-44">
              <div className="text-[10px] text-gray-500 font-semibold mb-1">HIGHLIGHT COLOR</div>
              <div className="grid grid-cols-5 gap-1">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: c }).run();
                      setShowHighlightPicker(false);
                    }}
                    className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative" ref={linkRef}>
          <button onClick={toggleLinkMenu} className={btnClass(editor.isActive("link"))} title="Insert Link">
            <LinkIcon size={15} />
          </button>
          {showLinkMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md p-2 z-50 w-56">
              <div className="text-[10px] text-gray-500 font-semibold mb-1">LINK</div>
              <div className="flex items-center gap-1">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyLink();
                  }}
                  placeholder="https://example.com"
                  className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
                <button
                  onClick={applyLink}
                  className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
              {editor.isActive("link") && (
                <button
                  className={`${dropdownBtnClass} mt-1 text-red-600`}
                  onClick={() => {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    setShowLinkMenu(false);
                  }}
                >
                  <Trash2 size={13} /> Remove link
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image Dropdown */}
        <div className="relative" ref={imageRef}>
          <button onClick={() => setShowImageMenu(!showImageMenu)} className={btnClass(false)} title="Insert Image">
            <ImageIcon size={15} />
          </button>
          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded py-1 z-50 w-44">
              <label className={`${dropdownBtnClass} ${uploadingImage ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
                <span>{uploadingImage ? "Uploading..." : "Upload from computer"}</span>
                {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : null}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) uploadAndInsertImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <button className={dropdownBtnClass} onClick={addImageByURL}>
                By URL
              </button>
            </div>
          )}
        </div>

        {/* Table Menu */}
        <div className="relative" ref={tableRef}>
          <button onClick={() => setShowTableMenu(!showTableMenu)} className={btnClass(editor.isActive("table"))} title="Table options">
            <TableIcon size={15} />
          </button>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded py-1 z-50 w-56 text-xs">
              <TableInsertMenu editor={editor} onClose={() => setShowTableMenu(false)} />
              {editor.isActive("table") && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().addRowBefore().run()}>
                    <ArrowUp size={13} /> Add row above
                  </button>
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().addRowAfter().run()}>
                    <ArrowDown size={13} /> Add row below
                  </button>
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().deleteRow().run()}>
                    <Trash2 size={13} /> Delete row
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().addColumnBefore().run()}>
                    <ArrowLeft size={13} /> Add column left
                  </button>
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().addColumnAfter().run()}>
                    <ArrowRight size={13} /> Add column right
                  </button>
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().deleteColumn().run()}>
                    <Trash2 size={13} /> Delete column
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button className={dropdownBtnClass} onClick={() => editor.chain().focus().deleteTable().run()}>
                    <Trash2 size={13} className="text-red-500" /> <span className="text-red-600">Delete table</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignments */}
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnClass(editor.isActive({ textAlign: "left" }))} title="Align left">
          <AlignLeft size={15} />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnClass(editor.isActive({ textAlign: "center" }))} title="Align center">
          <AlignCenter size={15} />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnClass(editor.isActive({ textAlign: "right" }))} title="Align right">
          <AlignRight size={15} />
        </button>
        <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={btnClass(editor.isActive({ textAlign: "justify" }))} title="Justify">
          <AlignJustify size={15} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists & Task Items */}
        <div className="relative flex items-center" ref={bulletRef}>
          <button
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
              setShowBulletMenu(false);
              setShowOrderedMenu(false);
            }}
            className={btnClass(editor.isActive("bulletList"))}
            title="Bulleted list"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => {
              setShowBulletMenu((s) => !s);
              setShowOrderedMenu(false);
            }}
            className="p-0.5 pl-0 pr-0.5 rounded hover:bg-gray-200 text-gray-400 flex items-center"
            title="Bullet style"
          >
            <ChevronDown size={11} />
          </button>
          {showBulletMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 w-52 text-xs">
              {BULLET_STYLES.map((opt) => {
                const active =
                  editor.isActive("bulletList") &&
                  editor.getAttributes("bulletList").listStyleType === opt.value;
                return (
                  <button
                    key={opt.value}
                    className={`${dropdownBtnClass} ${active ? "bg-blue-50 text-blue-700" : ""}`}
                    onClick={() => applyBulletStyle(opt.value)}
                  >
                    <span className="flex items-center gap-2 flex-1">
                      <span className="text-base leading-none w-4 text-center">{opt.symbol}</span>
                      {opt.label}
                    </span>
                    {active && <Check size={12} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative flex items-center" ref={orderedRef}>
          <button
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
              setShowOrderedMenu(false);
              setShowBulletMenu(false);
            }}
            className={btnClass(editor.isActive("orderedList"))}
            title="Numbered list"
          >
            <ListOrdered size={15} />
          </button>
          <button
            onClick={() => {
              setShowOrderedMenu((s) => !s);
              setShowBulletMenu(false);
            }}
            className="p-0.5 pl-0 pr-0.5 rounded hover:bg-gray-200 text-gray-400 flex items-center"
            title="Numbering style"
          >
            <ChevronDown size={11} />
          </button>
          {showOrderedMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 w-52 text-xs">
              {ORDERED_STYLES.map((opt) => {
                const active =
                  editor.isActive("orderedList") &&
                  editor.getAttributes("orderedList").listStyleType === opt.value;
                return (
                  <button
                    key={opt.value}
                    className={`${dropdownBtnClass} ${active ? "bg-blue-50 text-blue-700" : ""}`}
                    onClick={() => applyOrderedStyle(opt.value)}
                  >
                    <span className="flex items-center gap-2 flex-1">
                      <span className="text-base leading-none w-4 text-center">{opt.symbol}</span>
                      {opt.label}
                    </span>
                    {active && <Check size={12} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive("taskList"))} title="Checklist">
          <CheckSquare size={15} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Extras: Code block */}
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))} title="Code Block">
          <Code size={15} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Page setup & numbering */}
        <div className="relative" ref={pageRef}>
          <button
            onClick={onTogglePageSettings}
            className={btnClass(showPageSettings)}
            title="Page setup & numbering"
          >
            <LayoutIcon size={15} />
          </button>
          {showPageSettings && (
            <PageSettingsPanel
              settings={pageNumberSettings}
              onChange={onUpdatePageSettings}
              onClose={onTogglePageSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuBar;
