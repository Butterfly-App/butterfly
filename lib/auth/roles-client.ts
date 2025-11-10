import { createClient } from "@/lib/supabase/client";
import { UserRole, UserProfile } from "@/lib/types/roles";

/**
 * Use for event handlers, form submits, and one-time async role checks.
 * Dont use in component render.
 *
 * Provides promise-based role checking without state management.
 * Use for onClick handlers, useEffect, async functions, manual checks
 * Dont use in component body rendering.
 *
 */

/**
 * Get the current user's role from the database
 * Use this in Client Components
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createClient();

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
 * Use this in Client Components
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();

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
 * Use this in Client Components
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
 * Use this in Client Components
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
 * Role hierarchy: guardian < staff < admin
 * Use this in Client Components
 */
export async function hasMinimumRole(minimumRole: UserRole): Promise<boolean> {
  const currentRole = await getUserRole();

  if (!currentRole) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    guardian: 1,
    staff: 2,
    admin: 3,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[minimumRole];
}
