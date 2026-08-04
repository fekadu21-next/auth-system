// Deterministic color for a user, derived from their email/name.
// Kept in one place so avatars, carets and the typing indicator share the
// exact same color for the same person.
export const getUserColor = (seed = "") => {
  const first = String(seed || "").charCodeAt(0) || 0;
  const hex = Math.floor(Math.abs(Math.sin(first) * 16777215))
    .toString(16)
    .padEnd(6, "0");
  return "#" + hex;
};
