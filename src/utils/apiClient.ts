import axios from 'axios';

import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

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

/**
 * Resolves the currently active location slug:
 * 1. From Zustand store (selectedLocation?.slug or slugified name fallback)
 * 2. From localStorage ('location-storage')
 * 3. From window.location.search (?locationSlug=)
 */
export const getActiveLocationSlug = (): string | undefined => {
  // 1. From Zustand store
  const storeLocation = useLocationStore.getState().selectedLocation;
  if (storeLocation?.slug) {
    return storeLocation.slug;
  }
  if (storeLocation?.name) {
    return storeLocation.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // 2. From localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('location-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const loc = parsed?.state?.selectedLocation;
        if (loc?.slug) return loc.slug;
        if (loc?.name) {
          return loc.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    } catch {
      // Ignore JSON error
    }
  }

  // 3. Fallback to URL search params
  if (typeof window !== 'undefined' && window.location?.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSlug = urlParams.get('locationSlug');
      if (urlSlug) return urlSlug;
    } catch {
      // Ignore
    }
  }

  return undefined;
};

// Request interceptor to attach bearer token and locationSlug globally
apiClient.interceptors.request.use(
  (config) => {
    // 1. Attach Bearer token if available
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach locationSlug parameter globally to all requests (GET, POST, PUT, PATCH, DELETE)
    const url = config.url || '';
    const cleanPath = url.replace(/^https?:\/\/[^/]+/i, '');

    // Skip auth endpoints
    const isAuthEndpoint =
      cleanPath.includes('/auth/login') ||
      cleanPath.includes('/auth/register') ||
      cleanPath.includes('/auth/refresh') ||
      cleanPath.includes('/auth/logout') ||
      cleanPath.includes('/auth/forgot-password') ||
      cleanPath.includes('/auth/confirm-password-reset') ||
      cleanPath.includes('/auth/reset-password');

    // Listing all locations for the selector / venue manager should not be restricted to one slug
    const isLocationsEndpoint =
      cleanPath === '/locations' ||
      cleanPath === 'locations' ||
      cleanPath.startsWith('/locations?') ||
      cleanPath.startsWith('locations?');

    if (!isAuthEndpoint && !isLocationsEndpoint) {
      // Check if locationSlug is already explicitly passed in url or params
      const hasSlugInUrl = /(?:^|[?&])locationSlug=/i.test(url);
      const hasSlugInParams =
        config.params &&
        (config.params instanceof URLSearchParams
          ? config.params.has('locationSlug')
          : typeof config.params === 'object' && 'locationSlug' in config.params);

      if (!hasSlugInUrl && !hasSlugInParams) {
        // If data payload explicitly defined a locationSlug, prioritize it
        const bodySlug =
          config.data &&
          typeof config.data === 'object' &&
          !(config.data instanceof FormData) &&
          'locationSlug' in config.data &&
          typeof (config.data as Record<string, unknown>).locationSlug === 'string'
            ? ((config.data as Record<string, unknown>).locationSlug as string)
            : undefined;

        const slug = bodySlug || getActiveLocationSlug();

        if (slug) {
          if (config.params instanceof URLSearchParams) {
            config.params.append('locationSlug', slug);
          } else {
            config.params = {
              ...config.params,
              locationSlug: slug,
            };
          }
        }
      }
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
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/forgot-password') ||
        requestUrl.includes('/auth/confirm-password-reset')
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
