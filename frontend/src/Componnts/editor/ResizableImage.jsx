import { useState, useRef, useEffect } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const MIN_IMAGE_WIDTH = 48;

/**
 * Resizable Image Component with 4 Corner Handles.
 * Drag any corner to scale the image (maintains aspect ratio).
 */
export default function ResizableImage({ node, updateAttributes, selected, getPos, editor }) {
  const [resizing, setResizing] = useState(false);
  const [aspect, setAspect] = useState(null);
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  // Read natural aspect ratio once the image has loaded.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const readRatio = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };

    readRatio();
    img.addEventListener("load", readRatio);
    return () => img.removeEventListener("load", readRatio);
  }, [node.attrs.src]);

  const selectNode = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos != null && editor && typeof editor.commands?.setNodeSelection === "function") {
      editor.commands.setNodeSelection(pos);
    }
  };

  const handleMouseDown = (corner, e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const img = imgRef.current;
    const wrapper = wrapRef.current;

    const startWidth = img ? img.clientWidth : parseInt(node.attrs.width, 10) || 300;
    const startHeight = img ? img.clientHeight : startWidth / (aspect || 1);
    const ratio = aspect || (startHeight > 0 ? startWidth / startHeight : 1);
    const maxWidth = wrapper ? wrapper.parentElement?.clientWidth || 800 : 800;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      if (corner.includes("right")) newWidth = startWidth + dx;
      if (corner.includes("left")) newWidth = startWidth - dx;

      // When the user drags mostly vertically, prefer height-driven sizing.
      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        const newHeight = corner.includes("bottom") ? startHeight + dy : startHeight - dy;
        newWidth = newHeight * ratio;
      }

      newWidth = Math.max(MIN_IMAGE_WIDTH, Math.min(maxWidth, newWidth));
      const newHeight = newWidth / ratio;

      if (wrapper) wrapper.style.width = `${newWidth}px`;
      if (img) {
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      }
    };

    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      const finalImg = imgRef.current;
      const finalWrapper = wrapRef.current;
      const w = finalImg ? finalImg.clientWidth : finalWrapper?.clientWidth;
      if (w && Number.isFinite(w)) {
        updateAttributes({ width: `${Math.round(w)}px`, height: null });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <NodeViewWrapper
      ref={wrapRef}
      contentEditable={false}
      onMouseDown={selectNode}
      className={`relative inline-block my-2 group select-none cursor-pointer ${
        selected ? "ring-2 ring-blue-500 rounded" : ""
      }`}
      style={{ width: node.attrs.width || "auto", maxWidth: "100%", whiteSpace: "normal" }}
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || "Uploaded content"}
        style={{ width: "100%", height: "auto", display: "block" }}
        className="rounded shadow-xs pointer-events-none"
        draggable={false}
      />

      {(selected || resizing) && (
        <>
          {/* Corner Handles */}
          <div
            onMouseDown={(e) => handleMouseDown("top-left", e)}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 border border-white rounded-xs cursor-nwse-resize z-20 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleMouseDown("top-right", e)}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-xs cursor-nesw-resize z-20 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleMouseDown("bottom-left", e)}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 border border-white rounded-xs cursor-nesw-resize z-20 hover:scale-125 transition-transform"
          />
          <div
            onMouseDown={(e) => handleMouseDown("bottom-right", e)}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-xs cursor-nwse-resize z-20 hover:scale-125 transition-transform"
          />
        </>
      )}
    </NodeViewWrapper>
  );
}
