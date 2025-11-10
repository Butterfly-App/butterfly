import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { MySchedulePageClient } from "./my-schedule-page-client";

export default async function GuardianSchedulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();

  if (!role) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      userEmail={user.email!}
      userRole={role}
      title="My Schedule"
    >
      <div className="px-6">
        <MySchedulePageClient />
      </div>
    
  );
}
