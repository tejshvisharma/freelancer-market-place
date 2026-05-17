import { z } from "zod";

// ─── Reusable field rules (match backend exactly) ────────────────────────────

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const passwordField = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

const noHtml = (field: string) =>
  z
    .string()
    .min(1, `${field} is required`)
    .refine((v) => !/<|>/.test(v), `${field} must not contain HTML`);

// ─── Schemas ─────────────────────────────────────────────────────────────────

/** RegisterPage — two-step form, but validated as one schema */
export const registerSchema = z.object({
  name: noHtml("Name").pipe(
    z.string().min(2, "At least 2 characters").max(50, "Max 50 characters"),
  ),
  email: emailField,
  password: passwordField,
  role: z.enum(["client", "freelancer"]),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

/** LoginPage */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

/** ForgotPasswordPage */
export const forgotPasswordSchema = z.object({
  email: emailField,
});

/** ResetPasswordPage */
export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** ProfilePage — change password section */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

/** ProfilePage — update profile section */
export const updateProfileSchema = z.object({
  name: noHtml("Name")
    .pipe(z.string().min(2).max(50))
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  location: noHtml("Location").optional().or(z.literal("")),
  bio: noHtml("Bio").optional().or(z.literal("")),
  avatar: z
    .string()
    .url("Must be a valid URL")
    .startsWith("https://", "Must be an HTTPS URL")
    .optional()
    .or(z.literal("")),
});

/** 2FA verify-login (TwoFactorPage) */
export const twoFAVerifySchema = z.object({
  twoFactorToken: z.string().min(1),
  code: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d+$/, "Digits only"),
});

/** 2FA code-only (setup verify / disable) */
export const twoFACodeSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d+$/, "Digits only"),
});

/** ResendVerificationEmailPage — user enters their email */
export const resendVerificationSchema = z.object({
  email: emailField,
});

// ─── Inferred types (used in hooks + components) ─────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TwoFAVerifyInput = z.infer<typeof twoFAVerifySchema>;
export type TwoFACodeInput = z.infer<typeof twoFACodeSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
