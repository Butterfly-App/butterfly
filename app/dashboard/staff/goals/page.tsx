import { createClient } from "@/lib/supabase/server";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { createGoal, updateGoalStatus, deleteGoal, getClientGoals } from "./actions";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const supabase = await createClient();

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
        {/* Client Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Client</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2"
            value={searchParams.clientId || ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("clientId", e.target.value);
              window.location.href = url.toString();
            }}
          >
            <option value="">Select a client...</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Goals List */}
        {searchParams.clientId ? (
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-center text-gray-500">No goals yet. Create one to get started!</p>
            ) : (
              goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  id={goal.id}
                  title={goal.title}
                  status={goal.status}
                  onStatusChange={updateGoalStatus}
                  onDelete={deleteGoal}
                />
              ))
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Select a client to manage their goals</p>
        )}
      </div>
    </div>
  );
}