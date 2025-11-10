
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { StaffNavbar } from "@/components/staff/staff-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, FilePlus } from "lucide-react";

/*useEffect(() => {
  const getLogsOfClient = (id: string)


}, [])*/

export default async function ListLogs(){
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

  
    // Get list of all clients with id and name
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, name');

    if (clientError) {
        console.error('Error fetching clients:', clientError);
    }
        
    // Get list of all logs with creator, created_at, and client_id
    const { data: allLogs, error: logsError } = await supabase
        .from('logs')
        .select('*');

    if (logsError) {
        console.error('Error fetching logs:', logsError);
    }
        
    const safeClients = clients || [];
    const safeAllLogs = allLogs || [];
    

    return (
        <DashboardLayout
              userEmail={user.email!}
              userRole={role}
              title={"Logs"}
        >
            <div className="space-y-6">
                <StaffNavbar />

                <div className="px-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                        Create and view service reports for your cases.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Link href="/dashboard/staff/viewlogs">
                        <Card className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                <CardTitle>View/Edit Logs</CardTitle>
                                <CardDescription>Browse and review existing logs</CardDescription>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Access all logs.
                            </p>
                            </CardContent>
                        </Card>
                        </Link>

                        <Link href="/dashboard/staff/createlog">
                            <Card className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <FilePlus className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                    <CardTitle>Create Log</CardTitle>
                                    <CardDescription>Document</CardDescription>
                                    </div>
                                </div>
                                </CardHeader>
                                <CardContent>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Create new log.
                                </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

}






