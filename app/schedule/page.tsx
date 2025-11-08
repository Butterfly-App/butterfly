'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enCA from 'date-fns/locale/en-CA';

type ScheduleRow = {
  id: string;
  program: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  clients?: { name?: string | null } | null;
  staff?: { name?: string | null } | null;
};

const locales = { 'en-CA': enCA };
const localizer = dateFnsLocalizer({
  format,
  parse: (dateStr: string, fmt: string) => parse(dateStr, fmt, new Date()),
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function ScheduleCalendarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 make the calendar controlled
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('schedule')
        .select('id, program, location, start_time, end_time, clients(name), staff(name)')
        .order('start_time', { ascending: true });

      setRows(error ? [] : (data || []));
      setLoading(false);
    })();
  }, [supabase]);

  const events = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        title:
          `${r.program ?? 'Session'}`
          + (r.clients?.name ? ` • ${r.clients?.name}` : '')
          + (r.location ? ` @ ${r.location}` : ''),
        start: new Date(r.start_time),
        end: new Date(r.end_time),
        resource: r,
      })),
    [rows]
  );

  function EventProp({ event }: any) {
    const client = event.resource?.clients?.name ?? '';
    const loc = event.resource?.location ?? '';
    return (
      <div className="leading-tight">
        <div className="font-medium">{event.title}</div>
        <div className="text-xs opacity-80">
          {client ? `Client: ${client}` : ''}{client && loc ? ' · ' : ''}{loc}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <Link
          href="/schedule/new"
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          + New
        </Link>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ height: '75vh' }}>
          <Calendar
            localizer={localizer}
            events={events}
            // 👇 controlled props
            view={view}
            date={date}
            onView={(v) => setView(v)}
            onNavigate={(newDate) => setDate(newDate)}
            //
            defaultView={Views.WEEK}
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
            step={30}
            timeslots={2}
            popup
            selectable
            components={{ event: EventProp }}
            onSelectEvent={(e) => router.push(`/schedule/${e.id}`)}
            onSelectSlot={({ start, end }) => {
              const qs = new URLSearchParams({
                start_time: start.toISOString(),
                end_time: end.toISOString(),
              });
              router.push(`/schedule/new?${qs.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
