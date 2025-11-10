export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_by: string | null;
  assigned_staff_id: string | null;
  is_all_users: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleParticipant {
  id: string;
  schedule_id: string;
  user_id: string;
  created_at: string;
}

export interface AssignedStaffProfile {
  user_id: string;
  email: string;
  role: string;
}

export interface ScheduleWithParticipants extends Schedule {
  participants: ScheduleParticipant[];
  assigned_staff?: AssignedStaffProfile | null;
}

export interface ScheduleFormData {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  is_all_users: boolean;
  participant_ids?: string[];
  assigned_staff_id?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    description: string | null;
    is_all_users: boolean;
    created_by: string | null;
    assigned_staff_id: string | null;
    assigned_staff?: AssignedStaffProfile | null;
  };
}
