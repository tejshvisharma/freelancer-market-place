import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { availableUserRoles } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: availableUserRoles,
      default: "client",
    },
    avatar: {
      type: String,
      default: "default-avatar.jpg",
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    googleId: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    twoFactorSecret: String,
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE },
  );

  this.refreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  return refreshToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
