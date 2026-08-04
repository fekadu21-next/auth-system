import { useMemo } from "react";

/**
 * Format a Telegram / Google-Docs style "who is typing" message.
 * 1 -> "Alex is typing"
 * 2 -> "Alex and Maya are typing"
 * 3+ -> "Alex, Maya and 2 others are typing"
 */
const formatTypingText = (names) => {
  const list = names.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return `${list[0]} is typing`;
  if (list.length === 2) return `${list[0]} and ${list[1]} are typing`;
  return `${list[0]}, ${list[1]} and ${list.length - 2} other${list.length - 2 > 1 ? "s" : ""} are typing`;
};

/**
 * TypingIndicator — animated "bouncing dots + name" pill.
 *
 * @param {Array} users - [{ name, color }] of everyone currently typing.
 * @param {string} [dotColor] - color of the dots (defaults to user color of the first typist).
 * @param {string} [className] - extra classes (e.g. text color).
 */
export default function TypingIndicator({
  users = [],
  dotColor,
  className = "",
  textClassName = "",
}) {
  const text = useMemo(() => formatTypingText(users.map((u) => u.name)), [users]);
  const dotsColor =
    dotColor || (users[0]?.color) || "#6366f1";

  if (users.length === 0) return null;

  return (
    <span className={`typing-indicator inline-flex items-center gap-1.5 ${className}`} role="status" aria-live="polite">
      <span className="typing-dots" style={{ color: dotsColor }} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className={`typing-indicator-text ${textClassName}`}>{text}&hellip;</span>
    </span>
  );
}
