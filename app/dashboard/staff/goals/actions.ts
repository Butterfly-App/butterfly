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
  
  // Create goal with subgoals as a JSON array
  const subgoalData = {
    id: crypto.randomUUID(), // Generate unique ID for the subgoal
    domain,
    description: initialSubgoal.description,
    met: initialSubgoal.met || false,
    reason: initialSubgoal.reason === "Other" ? null : initialSubgoal.reason,
    other_reason: initialSubgoal.reason === "Other" ? initialSubgoal.otherReason : null,
    created_at: new Date().toISOString()
  }

  const { data: goal, error: goalError } = await supabase
    .from("Goal")
    .insert({ 
      client_id: clientId, 
      title, 
      domain,
      subgoals: [subgoalData] // Store as JSON array
    })
    .select()
    .single()

  if (goalError) throw new Error(goalError.message)

  return goal
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("Goal")
    .delete()
    .eq("id", goalId)

  if (error) throw new Error(error.message)
}

export async function createSubgoal(
  goalId: string,
  domain: string,
  description: string,
  met: boolean = false,
  reason?: string,
  otherReason?: string
) {
  const supabase = await createClient()
  
  // First, fetch the current goal with its subgoals
  const { data: goal, error: fetchError } = await supabase
    .from("Goal")
    .select("subgoals")
    .eq("id", goalId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const newSubgoal = {
    id: crypto.randomUUID(),
    domain,
    description,
    met,
    reason: reason === "Other" ? null : reason,
    other_reason: reason === "Other" ? otherReason : null,
    created_at: new Date().toISOString()
  }

  // Append the new subgoal to the existing array
  const updatedSubgoals = [...(goal.subgoals || []), newSubgoal]

  const { data, error } = await supabase
    .from("Goal")
    .update({ subgoals: updatedSubgoals })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return newSubgoal
}

export async function updateSubgoal(goalId: string, subgoalId: string, met: boolean) {
  const supabase = await createClient()
  
  // Fetch the current goal
  const { data: goal, error: fetchError } = await supabase
    .from("Goal")
    .select("subgoals")
    .eq("id", goalId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // Update the specific subgoal in the array
  const updatedSubgoals = (goal.subgoals || []).map((subgoal: any) =>
    subgoal.id === subgoalId ? { ...subgoal, met } : subgoal
  )

  const { data, error } = await supabase
    .from("Goal")
    .update({ subgoals: updatedSubgoals })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return updatedSubgoals.find((s: any) => s.id === subgoalId)
}

export async function deleteSubgoal(goalId: string, subgoalId: string) {
  const supabase = await createClient()
  
  // Fetch the current goal
  const { data: goal, error: fetchError } = await supabase
    .from("Goal")
    .select("subgoals")
    .eq("id", goalId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // Filter out the subgoal to delete
  const updatedSubgoals = (goal.subgoals || []).filter((subgoal: any) => subgoal.id !== subgoalId)

  const { data, error } = await supabase
    .from("Goal")
    .update({ subgoals: updatedSubgoals })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}



export async function getClientGoals(goalId: string) {
  const supabase = await createClient()
  
  const { data: goals, error } = await supabase
    .from("Goal")
    .select(`id, title, created_at, subgoals(*)`)
    .eq("client_id", goalId)
    .order("created_at", { ascending: false})
     if (error) throw new Error(error.message)
    return goals
}