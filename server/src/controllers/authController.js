import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import passport from "passport";
import { asyncHandler } from "../utils/async-handler.js";
import {
	ApiError,
	BadRequestError,
	ForbiddenError,
	UnauthorizedError,
} from "../utils/api-error.js";
import { createdResponse, successResponse } from "../utils/api-response.js";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/generateTokens.js";
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
	sendWelcomeEmail,
} from "../services/emailService.js";
import {
	findUserByEmail,
	createUser,
	generateEmailVerificationToken,
	getUserByEmailVerificationToken,
	generatePasswordResetToken,
	getUserByPasswordResetToken,
	saveRefreshToken,
	isRefreshTokenValid,
	clearRefreshToken,
	changeUserPassword,
	resetUserPassword,
	updateUserProfile,
	getUserById,
} from "../services/authService.js";

const parseDurationMs = (value, fallback) => {
	if (!value) {
		return fallback;
	}

	if (/^\d+$/.test(value)) {
		return Number(value);
	}

	const match = value.match(/^(\d+)([smhd])$/i);
	if (!match) {
		return fallback;
	}

	const amount = Number(match[1]);
	const unit = match[2].toLowerCase();

	if (unit === "s") return amount * 1000;
	if (unit === "m") return amount * 60 * 1000;
	if (unit === "h") return amount * 60 * 60 * 1000;
	if (unit === "d") return amount * 24 * 60 * 60 * 1000;

	return fallback;
};

const getCookieOptions = (maxAge) => ({
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	maxAge,
});

const setAuthCookies = (res, accessToken, refreshToken) => {
	const accessMaxAge = parseDurationMs(
		process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
		15 * 60 * 1000,
	);
	const refreshMaxAge = parseDurationMs(
		process.env.REFRESH_TOKEN_COOKIE_EXPIRES,
		30 * 24 * 60 * 60 * 1000,
	);

	res.cookie("accessToken", accessToken, getCookieOptions(accessMaxAge));
	res.cookie("refreshToken", refreshToken, getCookieOptions(refreshMaxAge));
};

const clearAuthCookies = (res) => {
	res.clearCookie("accessToken", getCookieOptions(0));
	res.clearCookie("refreshToken", getCookieOptions(0));
};

const sanitizeUser = (user) => {
	const data = user?.toObject ? user.toObject() : { ...user };
	delete data.password;
	delete data.refreshToken;
	delete data.passwordResetToken;
	delete data.passwordResetExpire;
	delete data.emailVerificationToken;
	delete data.emailVerificationExpire;
	delete data.twoFactorSecret;
	return data;
};

const resolveTwoFactorSecret = () =>
	process.env.TWO_FACTOR_TOKEN_SECRET ||
	process.env.ACCESS_TOKEN_SECRET ||
	process.env.JWT_SECRET;

/**
 * Register a new user and send verification email.
 */
const register = asyncHandler(async (req, res) => {
	const { name, email, password, role, phone } = req.body;

	const user = await createUser({ name, email, password, role, phone });
	const token = await generateEmailVerificationToken(user);

	await sendVerificationEmail(user, token);

	return createdResponse(res, "Registration successful. Verify your email.", {
		user: sanitizeUser(user),
	});
});

/**
 * Login user and issue tokens or require 2FA.
 */
