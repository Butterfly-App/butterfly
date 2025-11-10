import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { StaffNavbar } from "@/components/staff/staff-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();

  if (role !== "staff" && role !== "admin") {
    if (role === "guardian") redirect("/dashboard/guardian");
    if (role === "user") redirect("/dashboard/user");
    redirect("/login");
  }

  return (
      <div className="space-y-6">
        <StaffNavbar />

        <div className="px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">My Cases</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              View and manage your assigned user cases.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
              <CardDescription>Cases assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No cases to display. This feature will be implemented soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}
