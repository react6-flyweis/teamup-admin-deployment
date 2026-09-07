import { ROLES, type Role, type User, type PermissionKey } from '@/types';

/**
 * Mapping between frontend navigation IDs / route segments and backend permission/tab keys.
 */
const TAB_TO_PERMISSION_MAP: Record<string, string> = {
  'food-drinks': 'bites_drinks',
  'bites-drinks': 'bites_drinks',
  'staff-roles': 'users',
  'customers': 'users',
};

/**
 * Normalizes tab / permission keys from kebab-case or alternate names to canonical snake_case.
 */
export const normalizeTabKey = (key: string): string => {
  const clean = key.trim().toLowerCase();
  if (TAB_TO_PERMISSION_MAP[clean]) {
    return TAB_TO_PERMISSION_MAP[clean];
  }
  return clean.replace(/-/g, '_');
};

/**
 * Checks if the user is a super admin.
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  return user?.role === ROLES.SUPER_ADMIN;
};

/**
 * Checks if the user is an admin or super admin.
 */
export const isAdmin = (user: User | null | undefined): boolean => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
};

/**
 * Checks if the user is a manager.
 */
export const isManager = (user: User | null | undefined): boolean => {
  return user?.role === ROLES.MANAGER;
};

/**
 * Checks if the user has one of the specified roles.
 */
export const hasRole = (
  user: User | null | undefined,
  roles: Role | Role[]
): boolean => {
  if (!user?.role) return false;
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  return user.role === roles;
};

/**
 * Checks if the user has a specific permission key.
 */
export const hasPermission = (
  user: User | null | undefined,
  permission: PermissionKey
): boolean => {
  if (!user) return false;

  // Super admins bypass all permission checks
  if (isSuperAdmin(user)) return true;

  const normalized = normalizeTabKey(permission);
  const raw = permission.trim().toLowerCase();

  // Check explicit permissions dictionary
  if (user.permissions) {
    if (user.permissions[normalized] === true || user.permissions[raw] === true) {
      return true;
    }
  }

  // Check accessibleTabs as a fallback
  if (Array.isArray(user.accessibleTabs)) {
    if (user.accessibleTabs.includes(normalized) || user.accessibleTabs.includes(raw)) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if the user can access a specific tab (matches either accessibleTabs or permissions).
 */
export const canAccessTab = (
  user: User | null | undefined,
  tabId: string
): boolean => {
  if (!user) return false;

  // Super admins have access to all tabs
  if (isSuperAdmin(user)) return true;

  const normalized = normalizeTabKey(tabId);
  const raw = tabId.trim().toLowerCase();

  // 1. Check accessibleTabs list
  if (Array.isArray(user.accessibleTabs)) {
    const hasInTabs = user.accessibleTabs.some((tab) => {
      const normTab = normalizeTabKey(tab);
      return normTab === normalized || normTab === raw || tab.toLowerCase() === raw;
    });
    if (hasInTabs) return true;
  }

  // 2. Check permissions dictionary
  if (user.permissions) {
    if (user.permissions[normalized] === true || user.permissions[raw] === true) {
      return true;
    }
  }

  return false;
};
