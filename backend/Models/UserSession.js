import mongoose from "mongoose";

// This maps to the collection used by connect-mongo in app.js
const userSessionSchema = new mongoose.Schema({
  _id: String,
  expires: Date,
  session: Object
}, { collection: "user_sessions" });

export default mongoose.models.UserSession || mongoose.model("UserSession", userSessionSchema);
