"use client";

import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent } from "@/lib/types/schedule";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  selectable?: boolean;
  view?: View;
  onViewChange?: (view: View) => void;
}

export function ScheduleCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  selectable = false,
  view = "month",
  onViewChange,
}: ScheduleCalendarProps) {
  return (
    <div className="h-[600px] bg-white rounded-lg border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable={selectable}
        view={view}
        onView={onViewChange}
        views={["month", "week", "day", "agenda"]}
        style={{ height: "100%" }}
        eventPropGetter={(event) => {
          const style: React.CSSProperties = {
            backgroundColor: event.resource?.is_all_users ? "#3b82f6" : "#10b981",
            borderRadius: "4px",
            border: "none",
            color: "white",
          };
          return { style };
        }}
        popup
      />
    </div>
  );
}
