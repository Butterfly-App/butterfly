import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { StaffNavbar } from "@/components/staff/staff-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ViewReportSection from "./viewreportsection";


export default async function ViewReportPage() {
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

  // Get list of all clients with their id and name
  const { data: clients, error: clientError } = await supabase
    .from("clients")
    .select("id, first_name, last_name");

  if (clientError) {
    console.error("Error fetching clients:", clientError);
  }

  const clientData =
    clients?.map((c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
    })) || [];

  // Get list of all reports
  const { data: allReports, error } = await supabase
    .from('reports')
    .select('id, client_id, title, document_url');

  if (error) {
    console.error('Error fetching reports:', error);
  }

  const allReportData =
  allReports?.map((r) => ({
    id: r.id,
    client_id: r.client_id,
    title: r.title,
    document_url: r.document_url,
  })) || [];

  return (

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
              <h2 className="text-2xl font-bold tracking-tight">View Reports</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Browse and review existing progress reports and case documentation.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reports List</CardTitle>
              <CardDescription>Select a report to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <ViewReportSection clientData={clientData} allReportData={allReportData} />
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}