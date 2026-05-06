import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.ACCESS_TOKEN_SECRET = "test_access_secret_32_chars_long_value";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_32_chars_long_value";
process.env.JWT_SECRET = "test_jwt_secret_32_chars_long_value";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.MAILTRAP_SMTP_HOST = "smtp.mailtrap.io";
process.env.MAILTRAP_SMTP_PORT = "2525";
process.env.MAILTRAP_SMTP_USER = "test";
process.env.MAILTRAP_SMTP_PASS = "test";
process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.GOOGLE_CALLBACK_URL =
  "http://localhost:8000/api/auth/oauth/google/callback";

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  send2FACodeEmail: jest.fn(),
}));

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");
const request = (await import("supertest")).default;
const speakeasy = (await import("speakeasy")).default;

let mongoServer;

const createUser = async (overrides = {}) => {
  const user = await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "Password@123",
    role: "client",
    ...overrides,
  });

  return user;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  it("registers a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password@123",
      role: "client",
      phone: "+1234567890",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("jane@example.com");

    const user = await User.findOne({ email: "jane@example.com" });
    expect(user).toBeTruthy();
    expect(user.isEmailVerified).toBe(false);
  });

  it("logs in a verified user", async () => {
    const user = await createUser({
      email: "login@example.com",
      isEmailVerified: true,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "Password@123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("resets password with a valid token", async () => {
    const user = await createUser({
      email: "reset@example.com",
      isEmailVerified: true,
    });

    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const response = await request(app)
      .put(`/api/auth/reset-password/${token}`)
      .send({
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });

    expect(response.status).toBe(200);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "reset@example.com",
      password: "NewPass@123",
    });

    expect(loginResponse.status).toBe(200);
  });

  it("completes 2FA login flow", async () => {
    const secret = speakeasy.generateSecret({ name: "Test" });
    await createUser({
      email: "2fa@example.com",
      isEmailVerified: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: secret.base32,
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "2fa@example.com",
      password: "Password@123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.requires2FA).toBe(true);

    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    const verifyResponse = await request(app)
      .post("/api/auth/2fa/verify")
      .send({
        code,
        twoFactorToken: loginResponse.body.data.twoFactorToken,
      });

    expect(verifyResponse.status).toBe(200);
  });

  it("returns errors for invalid login and reset token", async () => {
    await createUser({ email: "fail@example.com", isEmailVerified: true });

    const badLogin = await request(app).post("/api/auth/login").send({
      email: "fail@example.com",
      password: "WrongPassword@123",
    });

    expect(badLogin.status).toBe(401);

    const badReset = await request(app)
      .put("/api/auth/reset-password/invalidtoken")
      .send({
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });

    expect(badReset.status).toBe(400);
  });
});
