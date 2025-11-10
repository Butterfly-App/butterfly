"use server"
import { createClient } from "@/lib/supabase/server"

export async function createGoal(
  clientId: string, 
  title: string, 
  domain: string,
  initialSubgoal: {
    description: string,
    met?: boolean,
    reason?: string,
    otherReason?: string
  }
) {
  const supabase = await createClient()
  
  // Start a Supabase transaction
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .insert({ client_id: clientId, title, domain })
    .select()
    .single()

  if (goalError) throw new Error(goalError.message)

  // Create the initial subgoal
  const { data: subgoal, error: subgoalError } = await supabase
    .from("subgoals")
    .insert({
      goal_id: goal.id,
      domain,
      description: initialSubgoal.description,
      met: initialSubgoal.met || false,
      reason: initialSubgoal.reason === "Other" ? null : initialSubgoal.reason,
      other_reason: initialSubgoal.reason === "Other" ? initialSubgoal.otherReason : null
    })
    .select()
    .single()

  if (subgoalError) {
    // If subgoal creation fails, delete the goal to maintain consistency
    await supabase.from("goals").delete().eq("id", goal.id)
    throw new Error(subgoalError.message)
  }

  return { ...goal, subgoals: [subgoal] }
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)

  if (error) throw new Error(error.message)
}

export async function createSubgoal(
  goalId: string,
  domain: string,
  met: boolean = false,
  reason?: string,
  otherReason?: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("subgoals")
    .insert({
      goal_id: goalId,
      domain,
      met,
      reason: reason === "Other" ? null : reason,
      other_reason: reason === "Other" ? otherReason : null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSubgoal(subgoalId: string, met: boolean) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("subgoals")
    .update({ met })
    .eq("id", subgoalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}