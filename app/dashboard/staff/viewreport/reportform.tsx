"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type reports = { id: string; title: string; document_url: string; client_id: string };

type ReportFormProps = {
    clientReports: reports[]
};

export default function ReportForm({ clientReports = [] }: ReportFormProps) {
    const router = useRouter()
    const [selectedReport, setSelectedReport] = useState<reports | null>(null);

    const handleReportSelect = (reportId: string) => {
        console.log("CLICKED REPORT ID:", reportId);
        const report = clientReports.find(r => String(r.id) === reportId);
        console.log("FOUND REPORT OBJECT:", report);
        setSelectedReport(report || null);
    }

    const onDelete = async () => {
        if (selectedReport) {
            const isConfirmed = window.confirm("Are you sure you want to delete this report?");
                if (!isConfirmed) {
                    return; // Stop if the user clicks "Cancel"
                }
            const success = await handleDeleteReport(selectedReport.id);
            if (success){
                setSelectedReport(null);
                router.refresh();
            }
        }
    };

    //Delete Report 
    const handleDeleteReport = async (reportId: string) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId);
        if (error) {
            console.error("Error deleting report:", error);
        } else {
            console.log("Report deleted successfully");
        }
        return !error;
    };

    // Edit Report
    const handleEdit = () => {
        if (selectedReport) {
            router.push(`/dashboard/staff/editreport/${selectedReport.id}`);
        }
    };


    return (
        <div>
            <div className="mb-4">
                <label htmlFor="report" className="block mb-2 font-medium text-gray-700">Select Report</label>
                <select
                    id="report"
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => handleReportSelect(e.target.value)}
                    value={selectedReport?.id || ""}

                >
                    <option value="">-- Select a Report --</option>
                    {clientReports.map((report) => (
                        <option key={report.id} value={report.id}>
                            {report.title}
                        </option>
                    ))}                   
                </select>
            </div>

            {selectedReport && (
                <div className="flex space-x-2 mt-4"> 
                    <Button onClick={() => window.open(selectedReport?.document_url, '_blank')}>
                    View
                    </Button>
                    
                    <Button variant="destructive" onClick={onDelete}>
                    Delete
                    </Button>

                    <Button variant="outline" onClick={handleEdit}>
                        Edit
                    </Button>
                </div>
            )}
            
        </div>
    )

}



