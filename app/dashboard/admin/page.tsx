import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();
  
  if (role !== "admin") {
    // Redirect to appropriate dashboard based on role
    if (role === "staff") redirect("/dashboard/staff");
    if (role === "guardian") redirect("/dashboard/guardian");
    if (role === "user") redirect("/dashboard/user");
    redirect("/login");
  }

  return (

      <div className="space-y-6">
        <AdminNavbar />

        <div className="px-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome, Administrator</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage users, roles, and system settings.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  All users in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Active staff accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Guardians</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Registered guardians
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  System admins
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Recent system activity and status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                System is operating normally. No issues detected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
