'use client';

import { useTransition } from 'react';
import { updateLogAction } from '@/app/dashboard/logs/actions';

export function EditLogForm({ logId, currentContent }: { logId: string; currentContent: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => updateLogAction(null, fd))}
      className="space-y-3"
    >
      <input type="hidden" name="logId" value={logId} />

      <label className="block text-sm font-medium">Edit Note</label>
      <textarea
        name="content"
        className="w-full rounded border p-2"
        rows={8}
        defaultValue={currentContent}
        required
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? 'Updating…' : 'Save Changes'}
      </button>
    </form>
  );
}
