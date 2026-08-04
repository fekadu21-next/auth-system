import express from "express";
import uploadController from "../controllers/upload.controller.js";
import { isAuthenticated as auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/image", auth, uploadController.uploadImage);

export default router;
