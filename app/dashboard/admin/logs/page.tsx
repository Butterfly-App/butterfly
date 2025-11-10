import { createClient } from '@/lib/supabase/server';
import { NewLogForm } from '@/components/logs/NewLogForm';
import { EditLogForm } from '@/components/logs/EditLogForm';
import { ViewHistory } from '@/components/logs/ViewHistory';
import { fetchClients } from '@/app/dashboard/logs/actions'; // or './actions' if colocated
import { getUserRole } from '@/lib/auth/roles-server';        // if you have this helper




export default async function LogsPage() {
  const supabase = await createClient();
  const [{ data: { user } }, role, clientsRes, logsRes] = await Promise.all([
    supabase.auth.getUser(),
    getUserRole?.() ?? 'staff',
    fetchClients(),
    supabase
      .from('log_notes')
      .select('id, client_id, author_id, content, created_at, updated_at')
      .order('created_at', { ascending: false }),
  ]);

  const clients = clientsRes ?? [];
  const logs = logsRes.data ?? [];
  const clientMap = new Map(clients.map(c => [c.id, c.name]));

  return (
    <>
      {/* Inner container to avoid spanning the full dashboard width */}
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Create Log */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold">Create Daily Log</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select a client and add the daily note. Timestamps & author are automatic.
          </p>
          <div className="mt-4">
            <NewLogForm clients={clients} />
          </div>
        </section>

        {/* Recent Logs */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Logs
          </h2>

          {logs.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              No logs yet. Create the first one above.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((l) => (
                <article
                  key={l.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {clientMap.get(l.client_id) ?? 'Client'}
                      </span>
                      <span className="mx-2">·</span>
                      <span>Created {new Date(l.created_at).toLocaleString()}</span>
                      <span className="mx-2">·</span>
                      <span>Updated {new Date(l.updated_at).toLocaleString()}</span>
                    </div>
                    <ViewHistory logId={l.id} />
                  </header>

                  <div className="mt-3">
                    <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100">
                      {l.content}
                    </pre>
                  </div>

                  <div className="mt-5 border-t pt-5 dark:border-zinc-800">
                    <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Edit note
                    </h3>
                    <EditLogForm logId={l.id} currentContent={l.content} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
