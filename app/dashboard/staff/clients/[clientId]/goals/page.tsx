import { createClient } from "@/lib/supabase/server";
import { GoalsManager } from "@/components/goals/goals-manager";

export default async function ClientGoalsPage({ params }: { params: { clientId: string } }) {
  const supabase = await createClient();

  const clientId = params.clientId;

  // fetch goals and their subgoals
  const { data: goals } = await supabase
    .from("goals")
    .select(`id, title, created_at, subgoals(*)`)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Goals for client</h1>
      {/* hydrate client component with initial data */}
      <GoalsManager clientId={clientId} initialGoals={(goals as any) || []} />
    </div>
  );
}
