import mongoose from "mongoose";
import User from "../Models/User.js";
import LoginActivity from "../Models/LoginActivity.js";
import FailedLogin from "../Models/FailedLogin.js";
import UserSession from "../Models/UserSession.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.init();
    await LoginActivity.init();
    await FailedLogin.init();
    await UserSession.init();

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
export default connectDB;
