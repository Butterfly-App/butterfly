'use client';

import { ReactNode } from 'react';
import { useHasRole, useHasAnyRole, useHasMinimumRole } from '@/hooks/use-role';
import { UserRole } from '@/lib/types/roles';

interface RoleGateProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  minimumRole?: UserRole;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * We may need different type of role checks. 
 * Component to conditionally render children based on user role
 *
 * Usage examples:
 * <RoleGate requiredRole="admin">Admin only content</RoleGate>
 * <RoleGate requiredRoles={['staff', 'admin']}>Staff and Admin content</RoleGate>
 * <RoleGate minimumRole="staff">Staff level and above</RoleGate>
 * <RoleGate requiredRole="admin" fallback={<div>Not authorized</div>}>Admin content</RoleGate>
 */
export function RoleGate({
  children,
  requiredRole,
  requiredRoles,
  minimumRole,
  fallback = null,
  loading: loadingComponent = null,
}: RoleGateProps) {
  // Determine which hook to use based on props
  const singleRoleCheck = useHasRole(requiredRole!);
  const multiRoleCheck = useHasAnyRole(requiredRoles || []);
  const minimumRoleCheck = useHasMinimumRole(minimumRole!);

  // Select the appropriate check based on which prop was provided
  let hasRole = false;
  let loading = false;

  if (requiredRole) {
    hasRole = singleRoleCheck.hasRole;
    loading = singleRoleCheck.loading;
  } else if (requiredRoles && requiredRoles.length > 0) {
    hasRole = multiRoleCheck.hasRole;
    loading = multiRoleCheck.loading;
  } else if (minimumRole) {
    hasRole = minimumRoleCheck.hasRole;
    loading = minimumRoleCheck.loading;
  }

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
