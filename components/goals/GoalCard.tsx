'use client';

import { addSubgoalAction, deleteGoalAction, toggleSubgoalAction, updateGoalAction } from '@/app/dashboard/staff/clients/[id]/goals/actions';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
function SmallBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`rounded-md border px-3 py-1 text-sm dark:border-zinc-700 ${props.className ?? ''}`}
    />
  );
}

export default function GoalCard({
  clientId,
  goal,
  subgoals,
  reasons,
  domains,
}: {
  clientId: string;
  goal: any;
  subgoals: any[];
  reasons: string[];
  domains: string[];
}) {
  const [editTitle, setEditTitle] = useState(goal.title as string);
  const [editStatus, setEditStatus] = useState(goal.status as 'in_progress'|'completed');
  const [editDate, setEditDate] = useState<string>(goal.target_date as string);
  const [editDomain, setEditDomain] = useState<string>(goal.domain as string);
  const [editReason, setEditReason] = useState<string>(goal.not_met_reason ?? '');

  const [updateState, updateAction] = useActionState(updateGoalAction as any, null);
  const [addState, addAction]     = useActionState(addSubgoalAction as any, null);
  const [delState, delAction]     = useActionState(deleteGoalAction as any, null);

  const overdue =
    editStatus !== 'completed' &&
    editDate &&
    new Date(editDate) < new Date(new Date().toISOString().slice(0,10));

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <form action={updateAction} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="goalId" value={goal.id} />
        <input type="hidden" name="clientId" value={clientId} />

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Domain</label>
          <select
            name="domain"
            value={editDomain}
            onChange={(e) => setEditDomain(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={editStatus}
            onChange={e => setEditStatus(e.target.value as any)}
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
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {overdue && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Reason (not met by due date)</label>
            <select
              name="not_met_reason"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="" disabled>Select a reason…</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        <div className="sm:col-span-2 flex items-center gap-2">
          <SmallBtn type="submit" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">Save</SmallBtn>
          {Boolean(updateState) && <span className="text-sm text-red-600">{String(updateState)}</span>}
        </div>
      </form>

      {/* Sub-goals */}
      <div className="mt-4 rounded-lg border p-3 dark:border-zinc-800">
        <div className="mb-2 text-sm font-medium">Sub-goals</div>

        <ul className="space-y-2">
          {subgoals.map((sg) => (
            <li key={sg.id} className="flex items-center gap-2">
              <form action={toggleSubgoalAction} className="flex items-center gap-2">
                <input type="hidden" name="subgoalId" value={sg.id} />
                <input type="hidden" name="clientId" value={clientId} />
                <input
                  type="hidden"
                  name="is_done"
                  value={(!sg.is_done).toString()}
                />
                <input
                  type="checkbox"
                  checked={!!sg.is_done}
                  readOnly
                  className="size-4"
                />
                <SmallBtn type="submit">{sg.is_done ? 'Uncheck' : 'Check'}</SmallBtn>
                <span className={sg.is_done ? 'line-through text-zinc-500' : ''}>
                  {sg.title}
                </span>
              </form>
            </li>
          ))}
        </ul>

        {/* Add sub-goal */}
        <form action={addAction} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <input type="hidden" name="clientId" value={clientId} />
          <input
            name="title"
            placeholder="New sub-goal title"
            className="flex-1 rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <SmallBtn type="submit">Add</SmallBtn>
          {Boolean(addState) && <span className="text-sm text-red-600">{String(addState)}</span>}
        </form>
      </div>

      {/* Danger zone */}
      <form action={delAction} className="mt-4">
        <input type="hidden" name="goalId" value={goal.id} />
        <input type="hidden" name="clientId" value={clientId} />
        <SmallBtn type="submit" className="border-red-600 text-red-600">Delete goal</SmallBtn>
        {Boolean(delState) && <span className="ml-2 text-sm text-red-600">{String(delState)}</span>}
      </form>
    </article>
  );
}
