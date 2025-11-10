'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function fetchClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      gender,
      likes,
      dislikes,
      communication_prefs,
      communication_preferences,
      emergency_info,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      last_edited_by,
      last_edited_at
    `)
    .eq('id', clientId)
    .single();
  if (error) throw error;
  return data;
}

const UpsertSchema = z.object({
  clientId: z.string().uuid(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  communication_prefs: z.string().optional(),
  emergency_info: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
});

export async function saveAboutAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = UpsertSchema.safeParse({
    clientId: formData.get('clientId'),
    likes: formData.get('likes') ?? '',
    dislikes: formData.get('dislikes') ?? '',
    communication_prefs: formData.get('communication_prefs') ?? '',
    emergency_info: formData.get('emergency_info') ?? '',
    emergency_contact_name: formData.get('emergency_contact_name') ?? '',
    emergency_contact_phone: formData.get('emergency_contact_phone') ?? '',
    emergency_contact_relationship: formData.get('emergency_contact_relationship') ?? '',
  });
  if (!parsed.success) throw new Error('Invalid input');

  const {
    clientId, likes, dislikes, communication_prefs, emergency_info,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  } = parsed.data;

  const { error } = await supabase
    .from('clients')
    .update({
      likes,
      dislikes,
      communication_prefs, // canonical write
      emergency_info,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      last_edited_by: user.id,
      last_edited_at: new Date().toISOString(),
    })
    .eq('id', clientId);

  if (error) throw error;

  revalidatePath(`/dashboard/staff/clients/${clientId}/about`);
}
