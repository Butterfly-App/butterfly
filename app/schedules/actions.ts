"use server";

import { createClient } from "@/lib/supabase/server";
import { requireMinimumRole } from "@/lib/auth/roles-server";
import type { ScheduleWithParticipants } from "@/lib/types/schedule";
import { revalidatePath } from "next/cache";

interface CreateScheduleInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_users: boolean;
  participant_ids?: string[];
  assigned_staff_id?: string;
}

/**
 * Get all schedules with their participants
 * Accessible by staff and admin roles
 */
export async function getSchedules(): Promise<{
  data?: ScheduleWithParticipants[];
  error?: string;
}> {
  try {
    // Require minimum staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Fetch schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("schedules")
      .select("*")
      .order("start_time", { ascending: true });

    if (schedulesError) {
      console.error("Error fetching schedules:", schedulesError);
      return { error: "Failed to fetch schedules" };
    }

    if (!schedules) {
      return { data: [] };
    }

    // Fetch participants and assigned staff for each schedule
    const schedulesWithParticipants: ScheduleWithParticipants[] =
      await Promise.all(
        schedules.map(async (schedule) => {
          const { data: participants } = await supabase
            .from("schedule_participants")
            .select("*")
            .eq("schedule_id", schedule.id);

          // Fetch assigned staff profile if exists
          let assignedStaff = null;
          if (schedule.assigned_staff_id) {
            const { data: staffProfile } = await supabase
              .from("profiles")
              .select("user_id, email, role")
              .eq("user_id", schedule.assigned_staff_id)
              .single();

            if (staffProfile) {
              assignedStaff = staffProfile;
            }
          }

          return {
            ...schedule,
            participants: participants || [],
            assigned_staff: assignedStaff,
          };
        })
      );

    return { data: schedulesWithParticipants };
  } catch (error) {
    console.error("Error in getSchedules:", error);
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
}

/**
 * Create a new schedule
 * Accessible by staff and admin roles
 */
export async function createSchedule(input: CreateScheduleInput): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    // Require minimum staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Validate input
    if (!input.title || !input.start_time || !input.end_time) {
      return { error: "Missing required fields" };
    }

    if (new Date(input.end_time) <= new Date(input.start_time)) {
      return { error: "End time must be after start time" };
    }

    if (
      !input.is_all_users &&
      (!input.participant_ids || input.participant_ids.length === 0)
    ) {
      return {
        error: "Please select at least one participant for individual events",
      };
    }

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .insert({
        title: input.title,
        description: input.description || null,
        start_time: input.start_time,
        end_time: input.end_time,
        is_all_users: input.is_all_users,
        created_by: user.id,
        assigned_staff_id: input.assigned_staff_id || null,
      })
      .select()
      .single();

    if (scheduleError || !schedule) {
      console.error("Error creating schedule:", scheduleError);
      return { error: "Failed to create schedule" };
    }

    // If not all users, create participant records
    if (
      !input.is_all_users &&
      input.participant_ids &&
      input.participant_ids.length > 0
    ) {
      const participants = input.participant_ids.map((userId) => ({
        schedule_id: schedule.id,
        user_id: userId,
      }));

      const { error: participantsError } = await supabase
        .from("schedule_participants")
        .insert(participants);

      if (participantsError) {
        console.error("Error creating participants:", participantsError);
        // Rollback schedule creation
        await supabase.from("schedules").delete().eq("id", schedule.id);
        return { error: "Failed to assign participants" };
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in createSchedule:", error);
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
}

/**
 * Delete a schedule
 * Accessible by staff and admin roles
 */
export async function deleteSchedule(scheduleId: string): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    // Require minimum staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Delete schedule (participants will be automatically deleted via CASCADE)
    const { error: deleteError } = await supabase
      .from("schedules")
      .delete()
      .eq("id", scheduleId);

    if (deleteError) {
      console.error("Error deleting schedule:", deleteError);
      return { error: "Failed to delete schedule" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteSchedule:", error);
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
}

/**
 * Get all users for participant selection
 * Accessible by staff and admin roles
 */
export async function getAllUsers(): Promise<{
  data?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    guardian: {
      id: string | null;
      full_name: string | null;
    } | null;
  }>;
  error?: string;
}> {
  try {
    // Require minimum staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Fetch all clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select(
        `
        id,
        first_name,
        last_name,
        guardian_id
      `
      )
      .order("first_name", { ascending: true });

    if (clientsError) {
      console.error("Error fetching users:", clientsError);
      return { error: "Failed to fetch users" };
    }

    if (!clients) {
      return { data: [] };
    }

    // Fetch guardian profiles for all clients
    const guardianIds = clients
      .map((c) => c.guardian_id)
      .filter((id): id is string => id !== null);

    const { data: guardianProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", guardianIds);

    // Create a map of guardian profiles
    const guardianMap = new Map(
      guardianProfiles?.map((g) => [g.user_id, g]) || []
    );

    // Map to expected format
    const users =
      clients.map((client) => {
        const guardianProfile = client.guardian_id
          ? guardianMap.get(client.guardian_id)
          : null;

        return {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          guardian: guardianProfile
            ? {
                id: guardianProfile.user_id,
                full_name: guardianProfile.full_name,
              }
            : null,
        };
      });

    return { data: users };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
}

/**
 * Get staff and admin users for assignment
 * Accessible by staff and admin roles
 */
export async function getStaffUsers(): Promise<{
  data?: Array<{ id: string; email: string; role: string }>;
  error?: string;
}> {
  try {
    // Require minimum staff role
    await requireMinimumRole("staff");

    const supabase = await createClient();

    // Fetch only staff and admin users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, role")
      .in("role", ["staff", "admin"])
      .order("email", { ascending: true });

    if (profilesError) {
      console.error("Error fetching staff users:", profilesError);
      return { error: "Failed to fetch staff users" };
    }

    // Map to expected format
    const users =
      profiles?.map((profile) => ({
        id: profile.user_id,
        email: profile.email,
        role: profile.role,
      })) || [];

    return { data: users };
  } catch (error) {
    console.error("Error in getStaffUsers:", error);
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
}
