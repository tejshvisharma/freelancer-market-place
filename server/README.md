# Freelancer Marketplace Server

Production-ready authentication system for the Freelancer Marketplace backend built with Express and MongoDB. This server follows a layered architecture (routes -> controllers -> services -> models), centralized error handling, and secure authentication practices (JWT, refresh tokens, HTTP-only cookies, and 2FA).

## Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- Scripts
- API Reference
- Auth Flow Summary
- Testing
- Security Notes
- Troubleshooting

## Overview

This server provides a complete authentication system with email verification, password reset, refresh-token rotation, and optional 2FA. Google OAuth is included for social login. Responses and errors are standardized via `ApiResponse` and `ApiError` classes.

## Features

- Email + password registration with verification
- JWT access and refresh tokens
- HTTP-only auth cookies
- Password reset flow
- 2FA setup and verification (TOTP)
- Google OAuth 2.0 login
- Rate-limited auth endpoints
- Centralized error handling
- Input validation with `express-validator`

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for access/refresh tokens
- Passport + Google OAuth
- Speakeasy + QRCode for 2FA
- Nodemailer for emails
- Jest + Supertest for tests

## Project Structure

```
server/
  src/
    app.js
    config/
      db.js
      passport.js
      validateEnv.js
    controllers/
      authController.js
    middleware/
      auth.middleware.js
      error.middleware.js
      validate.js
    models/
      User.js
    routes/
      authRoutes.js
      index.routes.js
    services/
      authService.js
      emailService.js
    utils/
      api-error.js
      api-response.js
      async-handler.js
      generateTokens.js
      emailTemplates.js
  tests/
    auth.test.js
    README.md
  SUMMARY.md
  .env.example
  index.js
```

## Getting Started

1. Install dependencies:

```bash
cd server
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Start the server:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

## Environment Variables

See [server/.env.example](.env.example) for the complete list. The key variables are grouped below.

### Core

- `NODE_ENV`
- `PORT`
- `BASE_URL`
- `MONGO_URI`

### Frontend URLs

- `FRONTEND_URL` or `CLIENT_URL`

### Token Secrets

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `JWT_SECRET`
- `TWO_FACTOR_TOKEN_SECRET` (optional)

### Token Expiration

- `ACCESS_TOKEN_EXPIRES_IN` (default: 15m)
- `REFRESH_TOKEN_EXPIRES_IN` (default: 30d)
- `ACCESS_TOKEN_COOKIE_EXPIRES` (default: 15m)
- `REFRESH_TOKEN_COOKIE_EXPIRES` (default: 30d)

### Google OAuth

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

### Email (Development)

- `MAILTRAP_SMTP_HOST`
- `MAILTRAP_SMTP_PORT`
- `MAILTRAP_SMTP_USER`
- `MAILTRAP_SMTP_PASS`

### Email (Production)

- `RESEND_SMTP_HOST`
- `RESEND_SMTP_PORT`
- `RESEND_SMTP_USER`
- `RESEND_SMTP_PASS`
- `EMAIL_FROM`

## Scripts

- `npm run dev` - start server with Nodemon
- `npm start` - start server in production mode
- `npm test` - run Jest test suite

## API Reference

Base URL: `/api/auth`

### Public

- `POST /register`
- `POST /login`
- `GET /verify-email/:token`
- `POST /forgot-password`
- `PUT /reset-password/:token`
- `POST /refresh-token`
- `POST /2fa/verify`
- `GET /oauth/google`
- `GET /oauth/google/callback`

### Protected (auth cookie or Bearer token)

- `GET /me`
- `PUT /update-profile`
- `PUT /change-password`
- `POST /resend-verification`
- `POST /logout`
- `POST /2fa/setup`
- `POST /2fa/verify-setup`
- `POST /2fa/disable`

## Auth Flow Summary

1. Register -> verification email sent.
2. Verify email -> account activated.
3. Login -> access/refresh tokens issued.
4. Refresh -> new tokens rotated.
5. 2FA (optional) -> requires `/2fa/verify` after login.

## Testing

Tests are located in [server/tests/auth.test.js](tests/auth.test.js). They run against an in-memory MongoDB instance and mock email delivery. See [server/tests/README.md](tests/README.md) for details.

## Security Notes

- Access and refresh tokens are stored in HTTP-only cookies.
- Refresh tokens are hashed before storing in MongoDB.
- Rate limiting is applied to registration, login, and email endpoints.
- Inputs are validated and sanitized via `express-validator`.
- Tokens are rotated on refresh and revoked on password changes.

## Troubleshooting

- Validation errors: check request payloads and validators.
- OAuth issues: verify `GOOGLE_CALLBACK_URL` matches Google Console settings.
- Email not sending: ensure SMTP credentials are set in `.env`.
- Refresh token errors: clear cookies and log in again.

---

For a shorter quick-start and checklist, see [server/SUMMARY.md](SUMMARY.md).
