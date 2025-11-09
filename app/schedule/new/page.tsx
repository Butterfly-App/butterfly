'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

type Row = { id: string; name: string };

const toInputLocal = (d: Date | null) => (d ? format(d, "yyyy-MM-dd'T'HH:mm") : '');
const localInputToUTC = (s: string) => (s ? new Date(s).toISOString() : null);

function NewScheduleForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [clients, setClients] = useState<Row[]>([]);
  const [staff, setStaff] = useState<Row[]>([]);
  const [form, setForm] = useState({
    client_id: '',
    staff_id: '',
    program: '',
    location: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Prefill from calendar selection (?start=<ms>&end=<ms>) without tz shift
  useEffect(() => {
    const startMs = searchParams.get('start');
    const endMs = searchParams.get('end');
    setForm((f) => ({
      ...f,
      start_time: startMs ? toInputLocal(new Date(Number(startMs))) : f.start_time,
      end_time: endMs ? toInputLocal(new Date(Number(endMs))) : f.end_time,
    }));
  }, [searchParams]);

  // Load dropdown data
  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from('clients').select('id,name').order('name');
      const { data: s } = await supabase.from('staff').select('id,name').order('name');
      setClients(c || []);
      setStaff(s || []);
    })();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Optional: quick guard
    if (form.start_time && form.end_time) {
      const start = new Date(form.start_time).getTime();
      const end = new Date(form.end_time).getTime();
      if (end <= start) {
        setSaving(false);
        setMessage('❌ End time must be after start time');
        return;
      }
    }

    const payload = {
      client_id: form.client_id || null,
      staff_id: form.staff_id || null,
      program: form.program || null,
      location: form.location || null,
      start_time: localInputToUTC(form.start_time), // store UTC
      end_time: localInputToUTC(form.end_time),     // store UTC
      notes: form.notes || null,
    };

    const { error } = await supabase.from('schedule').insert([payload]);
    setSaving(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      // Go back to calendar so you immediately see the event
      window.location.href = '/schedule';
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Schedule</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label>
          <span className="block text-sm font-medium mb-1">Client</span>
          <select
            className="w-full border p-2 rounded"
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            required
          >
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="block text-sm font-medium mb-1">Staff</span>
          <select
            className="w-full border p-2 rounded"
            value={form.staff_id}
            onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
            required
          >
            <option value="">Select staff…</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Program (e.g., Art Workshop)"
          value={form.program}
          onChange={(e) => setForm({ ...form, program: e.target.value })}
        />

        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Location (e.g., Chrysalis Center)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>
        </div>

        <textarea
          className="w-full border p-2 rounded"
          rows={3}
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white py-2 rounded"
        >
          {saving ? 'Saving…' : 'Save Schedule'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}

// New wrapper component
export default function NewSchedulePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto p-6">Loading...</div>}>
      <NewScheduleForm />
    </Suspense>
  );
}
