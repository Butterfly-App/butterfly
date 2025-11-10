import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

import { StaffNavbar } from "@/components/staff/staff-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReportForm from "./report-form";

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

  // Get list of all reports
  const { data: reporttitles, error } = await supabase
    .from('reports')
    .select('title');

    console.log(reporttitles)

  if (error) {
    console.error('Error fetching reports:', error);
  }

  return (
    <DashboardLayout
      userEmail={user.email!}
      userRole={role!}
      title="View Reports"
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
              <ReportForm reporttitles={reporttitles || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}