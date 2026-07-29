import {
  createUser,
  findUserByEmail,
  logLoginActivity,
  logFailedLogin,
  getRecentFailedAttempts,
  isNewDevice,
  getUserSessions,
  deleteSession
} from "../Models/userModel.js";

import { hashPassword, comparePassword } from "../utils/hash.js";
import { isStrongPassword } from "../utils/validatePassword.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars, include uppercase, number, special char"
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await hashPassword(password);
    const user = await createUser(email, hashed);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    // 🚫 Check brute-force attempts
    const attempts = await getRecentFailedAttempts(email, ip);
    if (attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Try again in 10 minutes"
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      await logFailedLogin(email, ip);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚨 Detect suspicious login
    const newDevice = await isNewDevice(user.id, ip, userAgent);

    if (newDevice) {
      console.log("⚠️ Suspicious login detected!");
      // You can send email here
    }
    await logLoginActivity(user.id, ip, userAgent);

    // 🔐 Save session
    req.session.user = {
      id: user.id,
      email: user.email,
      ip: ip,
      userAgent: userAgent,
      suspicious: newDevice
    };

    res.json({
      message: "Login successful",
      suspicious: newDevice,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

// PROFILE
export const profile = (req, res) => {
  res.json(req.session.user);
};

// 📱 GET SESSIONS
export const sessions = async (req, res) => {
  const sessions = await getUserSessions(req.session.user.id);
  res.json(sessions);
};

// ❌ DELETE SESSION
export const removeSession = async (req, res) => {
  const { sid } = req.params;
  await deleteSession(sid);
  res.json({ message: "Session removed" });
};