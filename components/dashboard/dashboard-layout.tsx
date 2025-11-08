import { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/signout-button";
import { UserRole } from "@/lib/types/roles";

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail: string;
  userRole: UserRole;
  title: string;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Staff Member",
  guardian: "Guardian",
  user: "User",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  guardian: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function DashboardLayout({
  children,
  userEmail,
  userRole,
  title,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[userRole]}`}
              >
                {roleLabels[userRole]}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {userEmail}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
