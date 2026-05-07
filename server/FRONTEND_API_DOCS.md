# Frontend Auth API Docs

This document is for the frontend team building the authentication UI for Freelancer Marketplace.

## Base URL

All auth endpoints are mounted under:

`/api/v1/auth`

Example:

`http://localhost:8000/api/v1/auth/login`

## Response Format

### Success response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "accessToken": "..."
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": [],
  "data": null
}
```

### Validation error

Validation errors return HTTP `422` and an `errors` array:

```json
{
  "success": false,
  "message": "Received data is not valid",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ],
  "data": null
}
```

## Important Client Notes

- The backend sets `accessToken` and `refreshToken` as HTTP-only cookies on login, refresh, Google login, and 2FA verification.
- The login, refresh, Google OAuth, and 2FA responses also include `accessToken` in the JSON body.
- For protected requests, the backend accepts either:
  - `Authorization: Bearer <accessToken>`
  - cookies containing `accessToken`
- If your frontend is cross-origin, use `credentials: 'include'` or `withCredentials: true` for cookie-based auth.
- Do not store sensitive tokens in localStorage if you can avoid it.
- The auth validators reject HTML-like input for profile text fields and registration name.

## Recommended Frontend Auth Strategy

Preferred approach for the UI:

1. Call login/register using JSON.
2. Read the returned `accessToken` from the response body.
3. Store the access token in memory only if you need to attach it manually.
4. Use cookies for refresh token flow.
5. If using cookie auth end-to-end, make sure the frontend client sends credentials.

## Authentication Endpoints

### 1) Register

`POST /register`

Creates a new user and sends a verification email.

#### Request body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123",
  "role": "client",
  "phone": "+15551234567"
}
```

#### Field rules

- `name`: required, 2-50 chars, no `<` or `>`
- `email`: required, valid email
- `password`: required, minimum 8 chars, must include uppercase, lowercase, number, and special character
- `role`: required, must be `client` or `freelancer`
- `phone`: optional, valid phone format

#### Success response

```json
{
  "success": true,
  "message": "Registration successful. Verify your email.",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "client",
      "avatar": "default-avatar.jpg",
      "isEmailVerified": false,
      "isTwoFactorEnabled": false,
      "isActive": true,
      "isSuspended": false
    }
  }
}
```

#### Frontend behavior

- Show a success screen telling the user to verify their email.
- Do not auto-login after registration.
- Redirect to login or a verification pending screen.

---

### 2) Login

`POST /login`

Logs in a verified user and returns auth tokens.

#### Request body

```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```

#### Success response for normal login

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "client"
    },
    "accessToken": "jwt-access-token"
  }
}
```

#### 2FA response

If the user has 2FA enabled:

```json
{
  "success": true,
  "message": "2FA required",
  "data": {
    "requires2FA": true,
    "twoFactorToken": "temporary-2fa-token"
  }
}
```

#### Frontend behavior

- If `requires2FA` is true, show the OTP screen.
- Otherwise, store/use the returned `accessToken` for protected calls.
- If your app is cookie-based, also allow the browser to keep the auth cookies.

---

### 3) Verify Email

`GET /verify-email/:token`

Used by the email verification link.

#### Example

`/api/v1/auth/verify-email/abc123token`

#### Success response

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "jane@example.com",
      "isEmailVerified": true
    }
  }
}
```

#### Frontend behavior

- After clicking the email link, show a success or error page.
- If verification succeeds, redirect to login.
- If the token is invalid or expired, show a re-send verification option.

---

### 4) Resend Verification Email

`POST /resend-verification`

Protected route. Requires a valid access token or auth cookie.

#### Success response

```json
{
  "success": true,
  "message": "Verification email sent",
  "data": {
    "user": {
      "_id": "...",
      "email": "jane@example.com",
      "isEmailVerified": false
    }
  }
}
```

#### Frontend behavior

- Only show this action for logged-in users whose email is not verified.
- If the user is already verified, the backend returns a success message saying so.

---

### 5) Forgot Password

`POST /forgot-password`

Sends a password reset email if the account exists.

#### Request body

```json
{
  "email": "jane@example.com"
}
```

#### Success response

```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent",
  "data": null
}
```

#### Frontend behavior

- Always show the same generic success message.
- Do not reveal whether the email exists.

---

### 6) Reset Password

`PUT /reset-password/:token`

Used from the password reset email link.

#### Request body

```json
{
  "password": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

#### Success response

```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

#### Frontend behavior

- Validate both fields on the client before sending.
- Redirect to login after success.

---

### 7) Refresh Token

`POST /refresh-token`

Creates a new access token and rotates the refresh token.

#### Accepted inputs

- Refresh token cookie, or
- `refreshToken` in request body

