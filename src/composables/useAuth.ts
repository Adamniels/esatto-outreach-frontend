import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';
import type { RegisterRequest, LoginRequest, User } from '../types/auth';

const user = ref<User | null>(authService.getUser());
const isAuthenticated = computed(() => !!user.value);

export function useAuth() {
  const router = useRouter();

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      authService.saveTokens(response);
      user.value = response.user;
      router.push('/');
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
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
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
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
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user: computed(() => user.value),
    isAuthenticated,
    register,
    login,
    logout,
    refreshToken
  };
}
