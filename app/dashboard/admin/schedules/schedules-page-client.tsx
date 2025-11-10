"use client";

import { useEffect, useState } from "react";
import { ScheduleCalendar } from "@/components/schedules/schedule-calendar";
import { ScheduleForm } from "@/components/schedules/schedule-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSchedules, deleteSchedule } from "@/app/schedules/actions";
import type { CalendarEvent, ScheduleWithParticipants } from "@/lib/types/schedule";
import { Plus, Search, Trash2 } from "lucide-react";

export function SchedulesPageClient() {
  const [schedules, setSchedules] = useState<ScheduleWithParticipants[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleWithParticipants[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "all-users" | "individual">("all");
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    setLoading(true);
    const result = await getSchedules();
    if (result.data) {
      setSchedules(result.data);
      setFilteredSchedules(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...schedules];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          schedule.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === "all-users") {
      filtered = filtered.filter((schedule) => schedule.is_all_users);
    } else if (filterType === "individual") {
      filtered = filtered.filter((schedule) => !schedule.is_all_users);
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchQuery, filterType]);

  // Convert schedules to calendar events
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = filteredSchedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.start_time),
      end: new Date(schedule.end_time),
      resource: {
        description: schedule.description,
        is_all_users: schedule.is_all_users,
        created_by: schedule.created_by,
        assigned_staff_id: schedule.assigned_staff_id,
        assigned_staff: schedule.assigned_staff,
      },
    }));
    setEvents(calendarEvents);
  }, [filteredSchedules]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSlot(null);
    loadSchedules();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    const result = await deleteSchedule(scheduleId);
    if (result.success) {
      loadSchedules();
    } else {
      alert(result.error || "Failed to delete schedule");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Management</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create and manage events for users and guardians
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 space-y-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="all">All Events</option>
              <option value="all-users">All Users Events</option>
              <option value="individual">Individual Events</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>All Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Individual</span>
          </div>
          <div className="ml-auto text-gray-600 dark:text-gray-400">
            Showing {filteredSchedules.length} of {schedules.length} events
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading schedules...</p>
        </div>
      ) : (
        <ScheduleCalendar
          events={events}
          onSelectSlot={handleSelectSlot}
          selectable={true}
        />
      )}

      {/* Schedule List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">All Events</h3>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events found. Create your first event!
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{schedule.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        schedule.is_all_users
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {schedule.is_all_users ? "All Users" : "Individual"}
                    </span>
                  </div>
                  {schedule.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {schedule.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(schedule.start_time).toLocaleString()} -{" "}
                    {new Date(schedule.end_time).toLocaleString()}
                  </div>
                  {schedule.assigned_staff && (
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                      Assigned to: {schedule.assigned_staff.email} ({schedule.assigned_staff.role})
                    </div>
                  )}
                  {!schedule.is_all_users && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Participants: {schedule.participants.length}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <ScheduleForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        defaultStart={selectedSlot?.start}
        defaultEnd={selectedSlot?.end}
      />
    </div>
  );
}
