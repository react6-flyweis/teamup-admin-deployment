import axios from 'axios';

import { useAuthStore } from '@/store/authStore';

// Get API URL from env, default to local if not set
const API_URL = import.meta.env.VITE_API_URL || '';
console.log(API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for receiving/sending HttpOnly cookies (session/CSRF)
});

// Request interceptor to attach bearer token if we store it in memory/state
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle session expiration or global errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if unauthorized, meaning session expired/invalid
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Do not attempt token refresh or recursive logout on auth endpoints
      const requestUrl = originalRequest.url || '';
      if (
        requestUrl.includes('/auth/logout') ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const cleanUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const response = await axios.post(
          `${cleanUrl}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          user,
          accessTokenExpiresIn,
          refreshTokenExpiresAt,
        } = response.data;
        useAuthStore.getState().setAuth(user, accessToken, newRefreshToken, {
          accessTokenExpiresIn,
          refreshTokenExpiresAt,
        });

        processQueue(null, accessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        const err = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
