import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../Models/User.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value.toLowerCase();
        const name = profile.displayName || email.split("@")[0];
        const avatar = profile.photos?.[0]?.value || "";

        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.create({
            name,
            email,
            googleId,
            avatar,
            isEmailVerified: true,
          });
        } else if (avatar && user.avatar !== avatar) {
          user.avatar = avatar;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
