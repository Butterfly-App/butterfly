import { ClientList } from "@/components/clients/client-list";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { StaffNavbar } from "@/components/staff/staff-navbar";
import { getClients } from "../../clients/actions";

export default async function StaffClientsPage() {
  const supabase = await createClient();
  const clients = await getClients();
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 text-zinc-900 dark:from-sky-950 dark:via-sky-900 dark:to-sky-950 dark:text-zinc-100">
      {/* Top nav wrapper for translucency/border like other pages */}
      <div className="border-b border-sky-200/60 bg-white/70 backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <StaffNavbar />
      </div>

      <div className="px-6 py-8">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm dark:bg-sky-500">
              <span>🦋</span>
              <span>Clients</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Manage patients and their information
            </p>
          </div>

          {/* Content surface that matches dashboard cards */}
          <section className="rounded-2xl border border-sky-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40 sm:p-6">
            <ClientList clients={clients} basePath="/dashboard/staff" />
          </section>
        </div>
      </div>
    </div>
  );
}
