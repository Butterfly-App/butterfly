import { Button } from "@/components/ui/button";
import { useState } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StaffNavbar } from "@/components/staff/staff-navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClientSection from "./client-form";


export default async function CreateLog(){
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const [log, setLog] = useState<Log>();

    // checking roles and dashboard set up
    if (!user) {
        redirect("/login");
    }

    const role = await getUserRole();

    if (role !== "staff" && role !== "admin") {
        // Redirect to appropriate dashboard based on role
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
    
    return (
        <DashboardLayout
        userEmail={user.email!}
        userRole={role!}
        title="Create Log"
        >
            <div className="space-y-6">
                {/* staff navigation bar to always display at top*/}
                <StaffNavbar />

                {/* back arrow to go back to logs and page title */}
                <div className="px-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <Link href="/dashboard/staff/Logs">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Logs
                            </Button>
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Log</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Document Log
                        </p>
                        </div>
                    </div>
                </div>

                {/* choosing the client to make the log for */}
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
                        <ClientSection 
                        clients={safeClients} 
                        userName={user.id}
                        />
                    </CardContent>
                </Card>         
            </div>
    </DashboardLayout>




        /*
        */
    );
}