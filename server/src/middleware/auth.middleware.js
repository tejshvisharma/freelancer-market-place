import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/api-error.js";

import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import mongoose from "mongoose";
import { availableUserRoles } from "../utils/constants.js";

 const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!accessToken) {
    throw new ApiError(401, "No Token Found, Unauthorized request");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "_id username email role",
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    return next(err);
  }
});

 const requireGlobalRole =
  (roles = []) =>
  (req, _res, next) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Requires one of: ${roles.join(", ")}. You are: ${req.user.role}`,
      );
    }
    next();
  };

// Protect routes - User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Get token from header
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    throw new UnauthorizedError("Not authorized, no token provided");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new UnauthorizedError("User not found with this token");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenError(
        "Your account has been deactivated. Please contact support.",
      );
    }

    // Check if user is suspended
    if (user.isSuspended) {
      throw new ForbiddenError(
        `Your account has been suspended: ${user.suspensionReason || "Please contact support."}`,
      );
    }

    // Check if email is verified (optional, can be enforced)
    if (req.requireVerifiedEmail && !user.isEmailVerified) {
      throw new ForbiddenError("Please verify your email address first");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired, please login again");
    }
    throw error;
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError("Not authorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Role '${req.user.role}' is not authorized to access this route`,
      );
    }

    next();
  };
};

// Optional auth - Attach user if token exists, but don't require it
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Don't throw error, just don't attach user
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});

// Rate limiters for auth routes
const authRateLimiter = {
  loginLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per windowMs
    message: {
      success: false,
      message: "Too many login attempts, please try again after 15 minutes",
    },
  },
  registerLimiter: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour from same IP
    message: {
      success: false,
      message:
        "Too many accounts created from this IP, please try again after an hour",
    },
  },
  emailLimiter: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 email sends per hour
    message: {
      success: false,
      message: "Too many email requests, please try again later",
    },
  },
};

export {
  protect,
  authorize,
  optionalAuth,
  authRateLimiter,
  isLoggedIn,
  requireGlobalRole,
};
