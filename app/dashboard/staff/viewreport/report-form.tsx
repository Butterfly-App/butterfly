"use client";
import { useState } from "react";

type ReportFormProps = {
  reporttitles: { title: string }[];
};

export default function ReportForm({ reporttitles }: ReportFormProps) {
  const [selectedReport, setSelectedReport] = useState("");

  const handleReportSelect = (reportTitle: string) => {
    setSelectedReport(reportTitle);
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold mb-4">Report List</h2>
      <form className="space-y-2">
        
        {(!reporttitles || reporttitles.length === 0) && (
          <p className="text-sm text-red-600">No reports found.</p>
        )}

        {reporttitles?.map((report) => (
          <div key={report.title} className="flex items-center space-x-2">
            <input
              type="radio"
              id={report.title}
              name="report"
              value={report.title}
              checked={selectedReport === report.title}
              onChange={() => handleReportSelect(report.title)}
              className="h-4 w-4 text-blue-600"
            />
            <label
              htmlFor={report.title}
              className="text-zinc-600 dark:text-zinc-400"
            >
              {report.title}
            </label>
          </div>
        ))}
      </form>
      {/*selectedReport && (<p className="mt-4">Selected report: {selectedReport}</p>)*/}
      {selectedReport && <p className="mt-4">Selected report: {selectedReport}</p>}
    </div>
  );
}