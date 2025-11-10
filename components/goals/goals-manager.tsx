"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  createGoal, 
  deleteGoal, 
  createSubgoal, 
  updateSubgoal 
} from "@/app/dashboard/staff/goals/actions";
import { toast } from "sonner";
type Subgoal = {
  id: string;
  domain: string;
  met: boolean;
  reason?: string | null;
  other_reason?: string | null;
};
type Goal = {
  id: string;
  title: string;
  created_at?: string;
  domain: string;
  subgoals?: Subgoal[];
};

const DOMAINS = [
  "physical",
  "material",
  "emotional",
  "personal development",
  "self-determination",
  "rights",
  "social inclusion",
  "interpersonal relations",
];

const REASONS = [
  "Left program",
  "Ill/hospitalized",
  "Crisis/challenge",
  "Guardian directive",
  "Time specific",
  "Home instability",
  "Person not committed to goal",
  "Guardian/family responsibility not met",
  "Person's current skills do not match",
  "Individual's financial constraints",
  "Staffing/manpower shortages",
  "Other",
];

export function GoalsManager({ clientId, initialGoals }: { clientId: string; initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals || []);
  const [newTitle, setNewTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setGoals(initialGoals || []);
  }, [initialGoals]);

  async function handleCreateGoal(domain: string) {
    if (!newTitle.trim()) return;
    
    startTransition(async () => {
      try {
        const goal = await createGoal(
          clientId,
          newTitle,
          domain,
          { description: newTitle }
        );
        setGoals((prev) => [goal, ...prev]);
        setNewTitle("");
        toast.success("Goal created successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create goal");
      }
    });
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;
    
    startTransition(async () => {
      try {
        await deleteGoal(id);
        setGoals((prev) => prev.filter((goal) => goal.id !== id));
        toast.success("Goal deleted successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete goal");
      }
    });
  }

  async function handleCreateSubgoal(goalId: string, domain: string, met = false, reason?: string, otherReason?: string) {
    startTransition(async () => {
      try {
        const subgoal = await createSubgoal(goalId, domain, domain, met, reason, otherReason);
        setGoals((prev) => prev.map((goal) => 
          goal.id === goalId 
            ? { ...goal, subgoals: [subgoal, ...(goal.subgoals || [])] }
            : goal
        ));
        toast.success("Subgoal created successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create subgoal");
      }
    });
  }

  async function handleToggleSubgoal(goalId: string, subId: string, met: boolean) {
    startTransition(async () => {
      try {
        const updatedSubgoal = await updateSubgoal(goalId, subId, met);
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === goalId
              ? { 
                  ...goal, 
                  subgoals: (goal.subgoals || []).map((s) => 
                    s.id === subId ? { ...s, met: updatedSubgoal.met } : s
                  )
                }
              : goal
          )
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update subgoal");
      }
    });
  }

  function goalCompletionPercent(goal: Goal) {
    const subs = goal.subgoals || [];
    if (subs.length === 0) return 0;
    const metCount = subs.filter((s) => s.met).length;
    return Math.round((metCount / subs.length) * 100);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={DOMAINS[0]}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {DOMAINS.map((domain) => (
            <TabsTrigger key={domain} value={domain} className="capitalize">
              {domain}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {DOMAINS.map((domain) => (
          <TabsContent key={domain} value={domain}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`New ${domain} goal title`}
                  className="flex-1 rounded border px-3 py-2"
                />
                <Button 
                  onClick={() => handleCreateGoal(domain)}
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Add Goal"}
                </Button>
              </div>

              <div className="space-y-4">
                {goals
                  .filter(goal => goal.domain === domain)
                  .map((goal) => (
                    <Card key={goal.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed: {goalCompletionPercent(goal)}%
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-medium">Subgoals</h4>
                        <SubgoalsSection 
                goal={goal} 
                onCreate={handleCreateSubgoal} 
                onToggle={handleToggleSubgoal}
                isPending={isPending}
              />
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SubgoalsSection({ 
  goal, 
  onCreate, 
  onToggle,
  isPending 
}: { 
  goal: Goal; 
  onCreate: (goalId: string, domain: string, met?: boolean, reason?: string, otherReason?: string) => void; 
  onToggle: (goalId: string, subId: string, met: boolean) => void;
  isPending: boolean;
}) {
  const [met, setMet] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [other, setOther] = useState("");

  function submitNew(e?: React.FormEvent) {
    e?.preventDefault();
    onCreate(goal.id, goal.domain, met, reason === "Other" ? undefined : reason, reason === "Other" ? other : undefined);
    setOther("");
  }

  return (
    <div className="mt-2 space-y-2">
      <form onSubmit={submitNew} className="flex flex-wrap gap-2 items-center">
        <select 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-w-[150px] rounded-md border border-input px-3 py-2 text-sm"
        >
          {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        
        {reason === "Other" && (
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Other reason"
            className="flex-1 min-w-[200px] rounded-md border border-input px-3 py-2 text-sm"
          />
        )}
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={met}
            onChange={(e) => setMet(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm">Met</span>
        </label>
        
        <Button type="submit" size="sm">Add Subgoal</Button>
      </form>

      <div className="mt-2 space-y-1">
        {(goal.subgoals || []).map((s) => (
          <Card key={s.id} className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{s.domain}</div>
                <div className="text-xs text-muted-foreground">
                  {s.reason || s.other_reason || "No reason"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.met}
                    onChange={(e) => onToggle(goal.id, s.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Met</span>
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
