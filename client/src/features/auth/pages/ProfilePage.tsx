import { useState, useRef } from 'react';
import {
  Camera, Loader2, Eye, EyeOff,
  CheckCircle2, Shield, Pencil, X, Check,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
} from '../api';

// ── Password strength helper ───────────────────────────────────────────────────
function getPasswordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;

  const config = [
    { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-500'    },
    { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-500'    },
    { label: 'Fair',   color: 'bg-yellow-500', text: 'text-yellow-500' },
    { label: 'Good',   color: 'bg-blue-500',   text: 'text-blue-500'   },
    { label: 'Strong', color: 'bg-green-500',  text: 'text-green-500'  },
  ];

  return { score, ...config[score] };
}

export default function ProfilePage() {
  // ── Profile edit state ─────────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName]                 = useState('');
  const [username, setUsername]                 = useState('');
  const [profileError, setProfileError]         = useState('');

  // ── Password state ─────────────────────────────────────────────────────────
  const [oldPassword, setOldPassword]           = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showOld, setShowOld]                   = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [passwordSuccess, setPasswordSuccess]   = useState(false);
  const [passwordError, setPasswordError]       = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: profile, isLoading }  = useProfileQuery();
  const updateProfile                 = useUpdateProfileMutation();
  const updateAvatar                  = useUpdateAvatarMutation();
  const changePassword                = useChangePasswordMutation();

  // ── Derived ────────────────────────────────────────────────────────────────
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric',
      })
    : null;

  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  // ── Profile edit handlers ──────────────────────────────────────────────────
  const handleStartEdit = () => {
    setFullName(profile?.fullName ?? '');
    setUsername(profile?.username ?? '');
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setProfileError('');

    if (!fullName.trim() && !username.trim()) {
      setProfileError('Please update at least one field.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        ...(fullName.trim()  && { fullName:  fullName.trim()  }),
        ...(username.trim()  && { username:  username.trim()  }),
      });
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message ?? 'Failed to update profile.'
      );
    }
  };

  // ── Avatar handler ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await updateAvatar.mutateAsync(file);
    } catch {
      // avatar upload error — Cloudinary not set up yet
    }
    e.target.value = '';
  };

  // ── Password handler ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    try {
      await changePassword.mutateAsync({ oldPassword, newPassword });
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message ?? 'Failed to change password.'
      );
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto max-w-2xl space-y-8">
      <div className="pointer-events-none absolute -left-14 -top-10 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 top-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* ── Hero Section: Avatar + Identity ───────────────────────────────── */}
      <div className="flex items-center gap-6 rounded-xl border border-border/70 bg-card/90 p-6 shadow-sm">

        {/* Avatar with upload overlay */}
        <div className="relative group shrink-0">
          <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
            <AvatarImage src={profile?.avatar?.url} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {profile?.username?.slice(0, 2).toUpperCase() ?? '??'}
            </AvatarFallback>
          </Avatar>

          {/* Upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatar.isPending}
            aria-label="Upload avatar"
            className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {updateAvatar.isPending ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <>
                <Camera className="h-5 w-5 text-white" />
                <span className="text-white text-xs mt-1 font-medium">
                  Upload
                </span>
              </>
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
            aria-label="Avatar file input"
          />
        </div>

        {/* Identity info */}
        <div className="space-y-2 min-w-0">
          <h2 className="text-xl font-bold truncate">
            {profile?.fullName || profile?.username}
          </h2>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.email}
          </p>
          {memberSince && (
            <p className="text-xs text-muted-foreground">
              Member since {memberSince}
            </p>
          )}

          {/* Email verified badge */}
          {profile?.isEmailVerified ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3" />
              Email Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300"
            >
              Email Not Verified
            </Badge>
          )}
        </div>
      </div>

      {/* ── Profile Information ────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-sm">

        {/* Section header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Profile Information</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your personal details
            </p>
          </div>

          {/* Edit / Cancel toggle */}
          {!isEditingProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="h-8"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
        </div>

        {/* Form fields */}
        <div className="p-5 space-y-4">

          {/* Profile error */}
          {profileError && (
            <Alert variant="destructive">
              <AlertDescription>{profileError}</AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full Name
            </Label>
            {isEditingProfile ? (
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoFocus
              />
            ) : (
              <p className="text-sm font-medium py-2 px-3 bg-muted/30 rounded-md">
                {profile?.fullName || '—'}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Username
            </Label>
            {isEditingProfile ? (
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
              />
            ) : (
              <p className="text-sm font-medium py-2 px-3 bg-muted/30 rounded-md">
                @{profile?.username || '—'}
              </p>
            )}
          </div>

          {/* Email — always read-only */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </Label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium py-2 px-3 bg-muted/30 rounded-md flex-1 text-muted-foreground">
                {profile?.email}
              </p>
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Save button — only in edit mode */}
          {isEditingProfile && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                size="sm"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Change Password ────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-sm">

        {/* Section header */}
        <div className="border-b border-border/70 bg-muted/30 px-5 py-4">
          <h2 className="text-sm font-semibold">Change Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use a strong password to keep your account secure
          </p>
        </div>

        <div className="p-5 space-y-4">

          {/* Success */}
          {passwordSuccess && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                Password changed successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {passwordError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="oldPassword" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                aria-label={showOld ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOld
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword && strength && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < strength.score ? strength.color : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength.text}`}>
                  {strength.label} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword && newPassword && (
              <p className={`text-xs font-medium flex items-center gap-1 ${
                passwordsMatch ? 'text-emerald-600 dark:text-emerald-300' : 'text-destructive'
              }`}>
                {passwordsMatch ? (
                  <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                ) : (
                  <><X className="h-3 w-3" /> Passwords do not match</>
                )}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              disabled={
                !oldPassword ||
                !newPassword ||
                !confirmPassword ||
                !passwordsMatch ||
                changePassword.isPending
              }
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>

        </div>
      </section>

    </div>
  );
}