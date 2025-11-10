import { createClient } from '@/lib/supabase/server';
import { NewLogForm } from '@/components/logs/NewLogForm';
import { EditLogForm } from '@/components/logs/EditLogForm';
import { ViewHistory } from '@/components/logs/ViewHistory';
import { fetchClients } from '@/app/dashboard/staff/logs/actions';




export default async function LogsPage() {
  const supabase = await createClient();

  const clients = await fetchClients();
  const clientMap = new Map((clients ?? []).map(c => [c.id, c.name]));

  const { data: logs, error } = await supabase
    .from('log_notes')
    .select('id, client_id, author_id, content, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`${error.code} ${error.message}`);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold">Create Daily Log</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Select a client and add the daily note. Timestamps & author are automatic.
        </p>
        <div className="mt-4">
          <NewLogForm clients={clients ?? []} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Recent Logs</h2>
        {(logs ?? []).map((l) => (
          <article key={l.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {clientMap.get(l.client_id) ?? 'Client'}
              </span>
              <span className="mx-2">·</span>
              <span>Created {new Date(l.created_at).toLocaleString()}</span>
              <span className="mx-2">·</span>
              <span>Updated {new Date(l.updated_at).toLocaleString()}</span>
            </div>

            <pre className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100">
              {l.content}
            </pre>

            <div className="mt-4 flex items-center gap-2">
              <ViewHistory logId={l.id} />
            </div>

            <div className="mt-5 border-t pt-5 dark:border-zinc-800">
              <EditLogForm logId={l.id} currentContent={l.content} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
