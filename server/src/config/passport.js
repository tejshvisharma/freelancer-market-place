import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import User from "../models/User.js";

/**
 * Configure Passport strategies and session serialization.
 * @returns {void}
 */
const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google account email not available"));
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              password: randomPassword,
              googleId: profile.id,
              isEmailVerified: true,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
};

export default configurePassport;
