"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(data: { title: string; clientId: string }) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("goals")
    .insert([
      {
        title: data.title,
        client_id: data.clientId,
        status: "in_progress"
      }
    ]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/staff/goals");
}

export async function updateGoalStatus(goalId: string, status: "in_progress" | "completed") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/staff/goals");
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/staff/goals");
}

export async function getClientGoals(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}