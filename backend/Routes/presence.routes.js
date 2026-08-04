import express from "express";
import { getOnlineUsers } from "../controllers/presence.controller.js";

const router = express.Router();

router.get("/:documentId", getOnlineUsers);

export default router;