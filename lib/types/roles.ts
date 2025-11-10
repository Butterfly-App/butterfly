export type UserRole = 'guardian' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface RoleCheckResult {
  hasRole: boolean;
  currentRole: UserRole | null;
}
