import express from "express";
import rateLimit from "express-rate-limit";
import { protect, authRateLimiter } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  resetPasswordTokenValidation,
  changePasswordValidation,
  verify2FAValidation,
  verify2FALoginValidation,
  verifyEmailTokenValidation,
  updateProfileValidation,
} from "../validators/auth.validators.js";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  setup2FA,
  verify2FASetup,
  verify2FA,
  disable2FA,
  googleAuth,
  googleAuthCallback,
} from "../controllers/authController.js";

const router = express.Router();

const isTestEnv = process.env.NODE_ENV === "test";
const noopLimiter = (req, res, next) => next();

// Rate limiters
const loginLimiter = isTestEnv
  ? noopLimiter
  : rateLimit(authRateLimiter.loginLimiter);
const registerLimiter = isTestEnv
  ? noopLimiter
  : rateLimit(authRateLimiter.registerLimiter);
const emailLimiter = isTestEnv
  ? noopLimiter
  : rateLimit(authRateLimiter.emailLimiter);

// Public routes
router.post(
  "/register",
  registerLimiter,
  validate(registerValidation),
  register,
);
router.post("/login", loginLimiter, validate(loginValidation), login);
router.get(
  "/verify-email/:token",
  validate(verifyEmailTokenValidation),
  verifyEmail,
);
router.post(
  "/forgot-password",
  emailLimiter,
  validate(forgotPasswordValidation),
  forgotPassword,
);
router.put(
  "/reset-password/:token",
  validate(resetPasswordTokenValidation),
  validate(resetPasswordValidation),
  resetPassword,
);
router.post("/refresh-token", refreshToken);
router.post("/2fa/verify", validate(verify2FALoginValidation), verify2FA);
router.get("/oauth/google", googleAuth);
router.get("/oauth/google/callback", googleAuthCallback);

// Protected routes (require authentication)
router.use(protect); // All routes below this will require authentication

router.get("/me", getMe);
router.put("/update-profile", validate(updateProfileValidation), updateProfile);
router.put(
  "/change-password",
  validate(changePasswordValidation),
  changePassword,
);
router.post("/resend-verification", emailLimiter, resendVerification);
router.post("/logout", logout);

// 2FA routes
router.post("/2fa/setup", setup2FA);
router.post("/2fa/verify-setup", validate(verify2FAValidation), verify2FASetup);
router.post("/2fa/disable", validate(verify2FAValidation), disable2FA);

export default router;
