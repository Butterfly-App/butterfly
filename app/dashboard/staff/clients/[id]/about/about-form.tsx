'use client';

import { useTransition } from 'react';
import { saveAboutAction } from '../actions';

type Client = {
  id: string;
  likes: string | null;
  dislikes: string | null;
  communication_prefs: string | null;
  communication_preferences?: string | null;
  emergency_info: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  first_name?: string | null;
};

export function ClientAboutForm({ client }: { client: Client }) {
  const [pending, start] = useTransition();
  const comm = client.communication_prefs ?? client.communication_preferences ?? '';

  return (
    <form className="grid gap-4" action={(fd) => start(() => saveAboutAction(null, fd))}>
      <input type="hidden" name="clientId" value={client.id} />

      <label className="text-sm font-medium">Likes</label>
      <textarea
        name="likes"
        rows={3}
        defaultValue={client.likes ?? ''}
        className="w-full rounded border p-2 text-sm"
      />

      <label className="text-sm font-medium">Dislikes</label>
      <textarea
        name="dislikes"
        rows={3}
        defaultValue={client.dislikes ?? ''}
        className="w-full rounded border p-2 text-sm"
      />

      <label className="text-sm font-medium">Communication Preferences</label>
      <textarea
        name="communication_prefs"
        rows={3}
        defaultValue={comm}
        className="w-full rounded border p-2 text-sm"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Emergency Contact Name</label>
          <input
            name="emergency_contact_name"
            defaultValue={client.emergency_contact_name ?? ''}
            className="w-full rounded border p-2 text-sm"
            type="text"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Emergency Contact Phone</label>
          <input
            name="emergency_contact_phone"
            defaultValue={client.emergency_contact_phone ?? ''}
            className="w-full rounded border p-2 text-sm"
            type="text"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Relationship</label>
          <input
            name="emergency_contact_relationship"
            defaultValue={client.emergency_contact_relationship ?? ''}
            className="w-full rounded border p-2 text-sm"
            type="text"
          />
        </div>
      </div>

      <label className="text-sm font-medium">Emergency Info</label>
      <textarea
        name="emergency_info"
        rows={3}
        defaultValue={client.emergency_info ?? ''}
        className="w-full rounded border p-2 text-sm"
      />

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save About'}
        </button>
      </div>
    </form>
  );
}
