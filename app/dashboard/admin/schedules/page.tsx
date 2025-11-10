import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { SchedulesPageClient } from "./schedules-page-client";

export default async function AdminSchedulesPage() {
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
          <SchedulesPageClient />
        </div>
      </div>
    
  );
}
