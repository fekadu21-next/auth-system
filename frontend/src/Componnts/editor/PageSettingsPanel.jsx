import { useState } from "react";
import { PAGE_SETTING_PRESETS } from "./pageSettings";

const TYPE_LABELS = {
  none: "None (hidden)",
  roman: "Roman (i, ii, iii…)",
  decimal: "Numbers (1, 2, 3…)",
};

const PRESET_LIST = [
  { label: "1, 2, 3… from page 1", value: PAGE_SETTING_PRESETS.decimalFromOne },
  { label: "Skip first page (1 starts on page 2)", value: PAGE_SETTING_PRESETS.skipFirstPage },
  { label: "Roman intro → numbers (none → i, ii, iii → 1, 2, 3)", value: PAGE_SETTING_PRESETS.romanThenDecimal },
];

/**
 * Page Setup & Numbering panel.
 * Lets the user configure:
 *  - whether page numbers are shown
 *  - numbering sections: physical start page, style (none / roman / decimal),
 *    and the value of the first number in the section
 * Changes are applied live (saved to the backend by the parent).
 */
export default function PageSettingsPanel({ settings, onChange, onClose }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(settings)));

  const update = (next) => {
    setDraft(next);
    onChange(next);
  };

  const updateSection = (index, patch) => {
    const sections = draft.sections.map((sec, i) =>
      i === index ? { ...sec, ...patch } : sec
    );
    update({ ...draft, sections });
  };

  const addSection = () => {
    const maxStart = draft.sections.reduce((m, s) => Math.max(m, s.startPage), 1);
    const sections = [
      ...draft.sections,
      { startPage: maxStart + 1, type: "decimal", startFrom: 1 },
    ];
    update({ ...draft, sections });
  };

  const removeSection = (index) => {
    if (draft.sections.length <= 1) return;
    const sections = draft.sections.filter((_, i) => i !== index);
    update({ ...draft, sections });
  };

  const inputCls =
    "border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400";

  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 text-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Page Setup & Numbering</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
          ×
        </button>
      </div>

      <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={draft.showPageNumbers}
          onChange={(e) => update({ ...draft, showPageNumbers: e.target.checked })}
          className="accent-indigo-600"
        />
        Show page numbers
      </label>

      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
          Quick presets
        </div>
        <div className="flex flex-col">
          {PRESET_LIST.map((p) => (
            <button
              key={p.label}
              onClick={() => update(JSON.parse(JSON.stringify(p.value)))}
              className="text-left text-xs px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
        Numbering sections
      </div>
      <div className="space-y-1.5">
        {draft.sections.map((sec, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <input
              type="number"
              min={1}
              value={sec.startPage}
              title="Starting physical page"
              onChange={(e) =>
                updateSection(i, { startPage: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className={`${inputCls} w-14`}
            />
            <select
              value={sec.type}
              onChange={(e) => updateSection(i, { type: e.target.value })}
              className={`${inputCls} flex-1`}
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={sec.startFrom}
              title="First number in this section"
              onChange={(e) =>
                updateSection(i, { startFrom: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className={`${inputCls} w-12`}
            />
            <button
              onClick={() => removeSection(i)}
              disabled={draft.sections.length <= 1}
              className="text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
              title="Remove section"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addSection}
        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + Add section
      </button>

      <p className="mt-2 text-[10px] text-slate-400 leading-snug">
        Each section starts at a physical page and applies a numbering style. The last
        section continues to the end of the document.
      </p>
    </div>
  );
}
