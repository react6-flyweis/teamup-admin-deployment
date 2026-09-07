import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/utils/apiClient';
import type { LoginResponse } from '@/types';
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation<LoginResponse, Error, LoginSchema>({
    mutationFn: async (data: LoginSchema): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken, {
        accessTokenExpiresIn: data.accessTokenExpiresIn,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      });
      navigate('/');
    },
  });
};

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  newsletterSubscribed: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation<LoginResponse, Error, Omit<RegisterSchema, 'confirmPassword'>>({
    mutationFn: async (data: Omit<RegisterSchema, 'confirmPassword'>): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken, {
        accessTokenExpiresIn: data.accessTokenExpiresIn,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      });
      navigate('/');
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post('/auth/forgot-password', data);
      return response.data;
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { password: string; token?: string }) => {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    },
  });
};
