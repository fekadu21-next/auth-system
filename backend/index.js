import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./Routes/authRoutes.js";
import "./config/passport.js";

dotenv.config();

const app = express();
const PgSession = pgSession(session);

app.use(express.json());
app.use(helmet());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions"
  }),
  secret: process.env.SESSION_SECRET || "fallback_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 30
  },
  rolling: true
}));

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);