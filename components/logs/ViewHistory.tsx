'use client';

import { useEffect, useState } from 'react';
import { fetchRevisions } from '@/app/dashboard/logs/actions';

type Revision = {
  version: number;
  editor_id: string;
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
        className="rounded border px-3 py-1"
      >
        View History
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Revision History</h2>
              <button onClick={() => setOpen(false)} className="p-2">✕</button>
            </div>
            <div className="mt-3 space-y-3 max-h-[70vh] overflow-auto">
              {revisions?.map((r) => (
                <div key={r.version} className="rounded border p-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">v{r.version}</span> ·{' '}
                    <span>Editor: {r.editor_id}</span> ·{' '}
                    <span>{new Date(r.edited_at).toLocaleString()}</span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{r.content}</pre>
                </div>
              )) ?? <div className="text-sm text-gray-600">Loading…</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
