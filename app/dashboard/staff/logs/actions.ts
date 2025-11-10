'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/** ---------- Helpers ---------- */
const Latitude = z.preprocess(
  (v) => (v == null || String(v).trim() === '' ? null : Number(v)),
  z.number().gte(-90).lte(90)
).nullable();

const Longitude = z.preprocess(
  (v) => (v == null || String(v).trim() === '' ? null : Number(v)),
  z.number().gte(-180).lte(180)
).nullable();

const OptionalTrimmedString = z.preprocess(
  (v) => (v == null || String(v).trim() === '' ? null : String(v)),
  z.string()
).nullable();

/** ---------- Create ---------- */
const CreateLogSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1),
  content: z.string().min(1),
  latitude: Latitude,
  longitude: Longitude,
  place_name: OptionalTrimmedString,
  place_address: OptionalTrimmedString,
});

export async function createLogAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Parse everything, including geo + place fields
  const parsed = CreateLogSchema.safeParse({
    clientId: formData.get('clientId'),
    name: formData.get('name'),
    content: formData.get('content'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    place_name: formData.get('place_name'),
    place_address: formData.get('place_address'),
  });

  if (!parsed.success) {
    console.error('createLogAction validation error:', parsed.error.flatten());
    throw new Error('Invalid input');
  }

  const { clientId, name, content, latitude, longitude, place_name, place_address } =
    parsed.data;

  const { error } = await supabase.from('log_notes').insert({
    client_id: clientId,
    author_id: user.id,
    name, // author display name snapshot on log_notes
    content,
    latitude, // now stored
    longitude, // now stored
    place_name,
    place_address,
  });

  if (error) throw error;

  // Optional: quick debug breadcrumb for your server logs
  console.log('createLogAction: inserted log with geo', {
    clientId,
    latitude,
    longitude,
    place_name,
    place_address,
  });

  // adjust to your routes
  revalidatePath('/dashboard/staff/logs');
  revalidatePath('/dashboard/staff/service-plans');
}

/** ---------- Update ---------- */
const UpdateLogSchema = z.object({
  logId: z.string().uuid(),
  editorName: z.string().min(1),
  content: z.string().min(1),
});

export async function updateLogAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = UpdateLogSchema.safeParse({
    logId: formData.get('logId'),
    editorName: formData.get('editorName'),
    content: formData.get('content'),
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { logId, editorName, content } = parsed.data;

  // 1) Update the log content itself
  const { error: updErr } = await supabase
    .from('log_notes')
    .update({ content })
    .eq('id', logId);
  if (updErr) throw updErr;

  // 2) Compute next version
  const { data: maxRows, error: maxErr } = await supabase
    .from('log_revisions')
    .select('version')
    .eq('log_id', logId)
    .order('version', { ascending: false })
    .limit(1);
  if (maxErr) throw maxErr;

  const nextVersion = (maxRows?.[0]?.version ?? 0) + 1;

  // 3) Insert the revision (typed editor name) and return it
  const { data: inserted, error: insErr } = await supabase
    .from('log_revisions')
    .insert({
      log_id: logId,
      version: nextVersion,
      editor_id: user.id,
      name: editorName, // editor display name snapshot on log_revisions
      content,
    })
    .select('log_id, version, editor_id, name, edited_at')
    .single();

  if (insErr) throw insErr;
  if (!inserted?.name) {
    throw new Error('Revision inserted but `name` was empty — check triggers/RLS');
  }

  revalidatePath('/dashboard/staff/logs');
  revalidatePath('/dashboard/staff/service-plans');
}

/** ---------- Reads ---------- */
export async function fetchRevisions(logId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('log_revisions')
    .select(`
      version,
      editor_id,
      name,
      content,
      edited_at
    `)
    .eq('log_id', logId)
    .order('version', { ascending: false });

  if (error) {
    console.error('Fetch revisions error:', error);
    throw error;
  }
  return data;
}

export async function fetchClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name
    `)
    .order('first_name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((client: any) => ({
    id: client.id,
    name: `${client.first_name} ${client.last_name}`.trim(),
    first_name: client.first_name,
    last_name: client.last_name,
  }));
}
