'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type SchedRow = {
  id: string;
  program: string | null;
  location: string | null;
  notes: string | null;
  start_time: string; // ISO
  end_time: string;   // ISO
  clients?: { name?: string | null } | null;
  staff?: { name?: string | null } | null;
};

export default function ScheduleDetailPage() {
  const params = useParams(); // don't assume typing
  const id = useMemo(() => {
    const raw = (params as any)?.id;
    return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  const router = useRouter();
  const supabase = createClient();

  const [row, setRow] = useState<SchedRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErr('Missing schedule id in route.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('schedule')
          .select(
            'id, program, location, start_time, end_time, notes, clients(name), staff(name)'
          )
          .eq('id', id)
          .single();

        if (error) {
          setErr(error.message);
          setRow(null);
        } else {
          setRow(data as SchedRow);
        }
      } catch (e: any) {
        setErr(e?.message || 'Unknown error loading schedule.');
        setRow(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, supabase]);

  async function updateField(field: keyof SchedRow, value: string) {
    if (!id) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const { error } = await supabase.from('schedule').update({ [field]: value }).eq('id', id);
      if (error) {
        setErr(error.message);
      } else {
        setMsg('✅ Saved');
        setRow((prev) => (prev ? { ...prev, [field]: value } as SchedRow : prev));
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  // Safe date formatting
  const startText = row?.start_time ? new Date(row.start_time).toLocaleString() : '—';
  const endText = row?.end_time ? new Date(row.end_time).toLocaleString() : '—';

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
          Back
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
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Session Details</h1>
      <div className="text-sm text-gray-600">
        Client: {row.clients?.name ?? '—'} · Staff: {row.staff?.name ?? '—'}
      </div>

      <label className="block">
        <span className="text-sm">Program</span>
        <input
          className="w-full border p-2 rounded"
          defaultValue={row.program ?? ''}
          onBlur={(e) => updateField('program', e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Location</span>
        <input
          className="w-full border p-2 rounded"
          defaultValue={row.location ?? ''}
          onBlur={(e) => updateField('location', e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea
          className="w-full border p-2 rounded"
          rows={3}
          defaultValue={row.notes ?? ''}
          onBlur={(e) => updateField('notes', e.target.value)}
        />
      </label>

      <div className="text-sm">
        Start: {startText} <br />
        End: {endText}
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded bg-gray-200 px-3 py-2" onClick={() => router.push('/schedule')}>
          Back
        </button>
        {saving && <span className="text-xs">Saving…</span>}
        {msg && <span className="text-xs">{msg}</span>}
      </div>
    </div>
  );
}
