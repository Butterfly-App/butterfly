'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DOMAINS, REASONS } from './constants'; // constants live in a non-server file

const Status = z.enum(['in_progress', 'completed']);
const Domains = z.enum([...DOMAINS] as [string, ...string[]]);
const NotMetReason = z.enum([...REASONS] as [string, ...string[]]);

const CreateGoalSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  status: Status.default('in_progress'),
  target_date: z.string().min(1), // YYYY-MM-DD
  domain: Domains,
  subgoal_count: z.coerce.number().int().min(0).max(20),
  not_met_reason: z.string().optional().nullable(),
});

export async function createGoalAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = CreateGoalSchema.safeParse({
    clientId: formData.get('clientId'),
    title: formData.get('title'),
    status: formData.get('status') ?? 'in_progress',
    target_date: formData.get('target_date'),
    domain: formData.get('domain'),
    subgoal_count: formData.get('subgoal_count') ?? 0,
    not_met_reason: formData.get('not_met_reason') ?? null,
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { clientId, title, status, target_date, domain, subgoal_count } = parsed.data;

  const today = new Date().toISOString().slice(0,10);
  const overdueNeedsReason = status !== 'completed' && target_date < today;

  const notMet: string | null =
    (formData.get('not_met_reason') ?? '').toString().trim() || null;

  if (overdueNeedsReason && !notMet) {
    throw new Error('Please select a reason for not meeting the due date.');
  }
  if (notMet && !REASONS.includes(notMet as any)) {
    throw new Error('Invalid not-met reason');
  }

  const { data: goalRow, error: insErr } = await supabase
    .from('goals')
    .insert({
      client_id: clientId,
      title,
      status,
      target_date,
      domain,
      not_met_reason: overdueNeedsReason ? notMet : null,
    })
    .select('id')
    .single();
  if (insErr) throw insErr;

  const subgoalTitles: string[] = [];
  for (let i = 0; i < Number(subgoal_count); i++) {
    const t = (formData.get(`subgoal_${i}`) ?? '').toString().trim();
    if (t) subgoalTitles.push(t);
  }
  if (subgoalTitles.length) {
    const rows = subgoalTitles.map((t, idx) => ({
      goal_id: goalRow.id,
      title: t,
      order_index: idx,
    }));
    const { error: subErr } = await supabase.from('goal_subgoals').insert(rows);
    if (subErr) throw subErr;
  }

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}

const UpdateGoalSchema = z.object({
  goalId: z.string().uuid(),
  clientId: z.string().uuid(),
  title: z.string().min(1),
  status: Status,
  target_date: z.string().min(1),
  domain: Domains,
  not_met_reason: z.string().nullable().optional(),
});

export async function updateGoalAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = UpdateGoalSchema.safeParse({
    goalId: formData.get('goalId'),
    clientId: formData.get('clientId'),
    title: formData.get('title'),
    status: formData.get('status'),
    target_date: formData.get('target_date'),
    domain: formData.get('domain'),
    not_met_reason: (formData.get('not_met_reason') ?? null) as string | null,
  });
  if (!parsed.success) throw new Error('Invalid input');

  const { goalId, clientId, title, status, target_date, domain } = parsed.data;

  const today = new Date().toISOString().slice(0,10);
  const overdueNeedsReason = status !== 'completed' && target_date < today;

  const not_met_reason: string | null =
    (formData.get('not_met_reason') ?? '').toString().trim() || null;

  if (overdueNeedsReason && !not_met_reason) {
    throw new Error('Please select a reason for not meeting the due date.');
  }
  if (not_met_reason && !REASONS.includes(not_met_reason as any)) {
    throw new Error('Invalid not-met reason');
  }

  const { error } = await supabase
    .from('goals')
    .update({
      title,
      status,
      target_date,
      domain,
      not_met_reason: overdueNeedsReason ? not_met_reason : null,
    })
    .eq('id', goalId);
  if (error) throw error;

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}

export async function toggleSubgoalAction(...args: any[]) {
  // Support both: (formData) and (prevState, formData)
  const formData: FormData = (args.length === 1 ? args[0] : args[1]) as FormData;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const subgoalId = (formData.get('subgoalId') ?? '').toString();
  const clientId  = (formData.get('clientId')  ?? '').toString();
  const isDone    = (formData.get('is_done')    ?? 'false').toString() === 'true';

  if (!subgoalId) throw new Error('Missing subgoalId');

  const { error } = await supabase
    .from('goal_subgoals')
    .update({ is_done: isDone })
    .eq('id', subgoalId);

  if (error) throw error;

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}

export async function addSubgoalAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const goalId = (formData.get('goalId') ?? '').toString();
  const clientId = (formData.get('clientId') ?? '').toString();
  const title = (formData.get('title') ?? '').toString().trim();
  if (!title) throw new Error('Subgoal title required');

  const { data: last, error: selErr } = await supabase
    .from('goal_subgoals')
    .select('order_index')
    .eq('goal_id', goalId)
    .order('order_index', { ascending: false })
    .limit(1);
  if (selErr) throw selErr;

  const nextIdx = (last?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase
    .from('goal_subgoals')
    .insert({ goal_id: goalId, title, order_index: nextIdx });
  if (error) throw error;

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}

export async function deleteGoalAction(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const goalId = (formData.get('goalId') ?? '').toString();
  const clientId = (formData.get('clientId') ?? '').toString();

  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;

  revalidatePath(`/dashboard/staff/clients/${clientId}/goals`);
}
