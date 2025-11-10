'use client';

import { useEffect, useState } from 'react';
import { fetchRevisions } from '@/app/dashboard/staff/logs/actions';

type Revision = {
  version: number;
  editor_id: string;
  name?: string | null;
  content: string;
  edited_at: string;
};

/** Very small word-level diff (no deps). Not as smart as 'diff', but good enough. */
function diffWordsLite(prev: string, curr: string) {
  const a = (prev ?? '').split(/(\s+)/); // keep whitespace tokens
  const b = (curr ?? '').split(/(\s+)/);
  // Build index of words in A
  const indexA = new Map<string, number[]>();
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!indexA.has(k)) indexA.set(k, []);
    indexA.get(k)!.push(i);
  }
  // Greedy match forward
  const matchedA = new Array(a.length).fill(false);
  const matchedB = new Array(b.length).fill(false);
  for (let j = 0; j < b.length; j++) {
    const candidates = indexA.get(b[j]);
    if (!candidates) continue;
    for (const i of candidates) {
      if (!matchedA[i] && a[i] === b[j]) {
        matchedA[i] = true;
        matchedB[j] = true;
        break;
      }
    }
  }
  // Emit parts with add/remove flags
  const parts: Array<{ value: string; added?: boolean; removed?: boolean }> = [];
  // Removed (in A but unmatched)
  for (let i = 0; i < a.length; i++) {
    if (!matchedA[i] && a[i] !== '') parts.push({ value: a[i], removed: true });
  }
  // Final text is B sequence; additions are unmatched in B
  for (let j = 0; j < b.length; j++) {
    if (matchedB[j]) {
      parts.push({ value: b[j] });
    } else if (b[j] !== '') {
      parts.push({ value: b[j], added: true });
    }
  }
  return parts;
}

export function ViewHistory({ logId }: { logId: string }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await fetchRevisions(logId);
        setRevisions(data as Revision[]);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load history');
        setRevisions([]);
      }
    })();
  }, [open, logId]);

  function renderDiff(curr: string, prev: string) {
    const parts = diffWordsLite(prev ?? '', curr ?? '');
    return (
      <div className="text-sm leading-relaxed">
        {parts.map((p, i) => {
          if (p.added) {
            return (
              <span
                key={`a-${i}`}
                className="bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200 rounded px-0.5"
              >
                {p.value}
              </span>
            );
          }
          if (p.removed) {
            return (
              <span
                key={`r-${i}`}
                className="bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200 rounded px-0.5 line-through"
              >
                {p.value}
              </span>
            );
          }
          return <span key={`k-${i}`}>{p.value}</span>;
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
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
                  const prev = revisions[idx + 1];
                  const isFirst = !prev;
                  const isExpanded = !!expanded[r.version];

                  return (
                    <div key={r.version} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
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
                              onClick={() => setExpanded((e) => ({ ...e, [r.version]: !isExpanded }))}
                              className="rounded border border-zinc-300 px-2 py-0.5 text-[11px] hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            >
                              {isExpanded ? 'Hide changes' : 'Show changes'}
                            </button>
                          </>
                        )}
                      </div>

                      <div className="mt-2">
                        {isFirst ? (
                          <pre className="whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
                            {r.content}
                          </pre>
                        ) : isExpanded ? (
                          <div className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                            {renderDiff(r.content, prev.content)}
                          </div>
                        ) : (
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
