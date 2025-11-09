// app/schedule/new/NewScheduleClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Row = { id: string; name: string };

type Props = {
  initialStartISO?: string;
  initialEndISO?: string;
};

export default function NewScheduleClient({ initialStartISO, initialEndISO }: Props) {
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

  // Prefill from server-provided params
  useEffect(() => {
    const toLocalInput = (iso?: string) =>
      iso ? new Date(iso).toISOString().slice(0, 16) : '';
    setForm((f) => ({
      ...f,
      start_time: toLocalInput(initialStartISO),
      end_time: toLocalInput(initialEndISO),
    }));
  }, [initialStartISO, initialEndISO]);

  // Load dropdowns
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
    const { error } = await supabase.from('schedule').insert([form]);
    setSaving(false);
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage('✅ Schedule created!');
      setForm({
        client_id: '',
        staff_id: '',
        program: '',
        location: '',
        start_time: '',
        end_time: '',
        notes: '',
      });
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

        <button type="submit" disabled={saving} className="bg-blue-600 text-white py-2 rounded">
          {saving ? 'Saving…' : 'Save Schedule'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
