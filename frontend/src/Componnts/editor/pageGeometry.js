// =====================================
// PAGE GEOMETRY (Letter size, ~1 inch margins)
// Shared by the editor view and the PDF exporter so downloads paginate
// exactly like the on-screen sheets.
// =====================================
export const PAGE_WIDTH = 816; // px
export const PAGE_HEIGHT = 1056; // px (11in @96dpi)
export const PAGE_MARGIN_X = 96; // ~1 inch
export const PAGE_MARGIN_Y = 96;
// The editable content area on one page. This is the "one page = this much
// content" limit. Everything beyond it automatically becomes the next page.
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN_Y * 2; // 864
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN_X * 2; // 624
