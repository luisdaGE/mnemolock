import { createClient } from "@supabase/supabase-js";
import type { Question, StudySet } from "../types/domain";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export async function signInWithGoogle() {
  if (!supabase) {
    return {
      error: new Error("El inicio de sesion estara disponible muy pronto."),
    };
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return {
      error: new Error("El inicio de sesion estara disponible muy pronto."),
    };
  }

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    return {
      error: new Error("El registro estara disponible muy pronto."),
    };
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined) {
  return Boolean(value && uuidPattern.test(value));
}

export async function getCurrentUserId() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function createFocusSession({
  set,
  unlockTarget,
  strictMode,
  cooldownMinutes,
}: {
  set: StudySet;
  unlockTarget: number;
  strictMode: boolean;
  cooldownMinutes: number;
}) {
  if (!supabase) return { id: null, mode: "demo" as const, reason: "Supabase no configurado." };
  if (!isUuid(set.id)) return { id: null, mode: "demo" as const, reason: "Materia demo sin UUID persistible." };

  const userId = await getCurrentUserId();
  if (!userId) return { id: null, mode: "demo" as const, reason: "Sesion anonima." };

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id: userId,
      study_set_id: set.id,
      duration_minutes: set.minutes,
      unlock_score_required: unlockTarget,
      status: "locked",
      metadata: {
        cooldown_minutes: cooldownMinutes,
        strict_mode: strictMode,
        platform: "desktop_pwa",
      },
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id, mode: "synced" as const, reason: null };
}

export async function finishFocusSession({
  focusSessionId,
  passed,
  correctCount,
}: {
  focusSessionId: string | null;
  passed: boolean;
  correctCount: number;
}) {
  if (!supabase || !focusSessionId) return;

  const { error } = await supabase
    .from("focus_sessions")
    .update({
      status: passed ? "unlocked" : "failed",
      ended_at: new Date().toISOString(),
      metadata: {
        completed_from: "desktop_pwa",
        final_correct_count: correctCount,
      },
    })
    .eq("id", focusSessionId);

  if (error) throw error;
}

export async function recordQuizAttempt({
  focusSessionId,
  set,
  answers,
  requiredCorrect,
  correctCount,
  passed,
}: {
  focusSessionId: string | null;
  set: StudySet;
  answers: number[];
  requiredCorrect: number;
  correctCount: number;
  passed: boolean;
}) {
  if (!supabase) return { mode: "demo" as const, reason: "Supabase no configurado." };
  if (!isUuid(set.id)) return { mode: "demo" as const, reason: "Materia demo sin UUID persistible." };

  const userId = await getCurrentUserId();
  if (!userId) return { mode: "demo" as const, reason: "Sesion anonima." };

  const { data: quizAttempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      focus_session_id: focusSessionId,
      study_set_id: set.id,
      required_correct: requiredCorrect,
      correct_count: correctCount,
      status: passed ? "passed" : "failed",
    })
    .select("id")
    .single();

  if (error) throw error;

  const questionAttempts = set.questions
    .map((question: Question, index) => ({
      question,
      selectedAnswerIndex: answers[index],
    }))
    .filter(({ question, selectedAnswerIndex }) => isUuid(question.id) && selectedAnswerIndex !== undefined)
    .map(({ question, selectedAnswerIndex }) => ({
      quiz_attempt_id: quizAttempt.id,
      question_id: question.id!,
      selected_answer_index: selectedAnswerIndex,
      is_correct: selectedAnswerIndex === question.answerIndex,
    }));

  if (questionAttempts.length > 0) {
    const { error: questionError } = await supabase.from("question_attempts").insert(questionAttempts);
    if (questionError) throw questionError;
  }

  return { mode: "synced" as const, reason: null };
}