#### Success response

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "user": {
      "_id": "...",
      "email": "jane@example.com"
    },
    "accessToken": "new-access-token"
  }
}
```

#### Frontend behavior

- Call this when the access token expires.
- Retry the original protected request after refresh.
- If refresh fails, log the user out and redirect to login.

---

### 8) Current User Profile

`GET /me`

Fetches the authenticated user.

#### Required auth

- Bearer access token, or
- auth cookie

#### Success response

```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "client"
    }
  }
}
```

#### Frontend behavior

- Call this after login or page refresh to hydrate the user session.
- Use it to populate the navbar, profile menu, and protected screens.

---

### 9) Update Profile

`PUT /update-profile`

Updates profile fields for the logged-in user.

#### Allowed fields

- `name`
- `phone`
- `location`
- `bio`
- `avatar`

#### Example body

```json
{
  "name": "Jane D",
  "phone": "+15551234567",
  "location": "New York, USA",
  "bio": "Freelance designer",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Validation notes

- `name`, `location`, and `bio` reject HTML-like input.
- `avatar` must be a valid HTTPS URL.

#### Success response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane D"
    }
  }
}
```

---

### 10) Change Password

`PUT /change-password`

Protected route for logged-in users.

#### Request body

```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}
```

#### Success response

```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": null
}
```

#### Frontend behavior

- After success, log the user out locally and prompt login again.
- The backend clears stored refresh tokens and cookies.

---

### 11) Logout

`POST /logout`

Protected route.

#### Success response

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

#### Frontend behavior

- Clear local user state.
- Remove any in-memory access token.
- Redirect to login.

---

## 2FA Endpoints

### 12) Verify 2FA Login

`POST /2fa/verify`

Completes login for users with 2FA enabled.

#### Request body

```json
{
  "twoFactorToken": "temporary-2fa-token",
  "code": "123456"
}
```

#### Success response

```json
{
  "success": true,
  "message": "2FA verified",
  "data": {
    "user": {
      "_id": "...",
      "email": "jane@example.com"
    },
    "accessToken": "jwt-access-token"
  }
}
```

#### Frontend behavior

- Render an OTP input after login returns `requires2FA: true`.
- After success, proceed like a normal login.

---

### 13) Setup 2FA

`POST /2fa/setup`

Protected route that generates a QR code and shared secret.

#### Success response

```json
{
  "success": true,
  "message": "2FA setup initiated",
  "data": {
    "qrCodeDataUrl": "data:image/png;base64,...",
    "secret": "BASE32SECRET",
    "otpauthUrl": "otpauth://totp/..."
  }
}
```

#### Frontend behavior

- Show the QR code image.
- Let the user scan it with an authenticator app.
- Then ask them to enter the 6-digit code to verify setup.

---

### 14) Verify 2FA Setup

`POST /2fa/verify-setup`

Protected route that enables 2FA after code verification.

#### Request body

```json
{
  "code": "123456"
}
```

#### Success response

```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "data": {
    "user": {
      "_id": "...",
      "isTwoFactorEnabled": true
    }
  }
}
```

---

### 15) Disable 2FA

`POST /2fa/disable`

Protected route.

#### Request body

```json
{
  "code": "123456"
}
```

#### Success response

```json
{
  "success": true,
  "message": "2FA disabled successfully",
  "data": {
    "user": {
      "_id": "...",
      "isTwoFactorEnabled": false
    }
  }
}
```

---

## Google OAuth

### 16) Start Google Sign-In

`GET /oauth/google`

Redirect the browser to this endpoint.

### 17) Google Callback

`GET /oauth/google/callback`

The backend completes the OAuth flow, sets cookies, and returns a success response.

#### Frontend behavior

- Usually open the Google auth endpoint in the browser.
- After callback, redirect the user into the app.
- If you are using a popup flow, close the popup and refresh session state.

---

## Error Handling Guide

### Common status codes

- `400` - Bad request
- `401` - Unauthorized or invalid token
- `403` - Forbidden / email not verified / inactive account
- `409` - Duplicate email during registration
- `422` - Validation error
- `429` - Too many requests
- `500` - Server error

### Suggested frontend handling

- `401`: clear auth state and redirect to login.
- `403` for email verification: show verification pending UI.
- `422`: display field-level errors next to inputs.
- `429`: show a cooldown message.
- `500`: show a generic retry message.

## Suggested Auth UI Flow

### Registration flow

1. User submits register form.
2. Show loading state.
3. On success, show "verify your email" screen.
4. Allow resend verification if needed.

### Login flow

1. User submits email/password.
2. If `requires2FA` is returned, show OTP screen.
3. Otherwise store auth state and route to dashboard.
4. Call `/me` to hydrate the user session.

### Session restore flow

1. On app load, call `/me`.
2. If it fails with `401`, try `/refresh-token`.
3. If refresh succeeds, retry `/me`.
4. If refresh fails, show login.

### Password reset flow

1. User requests reset email.
2. User opens reset link from email.
3. Submit new password and confirmation.
4. Redirect to login after success.

## Notes for Implementation

- Use a single auth client wrapper so refresh and retry logic stays consistent.
- Keep field error mapping by `field` name.
- Do not assume every success response contains the same `data` shape; inspect the endpoint response.
- For protected routes, prefer a centralized request interceptor or fetch wrapper.

## Quick Endpoint List

- `POST /register`
- `POST /login`
- `GET /verify-email/:token`
- `POST /forgot-password`
- `PUT /reset-password/:token`
- `POST /refresh-token`
- `GET /me`
- `PUT /update-profile`
- `PUT /change-password`
- `POST /resend-verification`
- `POST /logout`
- `POST /2fa/setup`
- `POST /2fa/verify-setup`
- `POST /2fa/disable`
- `POST /2fa/verify`
- `GET /oauth/google`
- `GET /oauth/google/callback`
