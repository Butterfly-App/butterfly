'use client';

import { useTransition } from 'react';
import { createLogAction } from '@/app/dashboard/logs/actions';

export function NewLogForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => createLogAction(formData))}
      className="grid gap-3"
    >
      <label className="text-sm font-medium">Client</label>
      <select
        name="clientId"
        className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        required
        defaultValue=""
      >
        <option value="" disabled>Select a client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="mt-2 text-sm font-medium">Daily Note</label>
      <textarea
        name="content"
        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        rows={6}
        placeholder="What did the client do today?"
        required
      />

      <div className="mt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? 'Saving…' : 'Create Log'}
        </button>
      </div>
    </form>
  );
}
