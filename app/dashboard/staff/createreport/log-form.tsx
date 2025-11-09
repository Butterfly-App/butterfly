"use client";
import { useState } from "react";

type LogFormProps = {
  logs: { creator: string; created_at: string; client_id: string }[];
};

export default function LogForm({ logs }: LogFormProps) {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  // Format the log title from creator and created_at
  const formatLogTitle = (log: { creator: string; created_at: string }) => {
    const date = new Date(log.created_at);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${log.creator} - ${formattedDate}`;
  };

  const handleLogSelect = (logTitle: string) => {
    setSelectedLogs(prev => {
      if (prev.includes(logTitle)) {
        return prev.filter(title => title !== logTitle);
      } else {
        return [...prev, logTitle];
      }
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Log List</h2>
      <div className="space-y-2">
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-red-600">No logs found for this client.</p>
        )}

        {logs?.map((log, index) => {
          const title = formatLogTitle(log);
          const uniqueKey = `${log.creator}-${log.created_at}-${index}`;
          
          return (
            <div key={uniqueKey} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={uniqueKey}
                name="log"
                value={title}
                checked={selectedLogs.includes(title)}
                onChange={() => handleLogSelect(title)}
                className="h-4 w-4 text-blue-600"
              />
              <label
                htmlFor={uniqueKey}
                className="text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                {title}
              </label>
            </div>
          );
        })}
      </div>
      {selectedLogs.length > 0 && (
        <p className="mt-4 text-sm">
          Selected logs: {selectedLogs.join(", ")}
        </p>
      )}
    </div>
  );
}