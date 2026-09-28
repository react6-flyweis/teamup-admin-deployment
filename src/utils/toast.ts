import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  error: (message: string, title?: string, duration = 6000) => {
    return useToastStore.getState().addToast({ type: 'error', message, title, duration });
  },
  success: (message: string, title?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'success', message, title, duration });
  },
  warning: (message: string, title?: string, duration = 5000) => {
    return useToastStore.getState().addToast({ type: 'warning', message, title, duration });
  },
  info: (message: string, title?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'info', message, title, duration });
  },
  remove: (id: string) => {
    useToastStore.getState().removeToast(id);
  },
  clear: () => {
    useToastStore.getState().clearToasts();
  },
};

/**
 * Robust utility to extract descriptive error messages from API calls (Axios, Fetch, or standard errors)
 */
export function getApiErrorMessage(err: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (!err) return fallbackMessage;
  if (typeof err === 'string' && err.trim()) return err;

  if (typeof err === 'object' && err !== null) {
    const errObj = err as Record<string, unknown>;
    const response = errObj.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | string | undefined;

    if (data) {
      if (typeof data === 'string' && data.trim()) {
        return data;
      }
      if (typeof data === 'object' && data !== null) {
        if (typeof data.message === 'string' && data.message.trim()) {
          return data.message;
        }
        if (Array.isArray(data.message) && data.message.length > 0) {
          return data.message
            .map((m: unknown) => (typeof m === 'string' ? m : JSON.stringify(m)))
            .join(', ');
        }
        if (typeof data.error === 'string' && data.error.trim()) {
          return data.error;
        }
        if (Array.isArray(data.error) && data.error.length > 0) {
          return data.error
            .map((e: unknown) => (typeof e === 'string' ? e : JSON.stringify(e)))
            .join(', ');
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          return data.errors
            .map((e: unknown) => {
              if (typeof e === 'string') return e;
              if (typeof e === 'object' && e !== null) {
                const sub = e as Record<string, unknown>;
                return (sub.message as string) || (sub.msg as string) || JSON.stringify(sub);
              }
              return String(e);
            })
            .filter(Boolean)
            .join(', ');
        }
        if (data.errors && typeof data.errors === 'object') {
          const values = Object.values(data.errors).flat();
          if (values.length > 0) {
            return values
              .map((v: unknown) => {
                if (typeof v === 'string') return v;
                if (typeof v === 'object' && v !== null) {
                  return (v as Record<string, unknown>).message || JSON.stringify(v);
                }
                return String(v);
              })
              .filter(Boolean)
              .join(', ');
          }
        }
      }
    }

    const status = response?.status as number | undefined;
    if (status) {
      if (status === 401) return 'Session expired. Please log in again.';
      if (status === 403) return 'You do not have permission to perform this action.';
      if (status === 404) return 'The requested resource was not found.';
      if (status === 409) return 'Conflict occurred: The item may already exist or is currently in use.';
      if (status === 500) return 'Internal server error. Please try again later.';
    }

    if (errObj.message === 'Network Error') {
      return 'Network Error. Please check your internet connection.';
    }

    if (typeof errObj.message === 'string' && errObj.message.trim()) {
      return errObj.message;
    }
  }

  return fallbackMessage;
}
