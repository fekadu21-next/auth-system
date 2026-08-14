import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../Models/User.js";

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL ? process.env.GOOGLE_CALLBACK_URL.trim() : "http://localhost:5000/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            console.error("Google Auth Error: No email provided in profile");
            return done(null, false, { message: "No email provided from Google" });
          }

          const googleId = profile.id;
          const email = profile.emails[0].value.toLowerCase();
          const name = profile.displayName || email.split("@")[0];
          const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

          let user = await User.findOne({ googleId });

          if (!user) {
            // Check if user exists by email but without googleId
            user = await User.findOne({ email });

            if (user) {
              // Link Google account to existing user
              user.googleId = googleId;
              if (avatar && !user.avatar) user.avatar = avatar;
              user.isEmailVerified = true;
              await user.save();
            } else {
              // Create completely new user
              user = await User.create({
                name,
                email,
                googleId,
                avatar,
                isEmailVerified: true,
              });
            }
          } else if (avatar && user.avatar !== avatar) {
            user.avatar = avatar;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          console.error("🚨 Google Strategy Error:", error);
          return done(null, false, { message: "Internal authentication error" });
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth credentials missing. Google login will not work.");
}

export default passport;
