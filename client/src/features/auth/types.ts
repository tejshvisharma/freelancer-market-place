export interface RegisterPayload {
    username: string;
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: {
        url: string;
        localPath?: string;
    };
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
