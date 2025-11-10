'use client';
import { useTransition } from 'react';
import { updateLogAction } from '@/app/dashboard/staff/logs/actions';


export function EditLogForm({ logId, currentContent }: { logId: string; currentContent: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => updateLogAction(null, fd))}
      className="grid gap-3"
    >
      <input type="hidden" name="logId" value={logId} />

      <textarea
        name="content"
        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        rows={6}
        defaultValue={currentContent}
        required
      />

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? 'Updating…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
