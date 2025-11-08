import { createClient } from "@/lib/supabase/server";
import { UserRole, UserProfile, RoleCheckResult } from "@/lib/types/roles";

/**
 * We should always use these methods when the user sends a request.
 * Server side checks are very important.
 */


/**
 * Get the current user's role from the database
 * Use this in Server Components and Server Actions
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile.role as UserRole;
}

/**
 * Get the current user's full profile
 * Use this in Server Components and Server Actions
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as UserProfile;
}

/**
 * Check if the current user has a specific role
 * Use this in Server Components and Server Actions
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const currentRole = await getUserRole();

  if (!currentRole) {
    return false;
  }

  return currentRole === requiredRole;
}

/**
 * Check if the current user has one of the specified roles
 * Use this in Server Components and Server Actions
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const currentRole = await getUserRole();

  if (!currentRole) {
    return false;
  }

  return requiredRoles.includes(currentRole);
}

/**
 * Check if the current user has at least the specified role level
 * Role hierarchy: user < staff < admin
 * Use this in Server Components and Server Actions
 */
export async function hasMinimumRole(minimumRole: UserRole): Promise<boolean> {
  const currentRole = await getUserRole();

  if (!currentRole) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    staff: 2,
    admin: 3,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[minimumRole];
}

/**
 * Require a specific role, throw error if not authorized
 * Use this in Server Components and Server Actions
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
  const hasRequiredRole = await hasRole(requiredRole);

  if (!hasRequiredRole) {
    throw new Error(`Unauthorized: ${requiredRole} role required`);
  }
}

/**
 * Require one of the specified roles, throw error if not authorized
 * Use this in Server Components and Server Actions
 */
export async function requireAnyRole(requiredRoles: UserRole[]): Promise<void> {
  const hasRequiredRole = await hasAnyRole(requiredRoles);

  if (!hasRequiredRole) {
    throw new Error(`Unauthorized: one of [${requiredRoles.join(', ')}] roles required`);
  }
}

/**
 * Require at least the specified role level, throw error if not authorized
 * Use this in Server Components and Server Actions
 */
export async function requireMinimumRole(minimumRole: UserRole): Promise<void> {
  const hasRequiredRole = await hasMinimumRole(minimumRole);

  if (!hasRequiredRole) {
    throw new Error(`Unauthorized: minimum ${minimumRole} role required`);
  }
}

/**
 * Check if user is authenticated and has a role
 * Use this in Server Components and Server Actions
 */
export async function isAuthenticated(): Promise<boolean> {
  const role = await getUserRole();
  return role !== null;
}
