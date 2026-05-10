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

Frontend auth handoff: [FRONTEND_API_DOCS.md](FRONTEND_API_DOCS.md).

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
__________________________________________________________

Context — what is already done (do not touch these):
The following auth flows are fully implemented and wired end-to-end. Do not modify any file involved in these flows:

Register → Verify Email Prompt → Verify Email page
Login (normal, no 2FA) → role-based dashboard redirect
Logout → clear store → redirect to /login
Zustand auth store (src/stores/auth.store.ts) — final, do not modify
Axios instance with refresh interceptor (src/lib/axios.ts) — final, do not modify
All existing hooks in src/features/auth/hooks/ — final, do not modify
All Zod schemas in src/features/auth/schemas/auth.schema.ts) — final, do not modify
Route constants in src/app/routes.ts — final, do not modify


Your task — implement these remaining flows exactly as described in FRONTEND_API_DOCS.md:
Read FRONTEND_API_DOCS.md fully before writing anything. Every decision — field names, HTTP methods, response shapes, error codes, redirect behavior — must come from that file, not assumptions.
Flows to implement in this order:
1. Forgot Password flow

Page: ForgotPasswordPage.tsx
Endpoint: POST /forgot-password with { email }
Read the file: the success message must be generic regardless of whether the email exists — never reveal email existence, treat 404 identically to 200
After submit success: replace the form with a static "check your inbox" screen — no redirect
Wire useForgotPassword hook, react-hook-form with zodResolver(forgotPasswordSchema), pass setError to the hook

2. Reset Password flow

Page: ResetPasswordPage.tsx
Endpoint: PUT /reset-password/:token — token comes from useParams()
Fields: password + confirmPassword — validate both match client-side before sending
On success: toast + navigate to /login with replace: true
On 400/401: do not show the form — render a "link expired" UI with a link to /forgot-password
On 422: map field errors onto form fields via setError
Wire useResetPassword hook, pass token from useParams() and setError

3. Login with 2FA flow

This is a two-step continuation of the existing login — the first step (email/password login returning requires2FA: true) is already handled by useLogin, which navigates to the 2FA page with twoFactorToken in location.state
Page: TwoFactorPage.tsx (or equivalent — read what exists)
Endpoint: POST /2fa/verify with { twoFactorToken, code }
Read twoFactorToken from useLocation().state — if it is missing, redirect immediately to /login
Field: single 6-digit numeric code input — validate length === 6, digits only
On success: same behavior as normal login — setAuth, navigate to role-based dashboard with replace: true
On 400/401: set field error on the code input — "Invalid or expired code"
On 429: toast error, do not set field error
Wire useVerify2FA hook, pass setError

4. Setup 2FA flow (inside ProfilePage)

This is a two-step flow within the profile page, gated by user.isTwoFactorEnabled === false
Step 1 — trigger: button "Enable 2FA" → call useInitSetup2FA mutation → response contains { qrCodeDataUrl, secret, otpauthUrl } from POST /2fa/setup
Step 1 — display: render the qrCodeDataUrl as an <img> and show the plain-text secret for manual entry
Step 2 — verify: render a 6-digit code input + "Verify & Enable" button → call useVerifySetup2FA mutation → POST /2fa/verify-setup with { code }
On verify success: patch user.isTwoFactorEnabled = true in Zustand store, invalidate /me query, reset form, collapse the setup UI back to the "Enable 2FA" button state
On 400/401: set field error on the code input
Wire useInitSetup2FA and useVerifySetup2FA — both already exist in hooks

5. Disable 2FA flow (inside ProfilePage)

Gated by user.isTwoFactorEnabled === true
Render a 6-digit code input + "Disable 2FA" button
Endpoint: POST /2fa/disable with { code }
On success: patch user.isTwoFactorEnabled = false in store, invalidate /me, reset form
On 400/401: set field error "Incorrect code. Check your authenticator app."
Wire useDisable2FA hook

6. Update Profile flow (inside ProfilePage)

Endpoint: PUT /update-profile
Allowed fields: name, phone, location, bio, avatar
Validation from API docs: name, location, bio reject HTML (< or >); avatar must be a valid HTTPS URL — these rules are already in the schema, just wire it
On success: patch Zustand store with updated user, invalidate /me query, show success toast
On 422: map field errors to form via setError
Wire useUpdateProfile hook with zodResolver(updateProfileSchema)

7. Change Password flow (inside ProfilePage)

Endpoint: PUT /change-password with { currentPassword, newPassword }
Note: confirmNewPassword is client-side only — do not send it to the API
On success per API docs: backend clears all sessions — frontend must clearAuth(), queryClient.clear(), navigate to /login with replace: true, show toast before redirect
On 401: set field error on currentPassword — "Current password is incorrect"
On 422: map field errors
Wire useChangePassword hook

8. login with google flow (in login page)
implement this from FRONTEND_API_DOCS.md as needed do at your own thing but make sure system will work as expected. that's all

Hard rules — read before writing a single line:

Read every page file before editing it — never assume its current contents
Preserve all existing JSX, Tailwind classes, and component structure exactly — only add hook wiring, form connections, and conditional renders
Every form uses react-hook-form with zodResolver and the matching schema from @/features/auth/schemas/auth.schema
All hooks imported from @/features/auth/hooks (barrel index)
Store imported from @/stores/auth.store
Routes imported from @/app/routes
Hooks handle all navigation — do not call navigate() inside components except to guard missing state (e.g. missing twoFactorToken → redirect to /login)
Never use localStorage
The ProfilePage has multiple independent form sections — each section gets its own useForm instance and its own hook — they must not share state@contextScopeItemMention 