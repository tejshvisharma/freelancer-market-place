// src/pages/auth/ProfilePage.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateProfile, useChangePassword, useInitSetup2FA, useVerifySetup2FA, useDisable2FA } from '@/features/auth/hooks';
import { updateProfileSchema, changePasswordSchema, twoFACodeSchema } from '@/features/auth/schemas/auth.schema';
import type { UpdateProfileInput, ChangePasswordInput, TwoFACodeInput } from '@/features/auth/schemas/auth.schema';
import { ROUTES } from '@/app/routes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  MapPin,
  FileText,
  Camera,
  Key,
  Smartphone,
  AlertCircle,
  Loader2,
  QrCode,
  Copy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ==================== TYPES ====================

type SectionKey = 'overview' | 'profile' | 'password' | '2fa';

// ==================== SUB-COMPONENTS ====================

// Status badge for email verification
const VerificationBadge = ({ verified }: { verified: boolean }) => {
  if (verified) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">
      <AlertCircle className="h-3 w-3 mr-1" />
      Unverified
    </Badge>
  );
};

// Status badge for 2FA
const TwoFABadge = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
        <Shield className="h-3 w-3 mr-1" />
        2FA Enabled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground">
      <Shield className="h-3 w-3 mr-1" />
      2FA Disabled
    </Badge>
  );
};

