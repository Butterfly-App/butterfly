'use client';

import { useEffect, useState } from 'react';
import { fetchRevisions } from '@/app/dashboard/staff/logs/actions';

type Revision = {
  version: number;
  editor_id: string;
  name?: string;
  content: string;
  edited_at: string;
};

export function ViewHistory({ logId }: { logId: string }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const data = await fetchRevisions(logId);
      setRevisions(data as Revision[]);
    })();
  }, [open, logId]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        View History
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Revision History</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 max-h-[70vh] space-y-3 overflow-auto pr-1">
              {revisions
                ? revisions.map((r) => (
                    <div
                      key={r.version}
                      className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">v{r.version}</span>
                        <span className="mx-2">·</span>
                        <span>Editor: {r.name ?? r.editor_id}</span>
                        <span className="mx-2">·</span>
                        <span>{new Date(r.edited_at).toLocaleString()}</span>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
                        {r.content}
                      </pre>
                    </div>
                  ))
                : <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
