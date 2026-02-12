export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  vatNumber?: string;
  preferredLanguage?: 'FR' | 'EN';
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    path?: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  vatNumber?: string;
  preferredLanguage: 'FR' | 'EN';
  isVerified: boolean;
  createdAt: string;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  vatNumber?: string;
}

export interface ProfileUpdateResponse {
  message: string;
  user: UserResponse;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface UpdateLanguageRequest {
  preferredLanguage: 'FR' | 'EN';
}

export interface UpdateLanguageResponse {
  message: string;
  user: UserResponse;
}
