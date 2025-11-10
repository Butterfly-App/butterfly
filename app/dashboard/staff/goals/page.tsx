import { createClient } from "@/lib/supabase/server";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { createGoal, updateSubgoal, deleteGoal, getClientGoals } from "./actions";
import { ClientSelect } from "./client-select";

const DOMAINS = [
  "physical",
  "material",
  "emotional",
  "personal development",
  "self-determination",
  "rights",
  "social inclusion",
  "interpersonal relations",
] as const;

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const supabase = await createClient();
  const params = await searchParams; 


  // Get list of clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name");

  // Get goals for selected client
  const goals = searchParams.clientId ? await getClientGoals(searchParams.clientId) : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Goals</h1>
        {searchParams.clientId && (
          <CreateGoalDialog
            clientId={searchParams.clientId}
            onGoalCreate={createGoal}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ClientSelect clients={clients || []} />

        {/* Goals List */}
        {searchParams.clientId ? (
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-center text-gray-500">No goals yet. Create one to get started!</p>
            ) : (
              goals.map((goal) => {
                // Calculate status based on subgoals
                const allSubgoalsCompleted = goal.subgoals?.every(s => s.met) ?? false;
                const status = allSubgoalsCompleted ? "completed" : "in_progress";
                
                return (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.title}
                    status={status}
                    onStatusChange={(goalId, newStatus) => {
                      // Update all subgoals' met status based on the new goal status
                      goal.subgoals?.forEach(subgoal => {
                        updateSubgoal(goalId, subgoal.id, newStatus === "completed");
                      });
                    }}
                    onDelete={deleteGoal}
                  />
                );
              })
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Select a client to manage their goals</p>
        )}
      </div>
    </div>
  );
}