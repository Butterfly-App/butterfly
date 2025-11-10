import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminUsersSection } from "@/components/admin/admin-users-section";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();

  if (role !== "admin") {
    if (role === "staff") redirect("/dashboard/staff");
    if (role === "guardian") redirect("/dashboard/guardian");
    if (role === "user") redirect("/dashboard/user");
    redirect("/login");
  }

  return (

      <div className="space-y-6">
        <AdminNavbar />

        <div className="px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage all users, guardians, staff, and administrators in the system.
            </p>
          </div>

          <AdminUsersSection />
        </div>
      </div>
  );
}
