import dotenv from "dotenv";
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
export const validateEnv = () => {
  const required = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "JWT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
  ];

  const hasFrontendUrl =
    Boolean(process.env.FRONTEND_URL) || Boolean(process.env.CLIENT_URL);

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  if (!hasFrontendUrl) {
    throw new Error("Missing FRONTEND_URL or CLIENT_URL for email links");
  }

  if (process.env.NODE_ENV === "production") {
    const prodEmailRequired = [
      "RESEND_SMTP_HOST",
      "RESEND_SMTP_PORT",
      "RESEND_SMTP_USER",
      "RESEND_SMTP_PASS",
      "EMAIL_FROM",
    ];
    const prodMissing = prodEmailRequired.filter(
      (key) => !process.env[key],
    );
    if (prodMissing.length > 0) {
      throw new Error(
        `Missing production email variables: ${prodMissing.join(", ")}`,
      );
    }
  } else {
    const devEmailRequired = [
      "MAILTRAP_SMTP_HOST",
      "MAILTRAP_SMTP_PORT",
      "MAILTRAP_SMTP_USER",
      "MAILTRAP_SMTP_PASS",
    ];
    const devMissing = devEmailRequired.filter((key) => !process.env[key]);
    if (devMissing.length > 0) {
      throw new Error(
        `Missing development email variables: ${devMissing.join(", ")}`,
      );
    }
  }

  // Validate token secrets are sufficiently long
  if (!process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET.length < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must be at least 32 characters long");
  }

  if (!process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error("REFRESH_TOKEN_SECRET must be at least 32 characters long");
  }

  console.log("✅ Environment variables validated successfully");
};