const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await findUserByEmail(email, { includePassword: true });
	if (!user) {
		throw new UnauthorizedError("Invalid email or password");
	}

	const isMatch = await user.comparePassword(password);
	if (!isMatch) {
		throw new UnauthorizedError("Invalid email or password");
	}

	if (!user.isEmailVerified) {
		throw new ForbiddenError("Please verify your email before logging in");
	}

	if (!user.isActive) {
		throw new ForbiddenError(
			"Your account has been deactivated. Please contact support.",
		);
	}

	if (user.isSuspended) {
		throw new ForbiddenError(
			`Your account has been suspended: ${user.suspensionReason || "Contact support."}`,
		);
	}

	if (user.isTwoFactorEnabled) {
		const secret = resolveTwoFactorSecret();
		if (!secret) {
			throw new ApiError(500, "2FA token secret is not configured");
		}

		const twoFactorToken = jwt.sign(
			{ id: user._id.toString(), type: "2fa" },
			secret,
			{ expiresIn: "10m" },
		);

		return successResponse(res, "2FA required", {
			requires2FA: true,
			twoFactorToken,
		});
	}

	const accessToken = generateAccessToken(user);
	const refreshToken = generateRefreshToken(user);

	await saveRefreshToken(user, refreshToken);
	user.lastLogin = new Date();
	await user.save({ validateBeforeSave: false });

	setAuthCookies(res, accessToken, refreshToken);

	return successResponse(res, "Login successful", {
		user: sanitizeUser(user),
		accessToken,
	});
});

/**
 * Verify email address using token.
 */
const verifyEmail = asyncHandler(async (req, res) => {
	const { token } = req.params;
	if (!token) {
		throw new BadRequestError("Verification token is required");
	}

	const user = await getUserByEmailVerificationToken(token);
	user.isEmailVerified = true;
	user.emailVerificationToken = undefined;
	user.emailVerificationExpire = undefined;
	await user.save({ validateBeforeSave: false });

	await sendWelcomeEmail(user);

	return successResponse(res, "Email verified successfully", {
		user: sanitizeUser(user),
	});
});

/**
 * Resend email verification.
 */
const resendVerification = asyncHandler(async (req, res) => {
	const user = await getUserById(req.user.id || req.user._id);

	if (user.isEmailVerified) {
		return successResponse(res, "Email is already verified", {
			user: sanitizeUser(user),
		});
	}

	const token = await generateEmailVerificationToken(user);
	await sendVerificationEmail(user, token);

	return successResponse(res, "Verification email sent", {
		user: sanitizeUser(user),
	});
});

/**
 * Request a password reset email.
 */
const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await findUserByEmail(email);

	if (user) {
		const token = await generatePasswordResetToken(user);
		await sendPasswordResetEmail(user, token);
	}

	return successResponse(
		res,
		"If the email exists, a reset link has been sent",
	);
});

/**
 * Reset password using reset token.
 */
const resetPassword = asyncHandler(async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	const user = await getUserByPasswordResetToken(token);
	await resetUserPassword(user, password);

	await clearRefreshToken(user._id);
	clearAuthCookies(res);

	return successResponse(res, "Password reset successful");
});

/**
 * Change password for authenticated user.
 */
const changePassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	const user = await getUserById(req.user.id || req.user._id, {
		includePassword: true,
	});

	await changeUserPassword(user, currentPassword, newPassword);
	await clearRefreshToken(user._id);
	clearAuthCookies(res);

	return successResponse(res, "Password updated successfully");
});

/**
 * Refresh tokens using a valid refresh token.
 */
const refreshToken = asyncHandler(async (req, res) => {
	const token = req.cookies?.refreshToken || req.body?.refreshToken;
	if (!token) {
		throw new UnauthorizedError("Refresh token is required");
	}

	const payload = verifyRefreshToken(token);
	const user = await getUserById(payload.id);

	if (!isRefreshTokenValid(user, token)) {
		throw new UnauthorizedError("Invalid refresh token");
	}

	const newAccessToken = generateAccessToken(user);
	const newRefreshToken = generateRefreshToken(user);

	await saveRefreshToken(user, newRefreshToken);
	setAuthCookies(res, newAccessToken, newRefreshToken);

	return successResponse(res, "Token refreshed", {
		user: sanitizeUser(user),
		accessToken: newAccessToken,
	});
});

/**
 * Logout user by clearing refresh token and cookies.
 */
const logout = asyncHandler(async (req, res) => {
	if (req.user?.id || req.user?._id) {
		await clearRefreshToken(req.user.id || req.user._id);
	}

	clearAuthCookies(res);
	return successResponse(res, "Logged out successfully");
});

