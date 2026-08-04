import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN_X,
  PAGE_MARGIN_Y,
  CONTENT_HEIGHT,
  CONTENT_WIDTH,
} from "../Componnts/editor/pageGeometry";
import { normalizePageSettings, getPageNumberLabel } from "../Componnts/editor/pageSettings";

const EXPORT_SCALE = 2;

function safeFilename(name) {
  return (name || "document").replace(/[\\/:*?"<>|]+/g, "").trim() || "document";
}

// Strip editor-only chrome (selection rings, collaboration carets) and turn
// image width/height attributes into inline styles so the exported pages look
// exactly like the editor sheets.
function prepareExportHtml(html) {
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  wrap
    .querySelectorAll(
      ".collaboration-caret__caret, .collaboration-caret__label, .collaboration-cursor__caret, .collaboration-cursor__label, .selectedCell, .table-controls-active"
    )
    .forEach((el) => el.remove());
  wrap.querySelectorAll("img").forEach((img) => {
    const w = img.getAttribute("width");
    const h = img.getAttribute("height");
    if (w && /^\d+(\.\d+)?(px)?$/i.test(w.trim())) {
      img.style.width = w.trim();
      img.removeAttribute("width");
    }
    if (h && /^\d+(\.\d+)?(px)?$/i.test(h.trim())) {
      img.style.height = h.trim();
      img.removeAttribute("height");
    }
  });
  return wrap.innerHTML;
}

/**
 * Render the full editor content as a PDF whose pages match the on-screen
 * page sheets exactly (same margins, same content height per page, optional
 * page numbers).
 */
export async function exportHtmlAsPdf({ html, documentTitle, pageNumberSettings }) {
  const root = document.createElement("div");
  root.className = "doc-editor-content";
  root.style.cssText = [
    "position:absolute",
    "top:0",
    "left:0",
    "z-index:-1000",
    "pointer-events:none",
    `width:${CONTENT_WIDTH}px`,
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#202124",
  ].join(";");
  root.innerHTML = prepareExportHtml(html);

  document.body.appendChild(root);

  try {
    // Make sure fonts and images are fully loaded before capturing.
    await Promise.all([
      document.fonts?.ready?.catch?.(() => {}),
      ...Array.from(root.querySelectorAll("img")).map((img) =>
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      ),
    ]);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    // Paginate exactly like the editor: content is a continuous flow, every
    // CONTENT_HEIGHT px of rendered content becomes one page.
    const totalHeight = Math.max(CONTENT_HEIGHT, root.scrollHeight);
    const pageCount = Math.max(1, Math.ceil(totalHeight / CONTENT_HEIGHT));

    const canvas = await html2canvas(root, {
      scale: EXPORT_SCALE,
      useCORS: true,
      letterRendering: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: CONTENT_WIDTH,
      height: totalHeight,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [PAGE_WIDTH, PAGE_HEIGHT],
      compress: true,
    });

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = PAGE_WIDTH * EXPORT_SCALE;
    pageCanvas.height = PAGE_HEIGHT * EXPORT_SCALE;
    const ctx = pageCanvas.getContext("2d");

    const settings = normalizePageSettings(pageNumberSettings);

    for (let i = 0; i < pageCount; i++) {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      const srcY = i * CONTENT_HEIGHT * EXPORT_SCALE;
      const srcH = Math.min(CONTENT_HEIGHT * EXPORT_SCALE, canvas.height - srcY);
      ctx.drawImage(
        canvas,
        0,
        srcY,
        canvas.width,
        srcH,
        PAGE_MARGIN_X * EXPORT_SCALE,
        PAGE_MARGIN_Y * EXPORT_SCALE,
        canvas.width,
        srcH
      );

      if (settings.showPageNumbers) {
        const label = getPageNumberLabel(i + 1, settings);
        if (label) {
          ctx.fillStyle = "#80868b";
          ctx.font = "20px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(label, PAGE_WIDTH, PAGE_HEIGHT * EXPORT_SCALE - 60);
        }
      }
      ctx.restore();

      if (i > 0) pdf.addPage();
      pdf.addImage(
        pageCanvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        PAGE_WIDTH,
        PAGE_HEIGHT
      );
    }

    pdf.save(`${safeFilename(documentTitle)}.pdf`);
  } finally {
    root.remove();
  }
}
