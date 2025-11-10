import { createClient } from "@/lib/supabase/server";
import EditReportForm from "./editreportform";
import { StaffNavbar } from "@/components/staff/staff-navbar";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/roles-server";

export default async function EditReportPage({ params }: { params: { reportId: string } }) {
    const supabase = await createClient();

    // const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //     redirect("/login");
    // }

    // const role = await getUserRole();

    // if (role !== "staff" && role !== "admin") {
    //     // Redirect to appropriate dashboard based on role
    //     if (role === "guardian") redirect("/dashboard/guardian");
    //     if (role === "user") redirect("/dashboard/user");
    //     redirect("/login");
    // }


    const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', parseInt(params.reportId, 10))
        .single();
    if (error) {
        console.error("Error fetching report:", error);
        return <p>Error loading report.</p>;
    }

    const {data: clients, error: clientError} = await supabase
        .from('clients')
        .select("id, first_name, last_name");

    const clientData =
        clients?.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
        })) || [];
    
    if (clientError) {
        console.error("Error fetching clients:", clientError);
        return <p>Error loading clients.</p>;
    }

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
                    <h2 className="text-2xl font-bold tracking-tight">Create Report</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                    Document new progress and activities for your cases.
                    </p>
                </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold">Edit Report</h2>
      
            <EditReportForm 
                report={report} 
                clients={clientData}
            />
        </div>
    );
}