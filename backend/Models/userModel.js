import pool from "../db.js";

export const createUser = async (email, password) => {
  const result = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, password]
  );
  return result.rows[0];
};

// Find user by email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return result.rows[0];
};

// Save login activity
export const logLoginActivity = async (user_id, ip, user_agent) => {
  await pool.query(
    "INSERT INTO login_activities (user_id, ip, user_agent) VALUES ($1, $2, $3)",
    [user_id, ip, user_agent]
  );
};

// Save failed login
export const logFailedLogin = async (email, ip) => {
  await pool.query(
    "INSERT INTO failed_logins (email, ip) VALUES ($1, $2)",
    [email, ip]
  );
};

// 🔐 Count failed attempts in last 10 minutes
export const getRecentFailedAttempts = async (email, ip) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM failed_logins
     WHERE (email=$1 OR ip=$2)
     AND attempt_time > NOW() - INTERVAL '10 minutes'`,
    [email, ip]
  );
  return parseInt(result.rows[0].count);
};

// 🚨 Check if device is new (only suspicious if they have logged in before)
export const isNewDevice = async (user_id, ip, user_agent) => {
  // Check if user has ANY previous login history
  const history = await pool.query(
    "SELECT 1 FROM login_activities WHERE user_id=$1 LIMIT 1",
    [user_id]
  );
  
  if (history.rows.length === 0) {
    return false; // First time logging in ever, so it's not a new/suspicious device change
  }

  // Check if this specific device and IP combination is known
  const result = await pool.query(
    `SELECT 1 FROM login_activities
     WHERE user_id=$1 AND ip=$2 AND user_agent=$3 LIMIT 1`,
    [user_id, ip, user_agent]
  );
  return result.rows.length === 0;
};

// 📱 Get active sessions
export const getUserSessions = async (userId) => {
  const result = await pool.query(
    `SELECT sid, sess, expire FROM user_sessions
     WHERE sess->'user'->>'id' = $1`,
    [userId.toString()]
  );
  return result.rows;
};

// ❌ Delete session
export const deleteSession = async (sid) => {
  await pool.query(
    "DELETE FROM user_sessions WHERE sid=$1",
    [sid]
  );
};