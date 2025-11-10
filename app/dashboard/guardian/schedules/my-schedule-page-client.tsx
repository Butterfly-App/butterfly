"use client";

import { useEffect, useState } from "react";
import { ScheduleCalendar } from "@/components/schedules/schedule-calendar";
import { getSchedules } from "@/app/schedules/actions";
import type { CalendarEvent, ScheduleWithParticipants } from "@/lib/types/schedule";
import { Card } from "@/components/ui/card";

export function MySchedulePageClient() {
  const [schedules, setSchedules] = useState<ScheduleWithParticipants[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true);
      const result = await getSchedules();
      if (result.data) {
        setSchedules(result.data);

        // Convert to calendar events
        const calendarEvents: CalendarEvent[] = result.data.map((schedule) => ({
          id: schedule.id,
          title: schedule.title,
          start: new Date(schedule.start_time),
          end: new Date(schedule.end_time),
          resource: {
            description: schedule.description,
            is_all_users: schedule.is_all_users,
            created_by: schedule.created_by,
            assigned_staff_id: schedule.assigned_staff_id,
          },
        }));
        setEvents(calendarEvents);
      }
      setLoading(false);
    };

    loadSchedules();
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          View your upcoming events and appointments
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>All Users Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Your Personal Events</span>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your schedule...</p>
        </div>
      ) : (
        <ScheduleCalendar
          events={events}
          onSelectEvent={handleSelectEvent}
          selectable={false}
        />
      )}

      {/* Selected Event Details */}
      {selectedEvent && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Event Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-base">{selectedEvent.title}</p>
            </div>

            {selectedEvent.resource?.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-base">{selectedEvent.resource.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Time</label>
                <p className="text-base">{selectedEvent.start.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Time</label>
                <p className="text-base">{selectedEvent.end.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Event Type</label>
              <p className="text-base">
                {selectedEvent.resource?.is_all_users ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    All Users Event
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Personal Event
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Events List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No upcoming events scheduled
            </div>
          ) : (
            schedules
              .filter((schedule) => new Date(schedule.start_time) >= new Date())
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .slice(0, 10)
              .map((schedule) => (
                <div key={schedule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <div className="flex items-start justify-between">
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
                          {schedule.is_all_users ? "All Users" : "Personal"}
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {schedule.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(schedule.start_time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