/**
 * Get current authenticated user.
 */
const getMe = asyncHandler(async (req, res) => {
	const user = await getUserById(req.user.id || req.user._id);
	return successResponse(res, "User profile retrieved", {
		user: sanitizeUser(user),
	});
});

/**
 * Update user profile fields.
 */
const updateProfile = asyncHandler(async (req, res) => {
	const allowedFields = ["name", "phone", "location", "bio", "avatar"];
	const updates = {};

	allowedFields.forEach((field) => {
		if (req.body[field] !== undefined) {
			updates[field] = req.body[field];
		}
	});

	if (Object.keys(updates).length === 0) {
		throw new BadRequestError("No valid fields provided for update");
	}

	const user = await updateUserProfile(req.user.id || req.user._id, updates);

	return successResponse(res, "Profile updated successfully", {
		user: sanitizeUser(user),
	});
});

/**
 * Generate and store 2FA secret with QR code.
 */
const setup2FA = asyncHandler(async (req, res) => {
	const user = await getUserById(req.user.id || req.user._id);

	if (user.isTwoFactorEnabled) {
		throw new BadRequestError("2FA is already enabled");
	}

	const secret = speakeasy.generateSecret({
		name: `Freelancer Marketplace (${user.email})`,
	});

	user.twoFactorSecret = secret.base32;
	user.isTwoFactorEnabled = false;
	await user.save({ validateBeforeSave: false });

	const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

	return successResponse(res, "2FA setup initiated", {
		qrCodeDataUrl,
		secret: secret.base32,
		otpauthUrl: secret.otpauth_url,
	});
});

/**
 * Verify and enable 2FA for a user.
 */
const verify2FASetup = asyncHandler(async (req, res) => {
	const { code } = req.body;
	const user = await getUserById(req.user.id || req.user._id);

	if (!user.twoFactorSecret) {
		throw new BadRequestError("2FA secret not found. Setup 2FA first.");
	}

	const isValid = speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: "base32",
		token: code,
		window: 1,
	});

	if (!isValid) {
		throw new UnauthorizedError("Invalid 2FA code");
	}

	user.isTwoFactorEnabled = true;
	await user.save({ validateBeforeSave: false });

	return successResponse(res, "2FA enabled successfully", {
		user: sanitizeUser(user),
	});
});

/**
 * Verify 2FA during login and issue tokens.
 */
const verify2FA = asyncHandler(async (req, res) => {
	const { code, twoFactorToken } = req.body;
	if (!twoFactorToken) {
		throw new UnauthorizedError("2FA token is required");
	}

	const secret = resolveTwoFactorSecret();
	if (!secret) {
		throw new ApiError(500, "2FA token secret is not configured");
	}

	let payload;
	try {
		payload = jwt.verify(twoFactorToken, secret);
	} catch (error) {
		throw new UnauthorizedError("Invalid or expired 2FA token");
	}

	if (payload.type !== "2fa") {
		throw new UnauthorizedError("Invalid 2FA token");
	}

	const user = await getUserById(payload.id);
	if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
		throw new BadRequestError("2FA is not enabled for this account");
	}

	const isValid = speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: "base32",
		token: code,
		window: 1,
	});

	if (!isValid) {
		throw new UnauthorizedError("Invalid 2FA code");
	}

	const accessToken = generateAccessToken(user);
	const refreshTokenValue = generateRefreshToken(user);

	await saveRefreshToken(user, refreshTokenValue);
	user.lastLogin = new Date();
	await user.save({ validateBeforeSave: false });

	setAuthCookies(res, accessToken, refreshTokenValue);

	return successResponse(res, "2FA verified", {
		user: sanitizeUser(user),
		accessToken,
	});
});

/**
 * Disable 2FA for a user.
 */
