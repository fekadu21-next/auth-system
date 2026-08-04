let ysocketio = null;
export const setYSocketIO = (instance) => {
  ysocketio = instance;
};

export const getYSocketIO = () => ysocketio;

export const clearYjsDocument = async (documentId) => {
  if (!ysocketio) return;
  const doc = ysocketio.documents.get(String(documentId));
  if (doc) {
    await doc.destroy();
  }
};

export const initializeYjsDocument = async (documentId, content) => {
  if (!ysocketio) return;
  const doc = ysocketio.documents.get(String(documentId));
  if (doc) {
    const fragment = doc.getXmlFragment("default");
    // Only initialize if fragment is empty
    if (fragment.length === 0 && content && Object.keys(content).length > 0) {
      console.log("📄 Initializing Yjs document with content:", documentId);
    }
  }
};
