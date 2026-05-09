export type UserRole = "client" | "freelancer" | "admin";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  isActive: boolean;
  isSuspended: boolean;
}

export interface LoginSuccessData {
  user: AuthUser;
  accessToken: string;
}

export interface TwoFARequiredData {
  requires2FA: true;
  twoFactorToken: string;
}

export type LoginResponseData = LoginSuccessData | TwoFARequiredData;

export interface TwoFASetupData {
  qrCodeDataUrl: string;
  secret: string;
  otpauthUrl: string;
}