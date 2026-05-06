# Authentication System Summary

## Setup Instructions

1. Install dependencies:

```bash
cd server
npm install
```

2. Copy environment variables:

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

## API Documentation

Base URL: `/api/auth`

- `POST /register`
  - Body: `name`, `email`, `password`, `role`, `phone`
  - Creates user and sends verification email

- `POST /login`
  - Body: `email`, `password`
  - Returns tokens or `requires2FA` with a `twoFactorToken`

- `GET /verify-email/:token`
  - Verifies email address

- `POST /forgot-password`
  - Body: `email`
  - Sends password reset email if account exists

- `PUT /reset-password/:token`
  - Body: `password`, `confirmPassword`
  - Resets password

- `POST /refresh-token`
  - Refreshes access token using cookie or body `refreshToken`

- `POST /2fa/verify`
  - Body: `code`, `twoFactorToken`
  - Completes 2FA login

- `GET /oauth/google`
  - Initiates Google OAuth flow

- `GET /oauth/google/callback`
  - OAuth callback; returns tokens

Protected routes (require auth cookie or Bearer token):

- `GET /me`
- `PUT /update-profile`
- `PUT /change-password`
- `POST /resend-verification`
- `POST /logout`
- `POST /2fa/setup`
- `POST /2fa/verify-setup`
- `POST /2fa/disable`

## Test Credentials

- Email: `user@example.com`
- Password: `Password@123`

## Environment Variables Checklist

Required:

- `MONGO_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `JWT_SECRET`
- `FRONTEND_URL` or `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

Development email:

- `MAILTRAP_SMTP_HOST`
- `MAILTRAP_SMTP_PORT`
- `MAILTRAP_SMTP_USER`
- `MAILTRAP_SMTP_PASS`

Production email:

- `RESEND_SMTP_HOST`
- `RESEND_SMTP_PORT`
- `RESEND_SMTP_USER`
- `RESEND_SMTP_PASS`
- `EMAIL_FROM`

Optional but recommended:

- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `ACCESS_TOKEN_COOKIE_EXPIRES`
- `REFRESH_TOKEN_COOKIE_EXPIRES`
- `TWO_FACTOR_TOKEN_SECRET`

## Common Issues and Solutions

- Tests fail due to missing env vars: ensure `.env` exists or run `npm test` with defaults.
- OAuth callback errors: confirm `GOOGLE_CALLBACK_URL` matches your Google console settings.
- Emails not sending in dev: validate Mailtrap credentials in `.env`.
- Refresh token errors: clear cookies and log in again.
- 2FA invalid code: check device time sync and try again.
