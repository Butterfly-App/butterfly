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
    
          <div className="space-y-6">
            <StaffNavbar />
    
            <div className="px-6">
              <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Management</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage patients and their information
        </p>
      </div>

      <ClientList clients={clients} basePath="/dashboard/staff" />
    </div>
            </div>
          </div>
  );
}
