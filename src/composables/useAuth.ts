import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth';
import type { RegisterRequest, LoginRequest, AcceptInvitationRequest, User } from '@/types/auth';
import { getApiErrorMessage } from '@/shared/utils/apiError';

const user = ref<User | null>(authService.getUser());
// Must read `user` so this recomputes after login/logout; `authService.isAuthenticated()`
// alone only touches localStorage, which Vue does not track.
const isAuthenticated = computed(() => !!user.value && authService.isAuthenticated());

export function useAuth() {
  const router = useRouter();

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      authService.saveTokens(response);
      user.value = response.user;
      router.push('/');
      return { success: true };
    } catch (err: unknown) {
      return { 
        success: false, 
        error: getApiErrorMessage(err, 'Registration failed')
      };
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      authService.saveTokens(response);
      user.value = response.user;
      router.push('/');
      return { success: true };
    } catch (err: unknown) {
      return { 
        success: false, 
        error: getApiErrorMessage(err, 'Login failed')
      };
    }
  };

  const acceptInvitation = async (data: AcceptInvitationRequest) => {
    try {
      const response = await authService.acceptInvitation(data);
      authService.saveTokens(response);
      user.value = response.user;
      router.push('/');
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: getApiErrorMessage(err, 'Failed to accept invitation')
      };
    }
  };

  const logout = () => {
    authService.clearTokens();
    user.value = null;
    router.push('/login');
  };

  const refreshToken = async () => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await authService.refreshToken({ refreshToken });
      authService.saveTokens(response);
      user.value = response.user;
      return true;
    } catch {
      logout();
      return false;
    }
  };

  return {
    user: computed(() => user.value),
    isAuthenticated,
    register,
    login,
    acceptInvitation,
    logout,
    refreshToken
  };
}
