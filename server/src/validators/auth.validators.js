import { body, param } from "express-validator";

const rejectHtml = (value) => {
  if (/[<>]/.test(value)) {
    throw new Error("HTML tags are not allowed");
  }
  return true;
};
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .custom(rejectHtml)
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email")
    .bail()
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .bail()
    .isIn(["client", "freelancer"])
    .withMessage("Role must be either client or freelancer"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email")
    .bail()
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email")
    .bail()
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

const verify2FAValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("2FA code is required")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("2FA code must be 6 digits")
    .bail()
    .isNumeric()
    .withMessage("2FA code must contain only numbers"),
];

const verify2FALoginValidation = [
  body("twoFactorToken").trim().notEmpty().withMessage("2FA token is required"),
  ...verify2FAValidation,
];

const verifyEmailTokenValidation = [
  param("token").trim().notEmpty().withMessage("Token is required"),
];

const resetPasswordTokenValidation = [
  param("token").trim().notEmpty().withMessage("Token is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .custom(rejectHtml)
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),

  body("location")
    .optional()
    .trim()
    .custom(rejectHtml)
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  body("bio")
    .optional()
    .trim()
    .custom(rejectHtml)
    .bail()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("avatar")
    .optional()
    .trim()
    .isURL({ require_protocol: true, protocols: ["https"] })
    .withMessage("Avatar must be a valid HTTPS URL"),
];

export {
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
};
