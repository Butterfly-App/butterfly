import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StaffNavbar } from "@/components/staff/staff-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientSection from "./log-section";

export default async function CreateReportPage() {
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
    .select('creator, created_at, client_id');

  if (logsError) {
    console.error('Error fetching logs:', logsError);
  }

  const safeClients = clients || [];
  const safeAllLogs = allLogs || [];

  return (
    <DashboardLayout
      userEmail={user.email!}
      userRole={role!}
      title="Create Report"
    >
      <div className="space-y-6">
        <StaffNavbar />

        <div className="px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/dashboard/staff/reports">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Reports
                  </Button>
                </Link>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Create Report</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Document new progress and activities for your cases.
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
            <CardDescription>Choose a client to create a report for</CardDescription>
          </CardHeader>
          <CardContent>
            {clientError && (
              <p className="text-red-600 mb-4">Error loading clients. Please try again.</p>
            )}
            {safeClients.length === 0 && !clientError && (
              <p className="text-zinc-600 mb-4">No clients found.</p>
            )}
            <ClientSection clients={safeClients} allLogs={safeAllLogs} />
          </CardContent>
        </Card>         
      </div>


    </DashboardLayout>
  );
}