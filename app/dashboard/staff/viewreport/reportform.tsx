"use client";
import { useState } from "react";

type ReportFormProps = {
    clientReports: { id: string; title: string; document_url: string }[]
};

export default function ReportForm({ clientReports = [] }: ReportFormProps) {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [selectedReportUrl, setSelectedReportUrl] = useState<string | null>(null);
    const [selectedReportTitle, setSelectedReportTitle] = useState<string | null>(null);

    const handleReportSelect = (reportId: string) => {
        setSelectedReportId(reportId);
        const report = clientReports.find(r => r.id === reportId);
        setSelectedReportUrl(report ? report.document_url : null);
        setSelectedReportTitle(report ? report.title : null);
    }


    return (
        <div>
            <div className="mb-4">
                <label htmlFor="report" className="block mb-2 font-medium text-gray-700">Select Report</label>
                <select
                    id="report"
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => handleReportSelect(e.target.value)}
                />
                <option value="">-- Select a Report --</option>
                {clientReports.map((report) => (
                    <option key={report.id} value={report.id}>
                        {report.title}
                    </option>
                ))}
            </div>
        </div>
    )

}