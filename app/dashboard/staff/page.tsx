import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffNavbar } from "@/components/staff/staff-navbar";

export default async function StaffDashboard() {
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 text-zinc-900 dark:from-sky-950 dark:via-sky-900 dark:to-sky-950 dark:text-zinc-100">
      {/* top nav (your component) */}
      <div className="border-b border-sky-200/60 bg-white/70 backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <StaffNavbar />
      </div>

      <div className="px-6 py-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm dark:bg-sky-500">
            <span>🦋</span>
            <span>Staff</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Welcome, Staff Member</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage services and support for users and guardians.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-sky-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Total Users</CardTitle>
              <div className="rounded-lg bg-sky-600/10 px-2 py-1 text-xs text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Active service recipients</p>
            </CardContent>
          </Card>

          <Card className="border-sky-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">My Cases</CardTitle>
              <div className="rounded-lg bg-sky-600/10 px-2 py-1 text-xs text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">📂</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Assigned to you</p>
            </CardContent>
          </Card>

          <Card className="border-sky-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Appointments</CardTitle>
              <div className="rounded-lg bg-sky-600/10 px-2 py-1 text-xs text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">📅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">This week</p>
            </CardContent>
          </Card>

          <Card className="border-sky-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Pending Notes</CardTitle>
              <div className="rounded-lg bg-sky-600/10 px-2 py-1 text-xs text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">📝</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Awaiting completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-sky-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
          <CardHeader>
            <CardTitle className="text-sky-700 dark:text-sky-300">Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
