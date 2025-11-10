import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewGoalForm from '@/components/goals/NewGoalForm';
import GoalCard from '@/components/goals/GoalCard';
import { DOMAINS, REASONS } from './constants';


type Params = Promise<{ id: string }>;

export default async function GoalsPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch goals + subgoals for this client
  const [{ data: goals, error: gErr }, { data: subs, error: sErr }] = await Promise.all([
    supabase
      .from('goals')
      .select('id, title, status, target_date, domain, not_met_reason, created_at, updated_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('goal_subgoals')
      .select('id, goal_id, title, is_done, order_index')
      .order('order_index', { ascending: true }),
  ]);
  if (gErr) throw gErr;
  if (sErr) throw sErr;

  const subMap = new Map<string, any[]>();
  (subs ?? []).forEach(sg => {
    const arr = subMap.get(sg.goal_id) ?? [];
    arr.push(sg);
    subMap.set(sg.goal_id, arr);
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Create / Update Goals</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Define goals, sub-goals, domain, due date, and completion status. If overdue and not completed,
          a reason is required.
        </p>
        <div className="mt-4">
          <NewGoalForm   clientId={id}
  domains={[...DOMAINS]}
  reasons={[...REASONS]} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold">Goals</h3>
        {(goals ?? []).length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No goals yet. Create the first one above.
          </div>
        ) : (
          <div className="space-y-4">
            {(goals ?? []).map((g) => (
              <GoalCard
                key={g.id}
                clientId={id}
                goal={g}
                  subgoals={subMap.get(g.id) ?? []}
  reasons={[...REASONS]}
  domains={[...DOMAINS]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
