'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server'; // your existing helper
import { z } from 'zod';

// in actions.ts
const CreateLogSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1),
  content: z.string().min(1),
  latitude: z.preprocess((v) => (v === null || v === '' ? undefined : v), z.coerce.number().optional()),
  longitude: z.preprocess((v) => (v === null || v === '' ? undefined : v), z.coerce.number().optional()),
  place_name: z.preprocess((v) => (v == null || String(v).trim() === '' ? undefined : v), z.string().optional()),
  place_address: z.preprocess((v) => (v == null || String(v).trim() === '' ? undefined : v), z.string().optional()),
});


export async function createLogAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = CreateLogSchema.safeParse({
    clientId: formData.get('clientId'),
    content: formData.get('content'),
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { clientId, content } = parsed.data;

  const { error } = await supabase.from('log_notes').insert({
    client_id: clientId,
    author_id: user.id,
    content,
  });
  if (error) throw error;

  revalidatePath('/logs');
}

const UpdateLogSchema = z.object({
  logId: z.string().uuid(),
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
    content: formData.get('content'),
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { logId, content } = parsed.data;

  // Updating content triggers the DB revision trigger
  const { error } = await supabase
    .from('log_notes')
    .update({ content })
    .eq('id', logId);

  if (error) throw error;

  revalidatePath(`/logs/${logId}`);
  revalidatePath('/logs');
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
      name,
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
