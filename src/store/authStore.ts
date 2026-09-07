import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/utils/apiClient';
import { queryClient } from '@/utils/queryClient';
import type { User } from '@/types';

export interface SetAuthOptions {
  accessTokenExpiresIn?: number;
  refreshTokenExpiresAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  accessTokenExpiresIn: number | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken?: string,
    options?: SetAuthOptions
  ) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      accessTokenExpiresIn: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken, options) => {
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          accessTokenExpiresIn: options?.accessTokenExpiresIn ?? null,
          refreshTokenExpiresAt: options?.refreshTokenExpiresAt ?? null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : (updatedUser as User),
        }));
      },

      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          // Best effort call to backend to invalidate session/cookies
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.warn('Backend logout failed or was unreachable:', error);
        } finally {
          // Clear query cache to avoid showing stale cached user data
          queryClient.clear();

          set({
            user: null,
            accessToken: null,
            accessTokenExpiresIn: null,
            refreshToken: null,
            refreshTokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // Note: AuthGuard automatically handles client-side redirection to /auth/login
          // without triggering a secondary hard page reload.
        }
      },

      checkAuth: async () => {
        if (!get().accessToken) {
          set({
            user: null,
            accessToken: null,
            accessTokenExpiresIn: null,
            refreshToken: null,
            refreshTokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });
        try {
          // Validate current session/cookie against backend
          const response = await apiClient.get('/auth/me');
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // If token expired or invalid, clear everything
          set({
            user: null,
            accessToken: null,
            accessTokenExpiresIn: null,
            refreshToken: null,
            refreshTokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'teamup-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        accessTokenExpiresIn: state.accessTokenExpiresIn,
        refreshToken: state.refreshToken,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
