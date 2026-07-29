import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  profile,
  sessions,
  removeSession
} from "../Controlllers/authController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, profile);

// Google login
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/" }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      email: req.user.email
    };
    res.redirect("http://localhost:5173/dashboard");
  }
);

// sessions
router.get("/sessions", isAuthenticated, sessions);
router.delete("/sessions/:sid", isAuthenticated, removeSession);

export default router;