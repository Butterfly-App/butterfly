
'use server'

import { createClient } from '@/lib/supabase/server';
import { NewLogForm } from '@/components/logs/NewLogForm';
import { EditLogForm } from '@/components/logs/EditLogForm';
import { ViewHistory } from '@/components/logs/ViewHistory';
    import { fetchClients } from './actions';

export default async function LogsPage() {
  const supabase = await createClient();

  const clients = await fetchClients();
  const clientMap = new Map(clients?.map(c => [c.id, c.name]) ?? []);

  const { data: logs, error } = await supabase
    .from('log_notes')
    .select('id, client_id, author_id, content, created_at, updated_at') // ⬅ removed clients(name)
    .order('created_at', { ascending: false });

  if (error) {
    // surfaces the real Postgres message in the overlay
    throw new Error(`log_notes query failed: ${error.code} ${error.message}`);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold">Create Daily Log</h1>
        <p className="text-sm text-gray-600">
          Select client and add the daily note. Timestamp & author are automatic.
        </p>
        <div className="mt-3">
          <NewLogForm clients={clients ?? []} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent Logs</h2>
        <div className="mt-3 grid gap-4">
          {(logs ?? []).map((l) => (
            <div key={l.id} className="rounded border p-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{clientMap.get(l.client_id) ?? 'Client'}</span> ·{' '}
                <span>Created {new Date(l.created_at).toLocaleString()}</span> ·{' '}
                <span>Updated {new Date(l.updated_at).toLocaleString()}</span>
              </div>

              <pre className="mt-2 whitespace-pre-wrap">{l.content}</pre>

              <div className="mt-3 flex items-center gap-2">
                <ViewHistory logId={l.id} />
              </div>

              <div className="mt-3">
                <EditLogForm logId={l.id} currentContent={l.content} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
