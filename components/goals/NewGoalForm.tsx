'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { createGoalAction } from '@/app/dashboard/staff/clients/[id]/goals/actions';

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}

export default function NewGoalForm({
  clientId,
  domains,
  reasons,
}: {
  clientId: string;
  domains: string[];
  reasons: string[];
}) {
  const [count, setCount] = useState(0);
  const [state, formAction] = useActionState(createGoalAction as any, null);
  const [status, setStatus] = useState<'in_progress'|'completed'>('in_progress');
  const [targetDate, setTargetDate] = useState<string>('');

  const overdue =
    status !== 'completed' &&
    targetDate &&
    new Date(targetDate) < new Date(new Date().toISOString().slice(0,10));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="e.g., Improve morning routine"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Domain</label>
          <select
            name="domain"
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            defaultValue={domains[0]}
          >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Target date</label>
          <input
            type="date"
            name="target_date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium"># of sub-goals</label>
          <input
            type="number"
            name="subgoal_count"
            min={0}
            max={20}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || '0', 10))}
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {overdue && (
          <div>
            <label className="block text-sm font-medium">Reason (not met by due date)</label>
            <select
              name="not_met_reason"
              required
              className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              defaultValue=""
            >
              <option value="" disabled>Select a reason…</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="rounded-lg border p-4 dark:border-zinc-800">
          <p className="mb-3 text-sm font-medium">Sub-goals</p>
          <div className="grid gap-3">
            {Array.from({ length: count }).map((_, i) => (
              <input
                key={i}
                name={`subgoal_${i}`}
                placeholder={`Sub-goal #${i + 1}`}
                className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitBtn label="Create Goal" />
        {state && <span className="text-sm text-red-600">{String(state)}</span>}
      </div>
    </form>
  );
}
