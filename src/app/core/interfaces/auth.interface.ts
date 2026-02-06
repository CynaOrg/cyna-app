export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: 'FR' | 'EN';
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
  preferredLanguage: 'FR' | 'EN';
  isVerified: boolean;
  createdAt: string;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}
