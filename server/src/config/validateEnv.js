import dotenv from "dotenv";
dotenv.config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
export const validateEnv = () => {
  const required = [
    
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // Validate token secrets are sufficiently long
  if (process.env.ACCESS_TOKEN_SECRET.length < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must be at least 32 characters long");
  }

  if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error("REFRESH_TOKEN_SECRET must be at least 32 characters long");
  }

  console.log("✅ Environment variables validated successfully");
};