const disable2FA = asyncHandler(async (req, res) => {
	const { code } = req.body;
	const user = await getUserById(req.user.id || req.user._id);

	if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
		throw new BadRequestError("2FA is not enabled");
	}

	const isValid = speakeasy.totp.verify({
		secret: user.twoFactorSecret,
		encoding: "base32",
		token: code,
		window: 1,
	});

	if (!isValid) {
		throw new UnauthorizedError("Invalid 2FA code");
	}

	user.isTwoFactorEnabled = false;
	user.twoFactorSecret = undefined;
	await user.save({ validateBeforeSave: false });

	return successResponse(res, "2FA disabled successfully", {
		user: sanitizeUser(user),
	});
});

/**
 * Initiate Google OAuth flow.
 */
const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
	session: false,
});

/**
 * Handle Google OAuth callback and issue tokens.
 */
// const googleAuthCallback = (req, res, next) => {
// 	passport.authenticate(
// 		"google",
// 		{ session: false, failureRedirect: "/login" },
// 		async (err, user) => {
// 			try {
// 				if (err || !user) {
// 					return next(new UnauthorizedError("Google authentication failed"));
// 				}

// 				const accessToken = generateAccessToken(user);
// 				const refreshTokenValue = generateRefreshToken(user);

// 				await saveRefreshToken(user, refreshTokenValue);
// 				user.lastLogin = new Date();
// 				await user.save({ validateBeforeSave: false });

// 				setAuthCookies(res, accessToken, refreshTokenValue);

// 				return successResponse(res, "Google login successful", {
// 					user: sanitizeUser(user),
// 					accessToken,
// 				});
// 			} catch (error) {
// 				return next(error);
// 			}
// 		},
// 	)(req, res, next);
// };

/**
 * Handle Google OAuth callback and issue tokens.
 *
 * BEFORE: returned res.json() → browser showed raw JSON
 * AFTER:  res.redirect() to frontend → frontend handler hydrates store
 *
 * Two redirect branches:
 *   A) User has 2FA enabled  → redirect with twoFactorToken (same JWT the
 *      normal login flow uses — frontend /2fa page handles it identically)
 *   B) Normal Google login   → redirect with accessToken
 *
 * The HttpOnly refreshToken cookie is set in BOTH cases before redirecting,
 * so the browser carries it automatically on all future requests.
 */
const googleAuthCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` },
    async (err, user) => {
      try {
        if (err || !user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=google_failed`
          );
        }

        const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

        // ── Branch A: 2FA enabled ───────────────────────────────────────────
        // Mirror exactly what the normal login controller does:
        // generate a short-lived 2fa JWT, send it to the frontend 2FA page.
        // The frontend /2fa page POSTs { twoFactorToken, code } to /2fa/verify
        // which is already implemented and works identically for both flows.
        if (user.isTwoFactorEnabled) {
          const twoFactorSecret = resolveTwoFactorSecret();
          if (!twoFactorSecret) {
            return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
          }

          const twoFactorToken = jwt.sign(
            { id: user._id.toString(), type: "2fa" },
            twoFactorSecret,
            { expiresIn: "10m" }
          );

          // Do NOT set full auth cookies yet — user hasn't passed 2FA
          // The /2fa/verify endpoint will set them after code is confirmed
          return res.redirect(
            `${FRONTEND_URL}/auth/google/callback?requires2FA=true&twoFactorToken=${twoFactorToken}`
          );
        }

        // ── Branch B: Normal Google login ───────────────────────────────────
        const accessToken = generateAccessToken(user);
        const refreshTokenValue = generateRefreshToken(user);

        await saveRefreshToken(user, refreshTokenValue);
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Set HttpOnly cookies — browser carries refreshToken automatically
        setAuthCookies(res, accessToken, refreshTokenValue);

        // Pass accessToken in query param — frontend reads it once, then
        // navigates away so it never sits in the URL bar for long
        return res.redirect(
          `${FRONTEND_URL}/auth/google/callback?accessToken=${accessToken}`
        );
      } catch (error) {
        return next(error);
      }
    }
  )(req, res, next);
};
export {
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
};
