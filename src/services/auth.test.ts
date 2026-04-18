import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './auth';
import type { AuthResponse } from '@/types/auth';

describe('authService localStorage hardening', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears tokens when stored user JSON is invalid', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');
    localStorage.setItem('user', '{invalid json');

    const user = authService.getUser();

    expect(user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('considers authenticated only when token and user exist', () => {
    localStorage.setItem('accessToken', 'token-only');
    expect(authService.isAuthenticated()).toBe(false);

    const payload: AuthResponse = {
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: new Date().toISOString(),
      user: {
        id: 'u1',
        email: 'test@example.com',
        fullName: 'Test User'
      }
    };

    authService.saveTokens(payload);
    expect(authService.isAuthenticated()).toBe(true);
  });
});
