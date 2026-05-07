import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./api-error.js";

const resolveSecret = (primaryKey, fallbackKey) => {
  const secret = process.env[primaryKey] || process.env[fallbackKey];

  if (!secret) {
    throw new UnauthorizedError(
      "Token secret is not configured. Please set environment variables.",
    );
  }

  return secret;
};

const resolveExpiry = (primaryKey, fallbackKey, defaultValue) => {
  return process.env[primaryKey] || process.env[fallbackKey] || defaultValue;
};

/**
 * Generate a short-lived access token for a user.
 * @param {Object} user - Mongoose user document.
 * @returns {string} Signed JWT access token.
 */
const generateAccessToken = (user) => {
  const secret = resolveSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET");
  const expiresIn = resolveExpiry("ACCESS_TOKEN_EXPIRES_IN", "JWT_EXPIRE", "15m");

  return jwt.sign(
    { id: user._id.toString(), role: user.role, type: "access" },
    secret,
    { expiresIn },
  );
};

/**
 * Generate a long-lived refresh token for a user.
 * @param {Object} user - Mongoose user document.
 * @returns {string} Signed JWT refresh token.
 */
const generateRefreshToken = (user) => {
  const secret = resolveSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET");
  const expiresIn = resolveExpiry(
    "REFRESH_TOKEN_EXPIRES_IN",
    "JWT_REFRESH_EXPIRE",
    "30d",
  );

  return jwt.sign(
    {
      id: user._id.toString(),
      type: "refresh",
      tokenId: crypto.randomUUID(),
    },
    secret,
    { expiresIn },
  );
};

/**
 * Verify and decode an access token.
 * @param {string} token - JWT access token.
 * @returns {Object} Decoded payload.
 */
const verifyAccessToken = (token) => {
  try {
    const secret = resolveSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET");
    return jwt.verify(token, secret);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

/**
 * Verify and decode a refresh token.
 * @param {string} token - JWT refresh token.
 * @returns {Object} Decoded payload.
 */
const verifyRefreshToken = (token) => {
  try {
    const secret = resolveSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET");
    return jwt.verify(token, secret);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
