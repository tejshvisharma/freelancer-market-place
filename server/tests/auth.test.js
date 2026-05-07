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
  "http://localhost:8000/api/v1/auth/oauth/google/callback";

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

const getCookieValue = (cookies = [], name) => {
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  if (!cookie) {
    return "";
  }

  return cookie.split(";")[0].replace(`${name}=`, "");
};

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
    const response = await request(app).post("/api/v1/auth/register").send({
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

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "login@example.com",
      password: "Password@123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("verifies email and allows login", async () => {
    const user = await createUser({
      email: "verify@example.com",
      isEmailVerified: false,
    });

    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyResponse = await request(app).get(
      `/api/v1/auth/verify-email/${token}`,
    );

    expect(verifyResponse.status).toBe(200);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "verify@example.com",
      password: "Password@123",
    });

    expect(loginResponse.status).toBe(200);
  });

  it("resends verification email for unverified users", async () => {
    await createUser({
      email: "resend@example.com",
      isEmailVerified: false,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "resend@example.com",
      password: "Password@123",
    });

    expect(loginResponse.status).toBe(403);

    const verifiedUser = await User.findOne({ email: "resend@example.com" });
    verifiedUser.isEmailVerified = false;
    await verifiedUser.save({ validateBeforeSave: false });

    const authUser = await createUser({
      email: "authresend@example.com",
      isEmailVerified: true,
    });

    const authLogin = await request(app).post("/api/v1/auth/login").send({
      email: "authresend@example.com",
      password: "Password@123",
    });

    const cookies = authLogin.headers["set-cookie"] || [];

    const response = await request(app)
      .post("/api/v1/auth/resend-verification")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
  });

  it("resets password with a valid token", async () => {
    const user = await createUser({
      email: "reset@example.com",
      isEmailVerified: true,
    });

    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const response = await request(app)
      .put(`/api/v1/auth/reset-password/${token}`)
      .send({
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });

    expect(response.status).toBe(200);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
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

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
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
      .post("/api/v1/auth/2fa/verify")
      .send({
        code,
        twoFactorToken: loginResponse.body.data.twoFactorToken,
      });

    expect(verifyResponse.status).toBe(200);
  });

  it("sets up, verifies, and disables 2FA", async () => {
    await createUser({
      email: "setup2fa@example.com",
      isEmailVerified: true,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "setup2fa@example.com",
      password: "Password@123",
    });

    const cookies = loginResponse.headers["set-cookie"] || [];

    const setupResponse = await request(app)
      .post("/api/v1/auth/2fa/setup")
      .set("Cookie", cookies);

    expect(setupResponse.status).toBe(200);

    const secret = setupResponse.body.data.secret;
    const code = speakeasy.totp({ secret, encoding: "base32" });

    const verifyResponse = await request(app)
      .post("/api/v1/auth/2fa/verify-setup")
      .set("Cookie", cookies)
      .send({ code });

    expect(verifyResponse.status).toBe(200);

    const disableCode = speakeasy.totp({ secret, encoding: "base32" });
    const disableResponse = await request(app)
      .post("/api/v1/auth/2fa/disable")
      .set("Cookie", cookies)
      .send({ code: disableCode });

    expect(disableResponse.status).toBe(200);
  });

  it("rotates refresh tokens", async () => {
    await createUser({
      email: "refresh@example.com",
      isEmailVerified: true,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "refresh@example.com",
      password: "Password@123",
    });

    const cookies = loginResponse.headers["set-cookie"] || [];
    const refreshToken = getCookieValue(cookies, "refreshToken");

    const refreshResponse = await request(app)
      .post("/api/v1/auth/refresh-token")
      .set("Cookie", cookies);

    expect(refreshResponse.status).toBe(200);

    const oldRefreshResponse = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken });

    expect(oldRefreshResponse.status).toBe(401);
  });

  it("logs out and invalidates refresh token", async () => {
    await createUser({
      email: "logout@example.com",
      isEmailVerified: true,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "logout@example.com",
      password: "Password@123",
    });

    const cookies = loginResponse.headers["set-cookie"] || [];
    const refreshToken = getCookieValue(cookies, "refreshToken");

    const logoutResponse = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookies);

    expect(logoutResponse.status).toBe(200);

    const refreshResponse = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(401);
  });

  it("changes password and rejects old password", async () => {
    await createUser({
      email: "change@example.com",
      isEmailVerified: true,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "change@example.com",
      password: "Password@123",
    });

    const cookies = loginResponse.headers["set-cookie"] || [];

    const changeResponse = await request(app)
      .put("/api/v1/auth/change-password")
      .set("Cookie", cookies)
      .send({ currentPassword: "Password@123", newPassword: "NewPass@123" });

    expect(changeResponse.status).toBe(200);

    const oldLogin = await request(app).post("/api/v1/auth/login").send({
      email: "change@example.com",
      password: "Password@123",
    });

    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/v1/auth/login").send({
      email: "change@example.com",
      password: "NewPass@123",
    });

    expect(newLogin.status).toBe(200);
  });

  it("validates update profile inputs", async () => {
    await createUser({
      email: "profile@example.com",
      isEmailVerified: true,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "profile@example.com",
      password: "Password@123",
    });

    const cookies = loginResponse.headers["set-cookie"] || [];

    const badUpdate = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("Cookie", cookies)
      .send({ avatar: "http://insecure.example.com/avatar.png" });

    expect(badUpdate.status).toBe(422);

    const goodUpdate = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("Cookie", cookies)
      .send({ name: "Updated User", avatar: "https://example.com/avatar.png" });

    expect(goodUpdate.status).toBe(200);
    expect(goodUpdate.body.data.user.name).toBe("Updated User");
  });

  it("initiates Google OAuth flow", async () => {
    const response = await request(app).get("/api/v1/auth/oauth/google");
    expect(response.status).toBe(302);
  });

  it("returns errors for invalid login and reset token", async () => {
    await createUser({ email: "fail@example.com", isEmailVerified: true });

    const badLogin = await request(app).post("/api/v1/auth/login").send({
      email: "fail@example.com",
      password: "WrongPassword@123",
    });

    expect(badLogin.status).toBe(401);

    const badReset = await request(app)
      .put("/api/v1/auth/reset-password/invalidtoken")
      .send({
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });

    expect(badReset.status).toBe(400);
  });
});
