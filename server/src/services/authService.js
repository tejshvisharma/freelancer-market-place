import crypto from "crypto";
import User from "../models/User.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/api-error.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Find a user by email.
 * @param {string} email - User email.
 * @param {Object} options - Options object.
 * @param {boolean} options.includePassword - Whether to include password field.
 * @returns {Promise<Object|null>} User document or null.
 */
const findUserByEmail = async (email, { includePassword = false } = {}) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) {
    query.select("+password");
  }

  return query;
};

/**
 * Create a new user with unique email validation.
 * @param {Object} payload - User data.
 * @returns {Promise<Object>} Created user document.
 */
const createUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  return User.create(payload);
};

/**
 * Generate and persist an email verification token.
 * @param {Object} user - User document.
 * @returns {Promise<string>} Raw email verification token.
 */
const generateEmailVerificationToken = async (user) => {
  const token = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  return token;
};

/**
 * Verify an email token and return the matching user.
 * @param {string} token - Raw email verification token.
 * @returns {Promise<Object>} User document.
 */
const getUserByEmailVerificationToken = async (token) => {
  const hashed = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired email verification token");
  }

  return user;
};

/**
 * Generate and persist a password reset token.
 * @param {Object} user - User document.
 * @returns {Promise<string>} Raw password reset token.
 */
const generatePasswordResetToken = async (user) => {
  const token = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return token;
};

/**
 * Find a user by password reset token.
 * @param {string} token - Raw password reset token.
 * @returns {Promise<Object>} User document.
 */
const getUserByPasswordResetToken = async (token) => {
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new BadRequestError("Invalid or expired password reset token");
  }

  return user;
};

/**
 * Save a hashed refresh token for a user.
 * @param {Object} user - User document.
 * @param {string} refreshToken - Raw refresh token.
 * @returns {Promise<void>} Resolves when saved.
 */
const saveRefreshToken = async (user, refreshToken) => {
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
};

/**
 * Validate a refresh token against stored hash.
 * @param {Object} user - User document.
 * @param {string} refreshToken - Raw refresh token.
 * @returns {boolean} Whether refresh token is valid.
 */
const isRefreshTokenValid = (user, refreshToken) => {
  if (!user?.refreshToken) {
    return false;
  }

  return user.refreshToken === hashToken(refreshToken);
};

/**
 * Clear stored refresh token.
 * @param {string} userId - User id.
 * @returns {Promise<void>} Resolves when cleared.
 */
const clearRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

/**
 * Update user password after validating current password.
 * @param {Object} user - User document.
 * @param {string} currentPassword - Current password.
 * @param {string} newPassword - New password.
 * @returns {Promise<void>} Resolves when updated.
 */
const changeUserPassword = async (user, currentPassword, newPassword) => {
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
};

/**
 * Reset password for a user and clear reset fields.
 * @param {Object} user - User document.
 * @param {string} newPassword - New password.
 * @returns {Promise<void>} Resolves when updated.
 */
const resetUserPassword = async (user, newPassword) => {
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
};

/**
 * Update user profile fields.
 * @param {string} userId - User id.
 * @param {Object} updates - Allowed profile fields.
 * @returns {Promise<Object>} Updated user document.
 */
const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

/**
 * Ensure a user exists by id.
 * @param {string} userId - User id.
 * @param {Object} options - Options object.
 * @param {boolean} options.includePassword - Include password field.
 * @returns {Promise<Object>} User document.
 */
const getUserById = async (userId, { includePassword = false } = {}) => {
  const query = User.findById(userId);
  if (includePassword) {
    query.select("+password");
  }

  const user = await query;
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export {
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
};
