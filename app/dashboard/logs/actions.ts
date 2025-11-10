'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server'; // your existing helper
import { z } from 'zod';


const CreateLogSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1),
  content: z.string().min(1),
  latitude: z.preprocess(
    (v) => (v === null || v === '' ? undefined : v),
    z.coerce.number().optional()
  ),
  longitude: z.preprocess(
    (v) => (v === null || v === '' ? undefined : v),
    z.coerce.number().optional()
  ),
  place_name: z.preprocess(
    (v) => (v == null || String(v).trim() === '' ? undefined : v),
    z.string().optional()
  ),
  place_address: z.preprocess(
    (v) => (v == null || String(v).trim() === '' ? undefined : v),
    z.string().optional()
  ),
});


// createLogAction: keep your code, just align revalidations + add a debug line (optional)
export async function createLogAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = CreateLogSchema.parse({
    clientId: formData.get('clientId'),
    name: formData.get('name'),
    content: formData.get('content'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    place_name: formData.get('place_name'),
    place_address: formData.get('place_address'),
  });

  const { clientId, name, content, latitude, longitude, place_name, place_address } = parsed;

  const { error } = await supabase.from('log_notes').insert({
    client_id: clientId,
    author_id: user.id,
    name,
    content,
    latitude,
    longitude,
    place_name,
    place_address,
  });
  if (error) throw error;

  // optional: verify arriving values once during testing
  // console.log('createLogAction parsed:', parsed);

  // ✅ align with your routes
  revalidatePath(`/dashboard/staff/clients/${clientId}`);
  revalidatePath('/dashboard/staff/logs');
}


const UpdateLogSchema = z.object({
  logId: z.string().uuid(),
  content: z.string().min(1),
});
// updateLogAction: align revalidations to your dashboard routes
export async function updateLogAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = UpdateLogSchema.safeParse({
    logId: formData.get('logId'),
    content: formData.get('content'),
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { logId, content } = parsed.data;

  const { error } = await supabase
    .from('log_notes')
    .update({ content })
    .eq('id', logId);
  if (error) throw error;

  // If you know the client id, you can also revalidate that client page.
  revalidatePath('/dashboard/staff/logs');
}

export async function fetchRevisions(logId: string) {
  const supabase = await createClient();

  // Verify exact column names as they appear in the database
  const { data, error } = await supabase
    .from('log_revisions')
    .select(`
      version,
      editor_id,
      content,
      edited_at
    `)
    .eq('log_id', logId)
    .order('version', { ascending: false });

  if (error) {
    console.error('Fetch revisions error:', error); // Add logging
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
  
  // Transform the data to include a computed full name
  return data.map(client => ({
    id: client.id,
    name: `${client.first_name} ${client.last_name}`.trim(),
    first_name: client.first_name,
    last_name: client.last_name
  }));
}
