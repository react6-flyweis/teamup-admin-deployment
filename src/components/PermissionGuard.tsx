import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role, PermissionKey } from '@/types';

interface PermissionGuardProps {
  permission?: PermissionKey;
  tabId?: string;
  roles?: Role | Role[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  tabId,
  roles,
  redirectTo,
  fallback,
  children,
}) => {
  const { isSuperAdmin, hasPermission, canAccessTab, hasRole } = usePermissions();

  let isAllowed = true;

  if (!isSuperAdmin) {
    if (roles && !hasRole(roles)) {
      isAllowed = false;
    }
    if (permission && !hasPermission(permission)) {
      isAllowed = false;
    }
    if (tabId && !canAccessTab(tabId)) {
      isAllowed = false;
    }
  }

  if (!isAllowed) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-neutral-400 mb-6 max-w-md">
          You don&apos;t have permission to access this section. Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PermissionGuard;
