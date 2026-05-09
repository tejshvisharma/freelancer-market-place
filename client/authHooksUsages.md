# Auth Hooks — Usage Reference
> Drop these snippets directly into your existing page components.

---

## 1. RegisterPage.tsx

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas/auth.schema";
import { useRegister } from "@/features/auth/hooks";

export default function RegisterPage() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "client", phone: "" },
  });

  const register = useRegister({ setError: form.setError });

  const onSubmit = (values: RegisterInput) => register.mutate(values);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* your existing JSX — add isPending to disable submit button */}
      <button type="submit" disabled={register.isPending}>
        {register.isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
```

---

## 2. VerifyEmailPromptPage.tsx

```tsx
import { useLocation } from "react-router-dom";

// No hook needed — this page is purely informational.
// The registered email is passed via location.state from useRegister.

export default function VerifyEmailPromptPage() {
  const { state } = useLocation();
  const email: string = state?.email ?? "your inbox";

  return (
    <div>
      <h1>Check your email</h1>
      <p>We sent a verification link to <strong>{email}</strong></p>
      {/* Link to /resend-verification as fallback */}
    </div>
  );
}
```

---

## 3. VerifyEmailPage.tsx

```tsx
import { useParams } from "react-router-dom";
import { useVerifyEmail } from "@/features/auth/hooks";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const { isPending, isSuccess, isError } = useVerifyEmail(token);

  if (isPending) return <Spinner />;

  if (isSuccess) return (
    <div>
      <CheckIcon />
      <h1>Email verified!</h1>
      <p>Redirecting you to login…</p>
    </div>
  );

  if (isError) return (
    <div>
      <XIcon />
      <h1>Link expired or invalid</h1>
      <a href="/resend-verification">Request a new link</a>
    </div>
  );
}
```

---

## 4. ResendVerificationEmailPage.tsx

```tsx
import { useResendVerification } from "@/features/auth/hooks";

export default function ResendVerificationEmailPage() {
  const { mutate, isPending, isSuccess, cooldown, isOnCooldown } = useResendVerification();

  return (
    <div>
      <h1>Resend verification email</h1>
      {isSuccess && !isOnCooldown && <p>Email sent! Check your inbox.</p>}
      <button
        onClick={() => mutate()}
        disabled={isPending || isOnCooldown}
      >
        {isPending
          ? "Sending..."
          : isOnCooldown
          ? `Resend in ${cooldown}s`
          : "Resend verification email"}
      </button>
    </div>
  );
}
```

---

## 5. LoginPage.tsx

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth.schema";
import { useLogin } from "@/features/auth/hooks";

export default function LoginPage() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useLogin({ setError: form.setError });

  const onSubmit = (values: LoginInput) => login.mutate(values);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* your existing JSX */}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
```

---

## 6. ForgotPasswordPage.tsx

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks";

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending, isEmailSent } = useForgotPassword({ setError: form.setError });

  if (isEmailSent) {
    return (
      <div>
        <MailIcon />
        <h1>Check your inbox</h1>
        <p>If that email is registered, a reset link is on its way.</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((v) => mutate(v))}>
      {/* your existing JSX */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
```

---

## 7. ResetPasswordPage.tsx

```tsx
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas/auth.schema";
import { useResetPassword } from "@/features/auth/hooks";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutate, isPending, isError, error } = useResetPassword({
    token,
    setError: form.setError,
  });

  // Detect expired token error
  const isTokenExpired =
    (error as any)?.response?.status === 400 ||
    (error as any)?.response?.status === 401;

  if (isError && isTokenExpired) {
    return (
      <div>
        <h1>Link expired</h1>
        <p>This password reset link has expired.</p>
        <a href={ROUTES.FORGOT_PASSWORD}>Request a new link</a>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((v) => mutate(v))}>
      {/* your existing JSX */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
```

---

## 8. ProfilePage.tsx

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import {
  updateProfileSchema, type UpdateProfileInput,
  changePasswordSchema, type ChangePasswordInput,
  twoFACodeSchema, type TwoFACodeInput,
} from "@/features/auth/schemas/auth.schema";
import {
  useUpdateProfile,
  useChangePassword,
  useInitSetup2FA,
  useVerifySetup2FA,
  useDisable2FA,
} from "@/features/auth/hooks";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  // ── Update profile ──────────────────────────────────────────────────────
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      location: "",
      bio: "",
      avatar: user?.avatar ?? "",
    },
  });
  const updateProfile = useUpdateProfile({ setError: profileForm.setError });

  // ── Change password ─────────────────────────────────────────────────────
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  const changePassword = useChangePassword({ setError: passwordForm.setError });

  // ── 2FA ─────────────────────────────────────────────────────────────────
  const twoFAForm = useForm<TwoFACodeInput>({
    resolver: zodResolver(twoFACodeSchema),
    defaultValues: { code: "" },
  });

  const initSetup2FA = useInitSetup2FA();
  const verifySetup2FA = useVerifySetup2FA({
    setError: twoFAForm.setError,
    onSuccess: () => twoFAForm.reset(),
  });
  const disable2FA = useDisable2FA({
    setError: twoFAForm.setError,
    onSuccess: () => twoFAForm.reset(),
  });

  return (
    <div>
      {/* Profile form */}
      <form onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}>
        {/* your existing profile fields */}
        <button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Change password form */}
      <form onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))}>
        {/* your existing password fields */}
        <button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating..." : "Change password"}
        </button>
      </form>

      {/* 2FA section */}
      {user?.isTwoFactorEnabled ? (
        // Disable 2FA flow
        <form onSubmit={twoFAForm.handleSubmit((v) => disable2FA.mutate(v))}>
          {/* 6-digit code input */}
          <button type="submit" disabled={disable2FA.isPending}>
            {disable2FA.isPending ? "Disabling..." : "Disable 2FA"}
          </button>
        </form>
      ) : (
        // Enable 2FA flow
        <>
          {!initSetup2FA.data ? (
            <button onClick={() => initSetup2FA.mutate()} disabled={initSetup2FA.isPending}>
              {initSetup2FA.isPending ? "Loading..." : "Enable 2FA"}
            </button>
          ) : (
            <>
              {/* Show QR code */}
              <img src={initSetup2FA.data.data.data?.qrCodeDataUrl} alt="Scan with authenticator" />
              <form onSubmit={twoFAForm.handleSubmit((v) => verifySetup2FA.mutate(v))}>
                {/* 6-digit code input */}
                <button type="submit" disabled={verifySetup2FA.isPending}>
                  {verifySetup2FA.isPending ? "Verifying..." : "Verify & Enable"}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

---


## Logout — dashboard logout button

```tsx
import { useLogout } from "@/features/auth/hooks";

function LogoutButton() {
  const { mutate: logout, isPending } = useLogout();
  return (
    <button onClick={() => logout()} disabled={isPending}>
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
```