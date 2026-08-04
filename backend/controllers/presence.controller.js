import { getUsersInDocument } from "../repositories/presence.repository.js";

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const { documentId } = req.params;

    const users = await getUsersInDocument(documentId);

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};