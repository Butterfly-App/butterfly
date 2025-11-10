import { getClients } from "@/app/dashboard/clients/actions";
import { ClientList } from "@/components/clients/client-list";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default async function AdminClientsPage() {
  const clients = await getClients();
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
              <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Management</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage all patients and their information
        </p>
      </div>

      <ClientList clients={clients} basePath="/dashboard/admin" />
    </div>
            </div>
          </div>
    
  );
}
