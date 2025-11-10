"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  
  const clientId = formData.get("clientId") as string;
  const title = formData.get("title") as string;

  const { error } = await supabase
    .from("goals")
    .insert([{
      client_id: clientId,
      title
    }]);

  if (error) throw new Error(error.message);
  
  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}

export async function updateGoalSubDomain(formData: FormData) {
  const supabase = await createClient();
  
  const goalId = formData.get("goalId") as string;
  const domain = formData.get("domain") as string;
  const met = formData.get("met") === "true";
  const reason = formData.get("reason") as string;
  const otherReason = formData.get("otherReason") as string;

  const { error } = await supabase
    .from("subgoals")
    .insert([{
      goal_id: goalId,
      domain,
      met,
      reason: reason === "Other" ? null : reason,
      other_reason: reason === "Other" ? otherReason : null
    }]);

  if (error) throw new Error(error.message);

  const { data: goal } = await supabase
    .from("goals")
    .select("client_id")
    .eq("id", goalId)
    .single();

  if (goal) {
    revalidatePath(`/dashboard/staff/clients/${goal.client_id}/goals`);
  }
}

export async function toggleSubgoalStatus(formData: FormData) {
  const supabase = await createClient();
  
  const subgoalId = formData.get("subgoalId") as string;
  const met = formData.get("met") === "true";

  const { error } = await supabase
    .from("subgoals")
    .update({ met })
    .eq("id", subgoalId);

  if (error) throw new Error(error.message);

  const { data: subgoal } = await supabase
    .from("subgoals")
    .select("goal_id")
    .eq("id", subgoalId)
    .single();

  if (subgoal) {
    const { data: goal } = await supabase
      .from("goals")
      .select("client_id")
      .eq("id", subgoal.goal_id)
      .single();

    if (goal) {
      revalidatePath(`/dashboard/staff/clients/${goal.client_id}/goals`);
    }
  }
}

export async function deleteGoal(formData: FormData) {
  const supabase = await createClient();
  
  const goalId = formData.get("goalId") as string;
  const clientId = formData.get("clientId") as string;

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}