import nodemailer from "nodemailer";
import { ApiError } from "../utils/api-error.js";
import {
  getVerificationEmail,
  getPasswordResetEmail,
  getTwoFactorCodeEmail,
  getWelcomeEmail,
} from "../utils/emailTemplates.js";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Create a Nodemailer transporter for development or production.
 * @returns {import("nodemailer").Transporter} Nodemailer transporter instance.
 */
const createTransporter = () => {
  if (isProduction) {
    return nodemailer.createTransport({
      host: process.env.RESEND_SMTP_HOST,
      port: Number(process.env.RESEND_SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.RESEND_SMTP_USER,
        pass: process.env.RESEND_SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT || 2525),
    secure: false,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });
};

/**
 * Send an email using the configured transporter.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - Email HTML content.
 * @param {string} [options.text] - Email plain-text content.
 * @returns {Promise<void>} Resolves when the email is sent.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || !html) {
    throw new ApiError(400, "Missing required email parameters");
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Freelancer Marketplace" <${process.env.MAILTRAP_SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to send email. Please try again later.");
  }
};

/**
 * Send verification email to a user.
 * @param {Object} user - User document.
 * @param {string} token - Verification token.
 * @returns {Promise<void>} Resolves when email is sent.
 */
const sendVerificationEmail = async (user, token) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  const verificationUrl = `${baseUrl}/verify-email/${token}`;

  const html = getVerificationEmail(user.name, verificationUrl, token);

  await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    html,
  });
};

/**
 * Send password reset email to a user.
 * @param {Object} user - User document.
 * @param {string} token - Reset token.
 * @returns {Promise<void>} Resolves when email is sent.
 */
const sendPasswordResetEmail = async (user, token) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const html = getPasswordResetEmail(user.name, resetUrl);

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html,
  });
};

/**
 * Send welcome email to a new user.
 * @param {Object} user - User document.
 * @returns {Promise<void>} Resolves when email is sent.
 */
const sendWelcomeEmail = async (user) => {
  const html = getWelcomeEmail(user.name, user.role);

  await sendEmail({
    to: user.email,
    subject: "Welcome to Freelancer Marketplace",
    html,
  });
};

/**
 * Send a 2FA code via email.
 * @param {Object} user - User document.
 * @param {string} code - One-time code.
 * @returns {Promise<void>} Resolves when email is sent.
 */
const send2FACodeEmail = async (user, code) => {
  const html = getTwoFactorCodeEmail(user.name, code);

  await sendEmail({
    to: user.email,
    subject: "Your 2FA verification code",
    html,
  });
};

export {
  createTransporter,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  send2FACodeEmail,
};
