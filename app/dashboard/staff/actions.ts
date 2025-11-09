"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireMinimumRole } from "@/lib/auth/roles-server";
import { revalidatePath } from "next/cache";

export interface ProfileData {
  id: string;
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export async function getUsersAndGuardians(): Promise<ProfileData[]> {
  // Ensure user has at least staff role
  await requireMinimumRole("staff");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      user_id,
      email,
      role,
      full_name,
      phone,
      address,
      created_at,
      updated_at
    `)
    .in("role", ["user", "guardian"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users and guardians:", error);
    throw new Error("Failed to fetch users and guardians");
  }


  // Map emails to profiles
  const profiles: ProfileData[] = data.map((user) => {
    return {
      id: user.id,
      address: user.address,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      user_id: user.user_id,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  });

  return profiles;
}

export async function createUser(data: {
  email: string;
  password: string;
  role: "user" | "guardian";
  full_name?: string;
  phone?: string;
  address?: string;
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Ensure user has at least staff role
    await requireMinimumRole("staff");

    // Validate email and password
    if (!data.email || !data.password) {
      return { success: false, error: "Email and password are required" };
    }

    if (data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Create admin client for creating users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return { success: false, error: "Server configuration error" };
    }

    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create the user using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error("Error creating user:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" };
    }

    // Update profile with role and additional information
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", authData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // User was created but profile update failed
      return {
        success: false,
        error: "User created but profile update failed",
        userId: authData.user.id
      };
    }

    revalidatePath("/dashboard/staff/users");
    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Error in createUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    address?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure user has at least staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Check if the profile being updated is user or guardian
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return { success: false, error: "Profile not found" };
    }

    // Staff can only update user and guardian profiles
    if (profile.role !== "user" && profile.role !== "guardian") {
      return { success: false, error: "Unauthorized to update this profile" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        address: updates.address,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/dashboard/staff/users");
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
