import { http } from '@/api/http-client';
import type { AuthResponse, User } from '@/types/user';

export class AuthService {
  login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    return http<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, expiresInMins: 30 }),
      skipAuth: true,
    });
  }

  getMe(): Promise<User> {
    return http<User>('/auth/me');
  }
}