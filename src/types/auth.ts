export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES] | string;

export interface UserPermissions {
  manage_home?: boolean;
  manage_header?: boolean;
  manage_footer?: boolean;
  game_venue?: boolean;
  bites_drinks?: boolean;
  social_reviews?: boolean;
  venues?: boolean;
  enquiries?: boolean;
  users?: boolean;
  bookings?: boolean;
  [key: string]: boolean | undefined;
}

export type PermissionKey =
  | 'manage_home'
  | 'manage_header'
  | 'manage_footer'
  | 'game_venue'
  | 'bites_drinks'
  | 'social_reviews'
  | 'venues'
  | 'enquiries'
  | 'users'
  | 'bookings'
  | (string & {});

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: Role;
  permissions?: UserPermissions;
  accessibleTabs?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  newsletterSubscribed?: boolean;
  profilePicture?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  accessTokenExpiresIn?: number;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export type AuthResponse = LoginResponse;

export interface RbacPermissionsResponse {
  roles: Role[];
  tabs: string[];
  permissions: Record<string, UserPermissions>;
}

export interface UpdateRolePermissionsPayload {
  permissions: Record<string, boolean>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface AdminUsersQueryParams {
  isActive?: boolean;
  search?: string;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role | string;
  isActive?: boolean;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: Role | string;
  isActive?: boolean;
}

export interface UserProfileResponse {
  user: User;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  profilePicture?: string;
}


