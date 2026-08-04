export const validateCreateVersion = (data) => {
  const { documentId, content } = data;

  if (!documentId) throw new Error("documentId is required");
  if (!content) throw new Error("content is required");
};
export const validateRestoreVersion = (id) => {
  if (!id) throw new Error("Version ID is required");
};

export const validateRenameVersion = (id, name) => {
  if (!id) throw new Error("Version ID is required");
  if (!name || !String(name).trim()) throw new Error("Version name is required");
  if (String(name).trim().length > 200) {
    throw new Error("Version name must be 200 characters or fewer");
  }
};