'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, UserProfile } from '@/lib/types/roles';

/**
 * Use hooks for component rendering, conditional UI, and real-time role updates.
 * Dont use hooks in event handlers or async functions - use @/lib/auth/roles-client instead.
 *
 * Provides React hooks with state management and automatic updates when auth state changes.
 * Use for: Component body, conditional rendering, loading states
 * Avoid: Event handlers, form submits (use roles-client.ts instead)
 *
 * What we should never forget is client-side checks are for UI only.
 * Always verify on server-side for security.
 */


/**
 * We will use this hook to get the role of user.
 * When an admin changes the role of a user, it should automatically
 * reflect to the user always. this hook also provides it.
 */
export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setRole(profile?.role as UserRole || null);
      setLoading(false);
    }

    fetchRole();

    // Subscribe to realtime changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setRole(null);
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          setRole(profile?.role as UserRole || null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
}

/**
 * Almost in every page or components, we need the profile details of 
 * logged in user. Instead of writing fetching codes in everywhere, we
 * will use this hook to get profile details of the logged in user.
 * And this hook also automatically updates when the profile changes.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData as UserProfile || null);
      setLoading(false);
    }

    fetchProfile();

    // Subscribe to profile changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          setProfile(profileData as UserProfile || null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}

// and these are the common methods when we build authorization classes.

/**
 * Hook to check if the current user has a specific role. 
 * Like edit or something else in a page.
 */
export function useHasRole(requiredRole: UserRole) {
  const { role, loading } = useRole();

  return {
    hasRole: role === requiredRole,
    loading,
  };
}

/**
 * Hook to check if the current user has one of the specified roles
 */
export function useHasAnyRole(requiredRoles: UserRole[]) {
  const { role, loading } = useRole();

  return {
    hasRole: role ? requiredRoles.includes(role) : false,
    loading,
  };
}

/**
 * Hook to check if the current user has at least the specified role level
 * Role hierarchy: user < staff < admin
 */
export function useHasMinimumRole(minimumRole: UserRole) {
  const { role, loading } = useRole();

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    staff: 2,
    admin: 3,
  };

  const hasMinimum = role
    ? roleHierarchy[role] >= roleHierarchy[minimumRole]
    : false;

  return {
    hasRole: hasMinimum,
    loading,
  };
}
