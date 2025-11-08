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
  client_id: string | null;
  staff_id: string | null;
};

type Person = { id: string; name: string | null };

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
  const [clients, setClients] = useState<Person[]>([]);
  const [staff, setStaff] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // controlled calendar state
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());

  // fetch data (no joins)
  useEffect(() => {
    (async () => {
      try {
        const [{ data: sched }, { data: c }, { data: s }] = await Promise.all([
          supabase
            .from('schedule')
            .select('id, program, location, start_time, end_time, client_id, staff_id')
            .order('start_time', { ascending: true }),
          supabase.from('clients').select('id, name'),
          supabase.from('staff').select('id, name'),
        ]);

        setRows(sched || []);
        setClients(c || []);
        setStaff(s || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  // build quick lookup maps
  const clientNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of clients) if (p?.id) m[p.id] = p.name ?? '';
    return m;
  }, [clients]);

  const staffNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of staff) if (p?.id) m[p.id] = p.name ?? '';
    return m;
  }, [staff]);

  // ✅ define events
  const events = useMemo(
    () =>
      rows.map((r) => {
        const client = r.client_id ? clientNameById[r.client_id] ?? '' : '';
        const staffName = r.staff_id ? staffNameById[r.staff_id] ?? '' : '';
        const title =
          `${r.program ?? 'Session'}`
          + (client ? ` • ${client}` : '')
          + (r.location ? ` @ ${r.location}` : '');
        return {
          id: String(r.id),
          title,
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          resource: { client, staffName, location: r.location },
        };
      }),
    [rows, clientNameById, staffNameById]
  );

  function EventProp({ event }: any) {
    const client = event.resource?.client ?? '';
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
        <Link href="/schedule/new" className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
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
            view={view}
            date={date}
            onView={(v) => setView(v)}
            onNavigate={(d) => setDate(d)}
            defaultView={Views.WEEK}
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
            step={30}
            timeslots={2}
            popup
            selectable
            components={{ event: EventProp }}
onSelectEvent={(e) => {
  console.log('event clicked:', e);
  const id = e?.id ?? e?.resource?.id;
  if (!id) {
    alert('No id on event');
    return;
  }
  // encode in case it's a UUID or something funky
  const path = `/schedule/${encodeURIComponent(String(id))}`;
  // Make sure this component has 'use client' and router from next/navigation
  router.push(path);
}}

onSelectSlot={({ start, end }) => {
  const qs = new URLSearchParams({
    start: String(start.getTime()),   // ✅ epoch ms
    end: String(end.getTime()),
  });
  router.push(`/schedule/new?${qs.toString()}`);
}}
          />
        </div>
      )}
    </div>
  );
}