// Role badge with color coding
const RoleBadge = ({ role }: { role: string }) => {
  const colors: Record<string, string> = {
    client: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    freelancer: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
    admin: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  };
  return (
    <Badge variant="outline" className={colors[role] || colors.client}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

// Password input with toggle
const PasswordInput = ({
  field,
  placeholder,
  disabled,
}: {
  field: any;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10"
        {...field}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// Section wrapper with animation
const SectionWrapper = ({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  </motion.div>
);

// ==================== MAIN PROFILE PAGE ====================

export default function ProfilePage() {
  // ── Zustand selectors (individual to prevent re-renders) ──
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // ── 2FA state ──
  const [showQrSetup, setShowQrSetup] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // ── Profile form ──
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: '',
      bio: '',
      avatar: user?.avatar || '',
    },
  });

  // Reset profile form when user data loads/changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        phone: user.phone || '',
        location: (user as any).location || '',
        bio: (user as any).bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useUpdateProfile({
    setError: profileForm.setError,
  });

  // Reset form after successful update
  useEffect(() => {
    if (updateProfile.isSuccess && updateProfile.data?.data?.data?.user) {
      const updatedUser = updateProfile.data.data.data.user;
      profileForm.reset({
        name: updatedUser.name || '',
        phone: updatedUser.phone || '',
        location: (updatedUser as any).location || '',
        bio: (updatedUser as any).bio || '',
        avatar: updatedUser.avatar || '',
      });
    }
  }, [updateProfile.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const onProfileSubmit = (data: UpdateProfileInput) => {
    // Remove empty strings so they aren't sent
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    ) as UpdateProfileInput;
    updateProfile.mutate(cleaned);
  };

  // ── Change password form ──
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const changePassword = useChangePassword({
    setError: passwordForm.setError,
  });

  const onPasswordSubmit = (data: ChangePasswordInput) => {
    changePassword.mutate(data);
  };

  // ── 2FA: Init setup ──
  const init2FA = useInitSetup2FA();

  const handleEnable2FA = () => {
    init2FA.mutate(undefined, {
      onSuccess: (res) => {
        const data = res.data?.data;
        if (data) {
          setQrData({ qrCodeDataUrl: data.qrCodeDataUrl, secret: data.secret });
          setShowQrSetup(true);
          setIsSetupComplete(false);
        }
      },
    });
  };

  // ── 2FA: Verify setup ──
  const verify2FAForm = useForm<TwoFACodeInput>({
    resolver: zodResolver(twoFACodeSchema),
    defaultValues: { code: '' },
  });

  const verify2FA = useVerifySetup2FA({
    setError: verify2FAForm.setError,
    onSuccess: () => {
      setShowQrSetup(false);
      setQrData(null);
      setIsSetupComplete(true);
      verify2FAForm.reset();
    },
  });

  const onVerify2FA = (data: TwoFACodeInput) => {
    verify2FA.mutate(data);
  };

  // ── 2FA: Disable ──
  const disable2FAForm = useForm<TwoFACodeInput>({
    resolver: zodResolver(twoFACodeSchema),
    defaultValues: { code: '' },
  });

  const disable2FA = useDisable2FA({
    setError: disable2FAForm.setError,
  });

  const onDisable2FA = (data: TwoFACodeInput) => {
    disable2FA.mutate(data);
  };

  // ── Copy secret to clipboard ──
  const copySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      toast.success('Secret copied to clipboard');
    }
  };

  // ── Loading state ──
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Get initials for avatar fallback ──
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* ─── SECTION 1: Profile Overview Header ─── */}
      <SectionWrapper title="Profile Overview" icon={User}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{user.name}</h1>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <VerificationBadge verified={user.isEmailVerified} />
              <TwoFABadge enabled={user.isTwoFactorEnabled} />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── SECTION 2: Edit Profile Form ─── */}
      <SectionWrapper
        title="Edit Profile"
        description="Update your personal information"
        icon={User}
      >
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            {/* Name */}
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={profileForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="New York, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={profileForm.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Camera className="h-4 w-4" /> Avatar URL
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto">
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </SectionWrapper>

      {/* ─── SECTION 3: Change Password ─── */}
      <SectionWrapper
        title="Change Password"
        description="After changing your password, you'll need to log in again"
        icon={Key}
      >
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
            {/* Current Password */}
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Current Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="Enter current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> New Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="Enter new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password */}
            <FormField
              control={passwordForm.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="Confirm new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={changePassword.isPending} variant="outline" className="w-full sm:w-auto">
              {changePassword.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Form>
      </SectionWrapper>

      {/* ─── SECTION 4: Two-Factor Authentication ─── */}
      <SectionWrapper
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={Smartphone}
      >
        <AnimatePresence mode="wait">
          {user.isTwoFactorEnabled ? (
            // ── 2FA ENABLED: Show disable option ──
            <motion.div
              key="2fa-enabled"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">2FA is enabled</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>

              <Form {...disable2FAForm}>
                <form onSubmit={disable2FAForm.handleSubmit(onDisable2FA)} className="space-y-4">
                  <FormField
                    control={disable2FAForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter 6-digit code to disable</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className="text-center text-lg tracking-widest"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={disable2FA.isPending}
                    className="w-full sm:w-auto"
                  >
                    {disable2FA.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : showQrSetup ? (
            // ── 2FA SETUP: Show QR code ──
            <motion.div
              key="2fa-setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* QR Code */}
              {qrData?.qrCodeDataUrl && (
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-card">
                  <QrCode className="h-8 w-8 text-primary" />
                  <img
                    src={qrData.qrCodeDataUrl}
                    alt="2FA QR Code"
                    className="w-48 h-48 rounded-lg border"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
              )}

              {/* Manual secret */}
              {qrData?.secret && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Key className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1 text-sm break-all select-all">{qrData.secret}</code>
                  <Button variant="ghost" size="sm" onClick={copySecret} type="button">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Verify code */}
              <Form {...verify2FAForm}>
                <form onSubmit={verify2FAForm.handleSubmit(onVerify2FA)} className="space-y-4">
                  <FormField
                    control={verify2FAForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter 6-digit verification code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className="text-center text-lg tracking-widest"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={verify2FA.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {verify2FA.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Enable'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowQrSetup(false);
                        setQrData(null);
                        verify2FAForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            // ── 2FA DISABLED: Show enable button ──
            <motion.div
              key="2fa-disabled"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border mb-4">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">2FA is not enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Protect your account by enabling two-factor authentication
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEnable2FA}
                disabled={init2FA.isPending}
                className="w-full sm:w-auto"
              >
                {init2FA.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating QR code...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionWrapper>
    </div>
  );
}