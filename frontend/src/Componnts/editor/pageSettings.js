// =====================================
// PAGE NUMBERING LOGIC (frontend only)
// =====================================
// Pages are NOT stored. The document is ONE continuous flow and pages are a
// purely visual, height-based split on the frontend. This module holds the
// numbering rules + roman conversion helpers.

export const DEFAULT_PAGE_SETTINGS = {
  showPageNumbers: true,
  sections: [{ startPage: 1, type: "decimal", startFrom: 1 }],
};

const ROMAN_TABLE = [
  ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100],
  ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9],
  ["V", 5], ["IV", 4], ["I", 1],
];

export function toRoman(num) {
  if (!Number.isFinite(num) || num <= 0) return "";
  if (num >= 4000) return String(num);
  let out = "";
  let n = Math.floor(num);
  for (const [symbol, value] of ROMAN_TABLE) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out.toLowerCase();
}

/**
 * Normalize an arbitrary (possibly partial / missing) settings object.
 * Returns a safe structure: { showPageNumbers, sections }.
 */
export function normalizePageSettings(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  const sections = Array.isArray(s.sections) && s.sections.length
    ? s.sections
        .filter((sec) => sec && Number.isFinite(Number(sec.startPage)))
        .map((sec) => ({
          startPage: Math.max(1, Math.floor(Number(sec.startPage)) || 1),
          type: ["none", "roman", "decimal"].includes(sec.type) ? sec.type : "decimal",
          startFrom: Number.isFinite(Number(sec.startFrom)) ? Math.max(1, Math.floor(Number(sec.startFrom)) || 1) : 1,
        }))
        .sort((a, b) => a.startPage - b.startPage)
    : [...DEFAULT_PAGE_SETTINGS.sections];

  return {
    showPageNumbers: s.showPageNumbers !== false,
    sections,
  };
}

/**
 * Resolve the label for a physical page.
 *
 * Sections describe, in order, where each numbering style begins:
 *   { startPage: 2, type: "roman", startFrom: 1 }  ->  page 2 = i, page 3 = ii ...
 *   { startPage: 5, type: "decimal", startFrom: 1 } -> page 5 = 1, page 6 = 2 ...
 * The last section extends to the end of the document.
 */
export function getPageNumberLabel(page, settings) {
  const s = normalizePageSettings(settings);
  if (!s.showPageNumbers) return "";

  let section = null;
  for (const sec of s.sections) {
    if (page >= sec.startPage) section = sec;
    else break;
  }
  if (!section || section.type === "none") return "";

  const value = page - section.startPage + section.startFrom;
  return section.type === "roman" ? toRoman(value) : String(value);
}

export const PAGE_SETTING_PRESETS = {
  decimalFromOne: {
    showPageNumbers: true,
    sections: [{ startPage: 1, type: "decimal", startFrom: 1 }],
  },
  skipFirstPage: {
    showPageNumbers: true,
    sections: [
      { startPage: 1, type: "none", startFrom: 1 },
      { startPage: 2, type: "decimal", startFrom: 1 },
    ],
  },
  romanThenDecimal: {
    showPageNumbers: true,
    sections: [
      { startPage: 1, type: "none", startFrom: 1 },
      { startPage: 2, type: "roman", startFrom: 1 },
      { startPage: 5, type: "decimal", startFrom: 1 },
    ],
  },
};
