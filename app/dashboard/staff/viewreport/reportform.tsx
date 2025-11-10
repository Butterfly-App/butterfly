// "use client";
// import { useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// export type reports = { id: string; title: string; document_url: string; client_id: string, content: string };

// type ReportFormProps = {
//     clientReports: reports[]
// };

// export default function ReportForm({ clientReports = [] }: ReportFormProps) {
//     const router = useRouter()
//     const [selectedReport, setSelectedReport] = useState<reports | null>(null);

//     const handleReportSelect = (reportId: string) => {
//         const report = clientReports.find(r => String(r.id) === reportId);
//         setSelectedReport(report || null);
//     }

//     const onDelete = async () => {
//         if (selectedReport) {
//             const isConfirmed = window.confirm("Are you sure you want to delete this report?");
//                 if (!isConfirmed) {
//                     return; // Stop if the user clicks "Cancel"
//                 }
//             const success = await handleDeleteReport(selectedReport.id);
//             if (success){
//                 setSelectedReport(null);
//                 router.refresh();
//             }
//         }
//     };

//     //Delete Report 
//     const handleDeleteReport = async (reportId: string) => {
//         const supabase = await createClient();
//         const { error } = await supabase
//             .from('reports')
//             .delete()
//             .eq('id', reportId);
//         if (error) {
//             console.error("Error deleting report:", error);
//         } else {
//             console.log("Report deleted successfully");
//         }
//         return !error;
//     };

//     // Edit Report
//     const handleEdit = () => {
//         if (selectedReport) {
//             router.push(`/dashboard/staff/editreport/${selectedReport.id}`);
//         }
//     };


//     return (
//         <div>
//             <div className="mb-4">
//                 <label htmlFor="report" className="block mb-2 font-medium text-gray-700">Select Report</label>
//                 <select
//                     id="report"
//                     className="block w-full p-2 border border-gray-300 rounded-md"
//                     onChange={(e) => handleReportSelect(e.target.value)}
//                     value={selectedReport?.id || ""}

//                 >
//                     <option value="">-- Select a Report --</option>
//                     {clientReports.map((report) => (
//                         <option key={report.id} value={report.id}>
//                             {report.title}
//                         </option>
//                     ))}                   
//                 </select>
//             </div>

//             {selectedReport && (
//                 <div className="flex space-x-2 mt-4"> 
//                     <Button onClick={() => window.open(selectedReport.document_url, '_blank')}>
//                         View
//                     </Button>
                    
//                     <Button variant="destructive" onClick={onDelete}>
//                         Delete
//                     </Button>

//                     <Button variant="outline" onClick={handleEdit}>
//                         Edit
//                     </Button>
//                 </div>
//             )}
            
//         </div>
//     )
// }

"use client";
import { useState, useEffect } from "react"; 
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; 

export type reports = { id: string; title: string; document_url: string; client_id: string, content: string };

type ReportFormProps = {
    clientReports: reports[]
};

export default function ReportForm({ clientReports = [] }: ReportFormProps) {
    const router = useRouter()
    const [selectedReport, setSelectedReport] = useState<reports | null>(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedReport) {
            // Find the *new version* of the report from the fresh prop
            const updatedReport = clientReports.find(r => r.id == selectedReport.id);
            if (updatedReport) {
                setSelectedReport(updatedReport);
            } else {
                // Report was deleted or client changed, reset form
                setSelectedReport(null);
                setIsEditing(false);
            }
        }
    }, [clientReports]); // This runs when clientReports prop changes

    const handleReportSelect = (reportId: string) => {
        const report = clientReports.find(r => r.id == reportId);
        setSelectedReport(report || null);
        setIsEditing(false); 
    }

    const onDelete = async () => {
        if (selectedReport) {
            const isConfirmed = window.confirm("Are you sure you want to delete this report?");
                if (!isConfirmed) {
                    return; 
                }
            const success = await handleDeleteReport(selectedReport.id);
            if (success){
                setSelectedReport(null); // Clear selection
                setIsEditing(false); // Close editor
                router.refresh(); // Re-fetch data
            }
        }
    };
 
    const handleDeleteReport = async (reportId: string) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId);
        if (error) {
            console.error("Error deleting report:", error);
            alert("Error deleting report."); 
        } else {
            console.log("Report deleted successfully");
        }
        return !error;
    };

    const handleUpdateReport = async (reportId: string, content: string) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('reports')
            .update({ content: content }) 
            .eq('id', reportId);
        if (error) {
            console.error("Error updating report:", error);
            alert("Failed to update report.");
        } else {
            console.log("Report updated successfully");
        }
        return !error;
    };


    const handleEdit = () => {
        if (selectedReport) {
            
            setIsEditing(true);
            setEditedContent(selectedReport.content || ""); // Load report content into editor
        }
    };

    const handleSaveEdit = async () => {
        if (selectedReport) {
            setIsSaving(true);
            const success = await handleUpdateReport(selectedReport.id, editedContent);
            if (success) {
                setIsEditing(false);
                router.refresh(); 
            }
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent("");
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
                    disabled={isEditing}
                >
                    <option value="">-- Select a Report --</option>
                    {clientReports.map((report) => (
                        <option key={report.id} value={report.id}>
                            {report.title}
                        </option>
                    ))}                   
                </select>
            </div>

            {!isEditing && selectedReport && (
                <div className="flex space-x-2 mt-4"> 
                    <Button onClick={() => window.open(selectedReport?.document_url, '_blank')}>
                        View
                    </Button>
                    
                    <Button variant="destructive" onClick={onDelete}>
                        Delete
                    </Button>

                    <Button variant="outline" onClick={handleEdit}>
                        Edit Content
                    </Button>
                </div>
            )}
            
            {isEditing && selectedReport && (
                <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Editing: {selectedReport.title}</h3>
                    <Textarea 
                        className="min-h-[300px]"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        disabled={isSaving}
                    />
                    <div className="flex space-x-2">
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                        <Button variant="ghost" onClick={handleCancelEdit} disabled={isSaving}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
            
        </div>
    )
}