import { useState } from "react";

const MAX_ROWS = 10;
const MAX_COLS = 10;

/**
 * Google Docs style table insert grid.
 * Hover over the grid to pick a size (e.g. 3 × 3, 4 × 4), click to insert.
 */
export default function TableInsertMenu({ editor, onClose }) {
  const [hover, setHover] = useState({ rows: 1, cols: 1 });

  const insert = (rows, cols) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md p-2 z-50">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 16px)` }}
        onMouseLeave={() => setHover({ rows: 1, cols: 1 })}
      >
        {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
          const row = Math.floor(i / MAX_COLS) + 1;
          const col = (i % MAX_COLS) + 1;
          const active = row <= hover.rows && col <= hover.cols;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onClick={() => insert(hover.rows, hover.cols)}
              className={`h-4 cursor-pointer border border-white transition-colors ${
                active ? "bg-blue-500" : "bg-gray-200 hover:bg-gray-300"
              }`}
              style={{ width: 16 }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between px-0.5">
        <span className="text-xs font-medium text-gray-700">
          {hover.cols} × {hover.rows}
        </span>
        <button
          onClick={() => insert(hover.rows, hover.cols)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Insert
        </button>
      </div>
    </div>
  );
}
