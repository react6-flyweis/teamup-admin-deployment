import { useAuthStore } from '@/store/authStore';
import {
  isSuperAdmin as checkSuperAdmin,
  isAdmin as checkAdmin,
  isManager as checkManager,
  hasRole as checkHasRole,
  hasPermission as checkHasPermission,
  canAccessTab as checkCanAccessTab,
} from '@/utils/permissions';
import type { Role, PermissionKey } from '@/types';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    role: user?.role,
    permissions: user?.permissions,
    accessibleTabs: user?.accessibleTabs || [],
    isSuperAdmin: checkSuperAdmin(user),
    isAdmin: checkAdmin(user),
    isManager: checkManager(user),
    hasRole: (roles: Role | Role[]) => checkHasRole(user, roles),
    hasPermission: (permission: PermissionKey) => checkHasPermission(user, permission),
    canAccessTab: (tabId: string) => checkCanAccessTab(user, tabId),
  };
};

export default usePermissions;
