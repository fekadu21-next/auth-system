import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import passport from "./config/passport.js";
import authRoutes from "./Routes/authRoutes.js";
import documentRoutes from "./Routes/document.routes.js";
import documentShareRoutes from "./Routes/documentShare.route.js";
import versionRoutes from "./Routes/version.routes.js";
import commentRoutes from "./Routes/comment.routes.js";
import presenceRoutes from "./Routes/presence.routes.js";
import notificationRoutes from "./Routes/notification.routes.js";
import uploadRoutes from "./Routes/upload.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy for secure cookies behind load balancers (like Render)
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://livedocs-brown.vercel.app"
      ];
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
      }

      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(null, false); // Don't throw error, just reject CORS gracefully
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "user_sessions",
      touchAfter: 300, // Optimize: only update session in DB once every 5 minutes (unless modified)
      // Store sessions as nested objects (not JSON strings) so they can be
      // queried by fields like "session.user.id".
      stringify: false,
      // Tolerate legacy string sessions that were saved with stringify:true.
      unserialize: (raw) => {
        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
        return raw;
      },
    }),
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 30,
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
    rolling: true,
  })
);

app.use(passport.initialize());

// Static uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes); // fallback for some frontend calls
app.use("/api/documents", documentRoutes);
app.use("/api/shares", documentShareRoutes);
app.use("/api/versions", versionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/presence", presenceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);

// Global Error Handler to prevent 500 crashes and redirect gracefully
app.use((err, req, res, next) => {
  console.error("🚨 Global Express Error:", err);
  if (req.path.startsWith('/api/auth/google/callback') || req.path.startsWith('/auth/google/callback')) {
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?error=server_error&message=${encodeURIComponent(err.message || 'Unknown')}`);
  }
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

export default app;
