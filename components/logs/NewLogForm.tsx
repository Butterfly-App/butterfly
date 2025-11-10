'use client';

import { useTransition } from 'react';
import { createLogAction } from '@/app/dashboard/logs/actions';

export function NewLogForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => createLogAction(formData))}
      className="space-y-3"
    >
      <label className="block text-sm font-medium">Client</label>
      <select
        name="clientId"
        className="w-full rounded border p-2"
        required
        defaultValue=""
      >
        <option value="" disabled>Select a client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mt-2">Daily Note</label>
      <textarea
        name="content"
        className="w-full rounded border p-2"
        rows={6}
        placeholder="What did the client do today?"
        required
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Create Log'}
      </button>

      {/* Auto-timestamp & author: set by DB and session; no inputs needed */}
    </form>
  );
}
