import User from "../Models/User.js";
import LoginActivity from "../Models/LoginActivity.js";
import FailedLogin from "../Models/FailedLogin.js";
import UserSession from "../Models/UserSession.js";
import { parseUserAgent, resolveLocation } from "../utils/deviceInfo.js";
export const createUser = async (name, email, password) => {
  return User.create({ name, email, password });
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase().trim() });
};

export const searchUsersByQuery = async (query, limit = 6) => {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return User.find({
    $or: [{ name: regex }, { email: regex }],
  })
    .select("name email avatar")
    .limit(limit)
    .lean();
};

export const findUserForLogin = async (email) => {
  return User.findOne({ email: email.toLowerCase().trim() }).select("+password");
};

export const updateLastLogin = async (userId) => {
  return User.findByIdAndUpdate(userId, { lastLogin: new Date() });
};

export const logLoginActivity = async (userId, ip, userAgent) => {
  await LoginActivity.create({ userId, ip, userAgent });
};

export const logFailedLogin = async (email, ip) => {
  await FailedLogin.create({ email, ip });
};

export const getRecentFailedAttempts = async (email, ip) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return FailedLogin.countDocuments({
    $or: [{ email }, { ip }],
    createdAt: { $gt: tenMinutesAgo },
  });
};

export const isNewDevice = async (userId, ip, userAgent) => {
  const history = await LoginActivity.findOne({ userId }).select("_id");

  if (!history) {
    return false;
  }

  const known = await LoginActivity.findOne({ userId, ip, userAgent }).select("_id");
  return !known;
};

// Sessions can be stored either as a nested object (stringify:false) or as a
// JSON string (legacy connect-mongo default). Normalize both to an object.
const parseSessionData = (raw) => {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw && typeof raw === "object" ? raw : null;
};

export const getUserSessions = async (userId, currentSessionId = null) => {
  const userIdStr = String(userId);

  const docs = await UserSession.find({ expires: { $gt: new Date() } });
  const sessions = [];

  for (const doc of docs) {
    const sessionData = parseSessionData(doc.session);
    const user = sessionData?.user;
    if (!user || String(user.id) !== userIdStr) continue;

    const userAgent = user.userAgent || "";
    const ip = user.ip || "";
    const info = parseUserAgent(userAgent);
    const location = await resolveLocation(ip);

    sessions.push({
      sid: doc._id,
      ip,
      userAgent,
      device: info.device,
      browser: info.browser,
      os: info.os,
      location,
      isCurrent: currentSessionId && String(doc._id) === String(currentSessionId),
      expiresAt: doc.expires || null,
    });
  }

  return sessions;
};

export const deleteSession = async (sid, userId) => {
  const doc = await UserSession.findById(sid);
  if (!doc) return { deleted: false };

  const sessionData = parseSessionData(doc.session);
  if (String(sessionData?.user?.id) !== String(userId)) {
    return { deleted: false };
  }

  await UserSession.deleteOne({ _id: sid });
  return { deleted: true };
};
