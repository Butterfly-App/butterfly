import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { StaffNavbar } from "@/components/staff/staff-navbar";
import { StaffUsersSection } from "@/components/staff/staff-users-section";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();

  if (role !== "staff" && role !== "admin") {
    // Redirect to appropriate dashboard based on role
    if (role === "guardian") redirect("/dashboard/guardian");
    if (role === "user") redirect("/dashboard/user");
    redirect("/login");
  }

  return (
      <div className="space-y-6">
        <StaffNavbar />

        <div className="px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage users and guardians in the system.
            </p>
          </div>

          <StaffUsersSection />
        </div>
      </div>
    
  );
}
