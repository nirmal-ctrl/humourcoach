import type { AIProviderId } from '@/domain/aiModels';
import type { ScreeningAnswers } from '@/domain/personalization';
import { createLearningPlan } from '@/domain/personalization';
import { supabase } from '@/lib/supabase';
import { getProviderAPIKey } from '@/services/apiKeyStorage';

export type CoachingFeedback = {
  attemptId: number;
  whatWorked: string;
  tryNext: string;
  setupScore: number;
  surpriseScore: number;
  brevityScore: number;
  safetyStatus: 'safe' | 'review' | 'blocked';
};

export async function saveScreeningResponse(answers: ScreeningAnswers) {
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { error } = await supabase.from('screening_responses').upsert({
    user_id: data.user.id,
    goal: answers.goal,
    custom_goal: answers.customGoal ?? null,
    practice_context: answers.context,
    custom_context: answers.customContext ?? null,
    humour_style: answers.style,
    custom_style: answers.customStyle ?? null,
    ease: answers.ease,
    additional_details: answers.additionalDetails ?? null,
    diagnostic: answers.diagnostic,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  const plan = createLearningPlan(answers);
  const firstSlug = plan.startingTechnique === 'Misdirection'
    ? 'turn-the-expectation'
    : plan.startingTechnique === 'Rule of Three' ? 'three-beats' : 'make-it-big';
  const { data: lessons } = await supabase.from('lessons').select('id, slug').in('slug', ['turn-the-expectation', 'three-beats', 'make-it-big']);
  if (lessons?.length) {
    const ordered = [...lessons].sort((left, right) => left.slug === firstSlug ? -1 : right.slug === firstSlug ? 1 : left.id - right.id);
    await supabase.from('course_assignments').upsert(
      ordered.map((lesson, index) => ({
        user_id: data.user!.id,
        lesson_id: lesson.id,
        position: index + 1,
        status: index === 0 ? 'available' : 'locked',
        recommended_reason: index === 0 ? plan.reason : 'Added to build your technique range.',
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,lesson_id' },
    );
  }
  return true;
}

export async function saveAISelection(provider: AIProviderId, model: string) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from('profiles').update({ ai_provider: provider, ai_model: model, updated_at: new Date().toISOString() }).eq('id', data.user.id);
}

export type ProgressSnapshot = {
  attemptCount: number;
  practicedMinutes: number;
  streak: number;
  setup: number;
  surprise: number;
  brevity: number;
};

export async function getProgressSnapshot(): Promise<ProgressSnapshot> {
  const empty = { attemptCount: 0, practicedMinutes: 0, streak: 0, setup: 0, surprise: 0, brevity: 0 };
  if (!supabase) return empty;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return empty;
  const { data, error } = await supabase
    .from('attempts')
    .select('setup_score, surprise_score, brevity_score, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error || !data?.length) return empty;
  const average = (key: 'setup_score' | 'surprise_score' | 'brevity_score') => Math.round(data.reduce((sum, row) => sum + row[key], 0) / data.length / 5 * 100);
  const practiceDays = new Set(data.map((row) => row.created_at.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const day = cursor.toISOString().slice(0, 10);
    if (!practiceDays.has(day)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    attemptCount: data.length,
    practicedMinutes: data.length * 4,
    streak,
    setup: average('setup_score'),
    surprise: average('surprise_score'),
    brevity: average('brevity_score'),
  };
}

export async function getCoachingFeedback(input: { attemptText: string; provider: AIProviderId; model: string; drillId?: number }) {
  if (!supabase) throw new Error('Connect Supabase first. Copy .env.example to .env and add your project URL and publishable key.');
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Sign in from Profile before requesting AI coaching.');

  const providerApiKey = await getProviderAPIKey(input.provider);
  const { data, error } = await supabase.functions.invoke<CoachingFeedback>('critique-attempt', {
    body: { ...input, providerApiKey: providerApiKey || undefined },
  });
  if (error) {
    const context = await error.context?.json?.().catch(() => null);
    throw new Error(context?.error ?? error.message ?? 'Coaching is temporarily unavailable.');
  }
  if (!data) throw new Error('The coaching service returned no feedback.');
  return data;
}
