import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { CodeBlock } from "@tiptap/extension-code-block";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Markdown } from "tiptap-markdown";
import ResizableImage from "./ResizableImage.jsx";

// =====================================
// CUSTOM EXTENSIONS
// =====================================

export const ResizableImageExtension = Node.create({
  name: "image",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "300px" },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
          ({ commands }) =>
            commands.insertContent({
              type: this.name,
              attrs: options,
            }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

/**
 * FontSize Extension
 */
export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
          ({ chain }) =>
            chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
          ({ chain }) =>
            chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

/**
 * PageBreak Extension - optional explicit page break marker.
 */
export const PageBreak = Extension.create({
  name: "pageBreak",
  addCommands() {
    return {
      insertPageBreak:
        () =>
          ({ chain }) =>
            chain().insertContent('<div class="page-break"></div>').run(),
    };
  },
});

/**
 * Custom Bullet List Extension
 */
export const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      listStyleType: {
        default: "disc",
        parseHTML: (element) => element.style.listStyleType || "disc",
        renderHTML: (attributes) => {
          return { style: `list-style-type: ${attributes.listStyleType}` };
        },
      },
    };
  },
});

/**
 * Custom Ordered List Extension
 */
export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      listStyleType: {
        default: "decimal",
        parseHTML: (element) => element.style.listStyleType || "decimal",
        renderHTML: (attributes) => {
          return { style: `list-style-type: ${attributes.listStyleType}` };
        },
      },
    };
  },
});

// =====================================
// EXTENSION COLLECTIONS
// =====================================

export const getStandardExtensions = () => [
  StarterKit.configure({
    undoRedo: false,
    codeBlock: false,
    link: false,
    underline: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
  }),
  CustomBulletList,
  CustomOrderedList,
  ListItem,
  Underline,
  TextStyle,
  FontSize,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ openOnClick: false, autolink: true }),
  ResizableImageExtension,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  CodeBlock,
  PageBreak,
  Markdown.configure({ html: true, tightLists: true, tightListClass: true }),
  Placeholder.configure({ placeholder: "Type @ to mention, or start writing..." }),
];

export const getCollaborationExtensions = (ydoc, provider, userName, userColor) => [
  Collaboration.configure({ document: ydoc }),
  CollaborationCaret.configure({
    provider,
    user: { name: userName || "Anonymous", color: userColor || "#1a73e8" },
  }),
];

// =====================================
// AUTHENTIC GOOGLE DOCS CONSTANTS
// =====================================

export const FONT_SIZES = [
  "8px", "9px", "10px", "11px", "12px", "14px", "18px", "24px", "30px", "36px", "48px", "60px", "72px", "96px"
];

export const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4ccd0", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c1c", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#5b0f0f", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1155cc", "#0b5394", "#351c75", "#4c1130"
];

export const HIGHLIGHT_COLORS = [
  "#ffffff", "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ff0000", "#0000ff", "#008000", "#800080", "#ff6600",
  "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#ead1dc", "#f4ccd0", "#fce5cd", "#efefef", "#d9d9d9", "#b7b7b7"
];
