"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { requireMinimumRole } from "@/lib/auth/roles-server";
import { revalidatePath } from "next/cache";
import type { CreateClientInput, UpdateClientInput, ClientWithGuardian } from "@/lib/types/client";

// Helper function to get user emails by IDs using database function
async function getUserEmails(supabase: any, userIds: string[]) {
  if (userIds.length === 0) return {};

  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  const { data, error } = await supabase.rpc('get_user_emails', {
    user_ids: uniqueIds
  });

  if (error) {
    console.error("Failed to fetch user emails:", error);
    return {};
  }

  const emailMap: Record<string, string> = {};
  data?.forEach((row: { user_id: string; email: string }) => {
    emailMap[row.user_id] = row.email;
  });

  return emailMap;
}

export async function getClients(): Promise<ClientWithGuardian[]> {
  const supabase = await createSupabaseClient();

  // Require at least staff role
  await requireMinimumRole("staff");

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  // Get guardian emails
  const guardianIds = clients.map((c: any) => c.guardian_id).filter(Boolean);
  const emailMap = await getUserEmails(supabase, guardianIds);

  // Enrich clients with guardian info
  const enrichedClients = clients.map((client: any) => ({
    ...client,
    guardian: client.guardian_id ? {
      id: client.guardian_id,
      email: emailMap[client.guardian_id] || "Unknown"
    } : undefined
  }));

  return enrichedClients;
}

export async function getClientById(id: string): Promise<ClientWithGuardian> {
  const supabase = await createSupabaseClient();

  // Require at least staff role
  await requireMinimumRole("staff");

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch client: ${error.message}`);
  }

  // Get guardian email if exists
  let guardianEmail;
  if (client.guardian_id) {
    const emailMap = await getUserEmails(supabase, [client.guardian_id]);
    guardianEmail = emailMap[client.guardian_id];
  }

  return {
    ...client,
    guardian: client.guardian_id ? {
      id: client.guardian_id,
      email: guardianEmail || "Unknown"
    } : undefined
  };
}

export async function createClientUser(input: CreateClientInput) {
  const supabase = await createSupabaseClient();

  // Require at least staff role
  await requireMinimumRole("staff");

  // Get current user to set as created_by
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  revalidatePath("/dashboard/staff/clients");
  revalidatePath("/dashboard/admin/clients");

  return data;
}

export async function updateClient(input: UpdateClientInput) {
  const supabase = await createSupabaseClient();

  // Require at least staff role
  await requireMinimumRole("staff");

  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  revalidatePath("/dashboard/staff/clients");
  revalidatePath("/dashboard/admin/clients");
  revalidatePath(`/dashboard/staff/clients/${id}`);
  revalidatePath(`/dashboard/admin/clients/${id}`);

  return data;
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient();

  // Require admin role for deletion
  await requireMinimumRole("admin");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }

  revalidatePath("/dashboard/staff/clients");
  revalidatePath("/dashboard/admin/clients");
}

export async function getGuardians() {
  const supabase = await createSupabaseClient();

  // Require at least staff role
  await requireMinimumRole("staff");

  // Get all guardian profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "guardian");
  console.log(profiles)
  if (error) {
    throw new Error(`Failed to fetch guardians: ${error.message}`);
  }


  // Format the response
  const guardians = profiles.map((profile) => ({
    user_id: profile.user_id,
    users: {
      id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name
    }
  }));

  return guardians;
}
