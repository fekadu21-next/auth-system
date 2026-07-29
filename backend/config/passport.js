import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;

        let user = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );

        if (user.rows.length === 0) {
          user = await pool.query(
            `INSERT INTO users (email, google_id)
             VALUES ($1, $2)
             RETURNING *`,
            [email, googleId]
          );
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;