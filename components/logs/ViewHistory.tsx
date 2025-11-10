'use client';

import { useEffect, useState } from 'react';
import { fetchRevisions } from '@/app/dashboard/staff/logs/actions';
import { diffWords } from 'diff';

type Revision = {
  version: number;
  editor_id: string;
  name?: string | null;
  content: string;
  edited_at: string;
};

export function ViewHistory({ logId }: { logId: string }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // track which version is expanded to show diff
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await fetchRevisions(logId);
        setRevisions(data as Revision[]);
        setErr(null);
      } catch (e: any) {
        console.error('fetchRevisions failed:', e);
        setErr(e?.message ?? 'Failed to load history');
        setRevisions([]);
      }
    })();
  }, [open, logId]);

  // Compute diff between current revision's content and the previous version's content
  function renderDiff(curr: string, prev: string) {
    const parts = diffWords(prev ?? '', curr ?? '');
    return (
      <div className="text-sm leading-relaxed">
        {parts.map((p, i) => {
          if (p.added) {
            return (
              <span
                key={i}
                className="bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200 rounded px-0.5"
              >
                {p.value}
              </span>
            );
          }
          if (p.removed) {
            return (
              <span
                key={i}
                className="bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200 rounded px-0.5 line-through"
              >
                {p.value}
              </span>
            );
          }
          return <span key={i}>{p.value}</span>;
        })}
      </div>
    );
  }

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
              {err ? (
                <div className="text-sm text-red-600 dark:text-red-400">{err}</div>
              ) : !revisions ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
              ) : revisions.length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">No revisions yet.</div>
              ) : (
                revisions.map((r, idx) => {
                  // revisions are sorted desc (latest first); previous content is the next item
                  const prev = revisions[idx + 1];
                  const isFirst = !prev; // no previous version to compare to
                  const isExpanded = !!expanded[r.version];

                  return (
                    <div
                      key={r.version}
                      className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">v{r.version}</span>
                        <span>·</span>
                        <span>Editor: {r.name ?? r.editor_id}</span>
                        <span>·</span>
                        <span>{new Date(r.edited_at).toLocaleString()}</span>
                        {!isFirst && (
                          <>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded((e) => ({ ...e, [r.version]: !isExpanded }))
                              }
                              className="rounded border border-zinc-300 px-2 py-0.5 text-[11px] hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            >
                              {isExpanded ? 'Hide changes' : 'Show changes'}
                            </button>
                          </>
                        )}
                      </div>

                      <div className="mt-2">
                        {isFirst ? (
                          // No previous version to diff against; show full content
                          <pre className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
                            {r.content}
                          </pre>
                        ) : isExpanded ? (
                          // Show diff against previous revision
                          <div className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                            {renderDiff(r.content, prev.content)}
                          </div>
                        ) : (
                          // Default collapsed view: just show full text
                          <pre className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
                            {r.content}
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
