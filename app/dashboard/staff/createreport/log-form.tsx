"use client";
import { useState } from "react";

type LogFormProps = {
  logtitles: { title: string }[];
};

export default function LogForm({ logtitles }: LogFormProps) {
  const [selectedLog, setSelectedLog] = useState("");

  const handleLogSelect = (logTitle: string) => {
    setSelectedLog(logTitle);
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold mb-4">Log List</h2>
      <form className="space-y-2">
        
        {(!logtitles || logtitles.length === 0) && (
          <p className="text-sm text-red-600">No logs found.</p>
        )}

        {logtitles?.map((log) => (
          <div key={log.title} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={log.title}
              name="log"
              value={log.title}
              checked={selectedLog === log.title}
              onChange={() => handleLogSelect(log.title)}
              className="h-4 w-4 text-blue-600"
            />
            <label
              htmlFor={log.title}
              className="text-zinc-600 dark:text-zinc-400"
            >
              {log.title}
            </label>
          </div>
        ))}
      </form>
      {selectedLog && <p className="mt-4">Selected logs: {selectedLog}</p>}
    </div>
  );
}