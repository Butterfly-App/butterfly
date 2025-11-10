import { fetchClient } from '../actions';
import { ClientAboutForm } from './about-form';


export default async function AboutPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;      // Next 15: params is a Promise
  const client = await fetchClient(id);
  return (
    <>
      <h2 className="text-xl font-semibold">About {client.first_name}</h2>

      {/* Read-only snapshot */}
      <div className="mt-4 space-y-4">
        <div>
          <div className="text-sm font-medium">Likes</div>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {client.likes ?? '—'}
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Dislikes</div>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {client.dislikes ?? '—'}
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Communication Preferences</div>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {client.communication_prefs ?? client.communication_preferences ?? '—'}
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Emergency Info</div>
          <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {client.emergency_info ?? '—'}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <div className="text-sm font-medium">Emergency Contact Name</div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {client.emergency_contact_name ?? '—'}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium">Phone</div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {client.emergency_contact_phone ?? '—'}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium">Relationship</div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {client.emergency_contact_relationship ?? '—'}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
          Last edited:{' '}
          {client.last_edited_at ? new Date(client.last_edited_at).toLocaleString() : '—'}
          {client.last_edited_by ? ` • by ${client.last_edited_by}` : ''}
        </div>
      </div>

      {/* Edit form */}
      <div className="mt-8 border-t pt-6">
        <ClientAboutForm client={client} />
      </div>
    </>
  );
}
