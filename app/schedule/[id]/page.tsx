'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Sched = {
  id: string;
  program: string | null;
  location: string | null;
  notes: string | null;
  start_time: string;  // ISO/timestamptz
  end_time: string;    // ISO/timestamptz
  client_id: string | null;
  staff_id: string | null;
};

type Person = { id: string; name: string | null };

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [row, setRow] = useState<Sched | null>(null);
  const [client, setClient] = useState<Person | null>(null);
  const [staff, setStaff] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // fetch the schedule row, then (optionally) fetch names
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) get schedule row (no joins = works even without FKs)
        const { data: sched, error } = await supabase
          .from('schedule')
          .select('id, program, location, notes, start_time, end_time, client_id, staff_id')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (cancelled) return;
        setRow(sched as Sched);

        // 2) fetch names if present
        if (sched?.client_id) {
          const { data } = await supabase
            .from('clients')
            .select('id, name')
            .eq('id', sched.client_id)
            .single();
          if (!cancelled) setClient(data as Person);
        }
        if (sched?.staff_id) {
          const { data } = await supabase
            .from('staff')
            .select('id, name')
            .eq('id', sched.staff_id)
            .single();
          if (!cancelled) setStaff(data as Person);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load schedule');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function updateField(field: keyof Sched, value: string | null) {
    try {
      setSaving(true);
      setMsg(null);
      setErr(null);
      const { error } = await supabase
        .from('schedule')
        .update({ [field]: value })
        .eq('id', id);
      if (error) throw error;

      // reflect locally
      setRow((r) => (r ? { ...r, [field]: value } as Sched : r));
      setMsg('✅ Saved');
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const startText = useMemo(
    () => (row?.start_time ? new Date(row.start_time).toLocaleString() : '—'),
    [row?.start_time]
  );
  const endText = useMemo(
    () => (row?.end_time ? new Date(row.end_time).toLocaleString() : '—'),
    [row?.end_time]
  );

  if (loading) return <div className="p-6">Loading…</div>;

  if (err) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-3">
        <h1 className="text-2xl font-semibold">Session Details</h1>
        <p className="text-red-600 text-sm">Error: {err}</p>
        <button
          className="rounded bg-gray-200 px-3 py-2"
          onClick={() => router.push('/schedule')}
        >
          ← Back
        </button>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="p-6">
        Not found
        <div className="mt-3">
          <button className="rounded bg-gray-200 px-3 py-2" onClick={() => router.push('/schedule')}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Session Details</h1>

      <div className="text-sm text-gray-600">
        <div><span className="font-medium">Client:</span> {client?.name ?? '—'}</div>
        <div><span className="font-medium">Staff:</span> {staff?.name ?? '—'}</div>
      </div>

      <label className="block">
        <span className="text-sm">Program</span>
        <input
          className="w-full border p-2 rounded"
          defaultValue={row.program ?? ''}
          onBlur={(e) => updateField('program', e.target.value || null)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Location</span>
        <input
          className="w-full border p-2 rounded"
          defaultValue={row.location ?? ''}
          onBlur={(e) => updateField('location', e.target.value || null)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea
          className="w-full border p-2 rounded"
          rows={3}
          defaultValue={row.notes ?? ''}
          onBlur={(e) => updateField('notes', e.target.value || null)}
        />
      </label>

      <div className="text-sm">
        <div><span className="font-medium">Start:</span> {startText}</div>
        <div><span className="font-medium">End:</span> {endText}</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded bg-gray-200 px-3 py-2" onClick={() => router.push('/schedule')}>
          ← Back
        </button>
        {saving && <span className="text-xs">Saving…</span>}
        {msg && <span className="text-xs">{msg}</span>}
      </div>
    </div>
  );
}
