import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  profile,
  sessions,
  removeSession,
  searchUsers,
  searchUsersSuggestions,
  refreshSession,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { updateLastLogin } from "../services/authService.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, profile);
router.post("/refresh-session", isAuthenticated, refreshSession);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed` }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error("Authentication failed: User object is missing");
      }

      await updateLastLogin(req.user.id);

      req.session.user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };
      
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      let redirectUrl = `${frontendUrl}/dashboard`;
      if (req.cookies && req.cookies.post_login_redirect) {
        redirectUrl = `${frontendUrl}${req.cookies.post_login_redirect}`;
        res.clearCookie("post_login_redirect");
      }
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("🚨 Google Callback Error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }
);

router.get("/sessions", isAuthenticated, sessions);
router.delete("/sessions/:sid", isAuthenticated, removeSession);
router.get("/users", isAuthenticated, searchUsers);
router.get("/users/search", isAuthenticated, searchUsersSuggestions);

export default router;
