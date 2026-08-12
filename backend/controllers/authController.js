import {
  createUser,
  findUserByEmail,
  findUserForLogin,
  updateLastLogin,
  logLoginActivity,
  logFailedLogin,
  getRecentFailedAttempts,
  isNewDevice,
  getUserSessions,
  deleteSession,
  searchUsersByQuery,
} from "../services/authService.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { isStrongPassword } from "../utils/validatePassword.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const displayName = name?.trim() || email.split("@")[0];

    if (displayName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars, include uppercase, number, special char",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await hashPassword(password);
    const user = await createUser(displayName, email, hashed);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const attempts = await getRecentFailedAttempts(email, ip);
    if (attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Try again in 10 minutes",
      });
    }

    const user = await findUserForLogin(email);

    if (!user || !user.password || !(await comparePassword(password, user.password))) {
      await logFailedLogin(email, ip);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const newDevice = await isNewDevice(user.id, ip, userAgent);

    if (newDevice) {
      console.log("⚠️ Suspicious login detected!");
    }

    await logLoginActivity(user.id, ip, userAgent);
    await updateLastLogin(user.id);

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      ip,
      userAgent,
      suspicious: newDevice,
    };

    res.json({
      message: "Login successful",
      suspicious: newDevice,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

export const profile = (req, res) => {
  res.json(req.session.user);
};

export const sessions = async (req, res) => {
  try {
    const userSessions = await getUserSessions(req.session.user.id, req.sessionID);
    res.json({ success: true, data: userSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeSession = async (req, res) => {
  const { sid } = req.params;

  if (String(sid) === String(req.sessionID)) {
    return res.status(400).json({ message: "Cannot sign out the current session" });
  }

  const result = await deleteSession(sid, req.session.user.id);
  if (!result.deleted) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.json({ message: "Session removed" });
};

export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });
    
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ data: { _id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchUsersSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ data: [] });

    const users = await searchUsersByQuery(q.trim());
    res.json({
      data: users.map((u) => ({ _id: u._id, email: u.email, name: u.name, avatar: u.avatar })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refreshSession = (req, res) => {
  // `rolling: true` in session config automatically resets the cookie maxAge
  // Just returning 200 OK is enough to trigger the session touch and extend it
  res.json({ success: true, message: "Session refreshed" });
};
