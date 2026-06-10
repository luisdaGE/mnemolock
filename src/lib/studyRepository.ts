import { studySets as demoStudySets } from "../data/studySets";
import type { Database } from "../types/database";
import type { Question, StudySet } from "../types/domain";
import { getCurrentUserId, isSupabaseConfigured, supabase } from "./supabase";

type StudySetRow = Database["public"]["Tables"]["study_sets"]["Row"];
type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];

export type RepositoryMode = "demo" | "synced";

export type StudySetInput = {
  title: string;
  subject: string;
  minutes: number;
  question: {
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    tag: string;
  };
};

export type DashboardStats = {
  sessionsThisWeek: number;
  totalStudyMinutes: number;
  averageAccuracy: number;
  weakestSubject: string;
  streakLabel: string;
};

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    sourceChunkId: row.source_chunk_id,
    prompt: row.prompt,
    options: row.options,
    answerIndex: row.answer_index,
    explanation: row.explanation ?? "Sin explicacion guardada.",
    tag: row.difficulty,
  };
}

function mapStudySet(row: StudySetRow, questions: QuestionRow[]): StudySet {
  const mappedQuestions = questions.map(mapQuestion);
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    subject: row.subject,
    minutes: row.default_minutes,
    sourceNotes: row.source_notes,
    createdAt: row.created_at,
    questions:
      mappedQuestions.length > 0
        ? mappedQuestions
        : [
            {
              prompt: "Agrega una pregunta para desbloquear esta materia.",
              options: ["Entendido", "Despues"],
              answerIndex: 0,
              explanation: "Las materias necesitan preguntas para funcionar como bloqueo cognitivo.",
              tag: "setup",
            },
          ],
  };
}

function localId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLocalStudySet(input: StudySetInput): StudySet {
  return {
    id: localId("local-set"),
    title: input.title.trim(),
    subject: input.subject.trim(),
    minutes: input.minutes,
    sourceNotes: "Materia creada localmente en modo demo.",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: localId("local-question"),
        prompt: input.question.prompt.trim(),
        options: input.question.options.map((option) => option.trim()).filter(Boolean),
        answerIndex: input.question.answerIndex,
        explanation: input.question.explanation.trim() || "Respuesta marcada manualmente.",
        tag: input.question.tag.trim() || "manual",
      },
    ],
  };
}

export async function listStudySetsWithQuestions() {
  if (!isSupabaseConfigured || !supabase) {
    return { mode: "demo" as RepositoryMode, sets: demoStudySets, message: "Supabase no configurado; usando demo." };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { mode: "demo" as RepositoryMode, sets: demoStudySets, message: "Inicia sesion para guardar materias." };

  const { data: sets, error } = await supabase
    .from("study_sets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  if (!sets.length) return { mode: "synced" as RepositoryMode, sets: [], message: "Aun no tienes materias guardadas." };

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .in(
      "study_set_id",
      sets.map((set) => set.id),
    );
  if (questionsError) throw questionsError;

  const groupedQuestions = new Map<string, QuestionRow[]>();
  for (const question of questions ?? []) {
    groupedQuestions.set(question.study_set_id, [...(groupedQuestions.get(question.study_set_id) ?? []), question]);
  }

  return {
    mode: "synced" as RepositoryMode,
    sets: sets.map((set) => mapStudySet(set, groupedQuestions.get(set.id) ?? [])),
    message: "Materias sincronizadas.",
  };
}

export async function createStudySet(input: StudySetInput) {
  if (!isSupabaseConfigured || !supabase) return createLocalStudySet(input);

  const userId = await getCurrentUserId();
  if (!userId) return createLocalStudySet(input);

  const { data: set, error } = await supabase
    .from("study_sets")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      subject: input.subject.trim(),
      default_minutes: input.minutes,
      source_notes: "Creada desde dashboard.",
    })
    .select("*")
    .single();
  if (error) throw error;

  const cleanOptions = input.question.options.map((option) => option.trim()).filter(Boolean);
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      study_set_id: set.id,
      prompt: input.question.prompt.trim(),
      options: cleanOptions,
      answer_index: input.question.answerIndex,
      explanation: input.question.explanation.trim() || "Respuesta marcada manualmente.",
      difficulty: "medium",
      origin: "manual",
    })
    .select("*")
    .single();
  if (questionError) throw questionError;

  return mapStudySet(set, [question]);
}

export async function updateStudySetDetails(set: StudySet, input: Pick<StudySetInput, "title" | "subject" | "minutes">) {
  if (!isSupabaseConfigured || !supabase || !set.userId) {
    return {
      ...set,
      title: input.title.trim(),
      subject: input.subject.trim(),
      minutes: input.minutes,
    };
  }

  const { data, error } = await supabase
    .from("study_sets")
    .update({
      title: input.title.trim(),
      subject: input.subject.trim(),
      default_minutes: input.minutes,
    })
    .eq("id", set.id)
    .select("*")
    .single();
  if (error) throw error;

  return mapStudySet(data, []);
}

export async function deleteStudySet(set: StudySet) {
  if (!isSupabaseConfigured || !supabase || !set.userId) return;

  const { error } = await supabase.from("study_sets").delete().eq("id", set.id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      sessionsThisWeek: 0,
      totalStudyMinutes: 0,
      averageAccuracy: 67,
      weakestSubject: "Demo",
      streakLabel: "Demo",
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      sessionsThisWeek: 0,
      totalStudyMinutes: 0,
      averageAccuracy: 67,
      weakestSubject: "Inicia sesion",
      streakLabel: "Demo",
    };
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: sessions, error: sessionsError } = await supabase
    .from("focus_sessions")
    .select("duration_minutes,status,started_at")
    .eq("user_id", userId)
    .gte("started_at", weekStart.toISOString());
  if (sessionsError) throw sessionsError;

  const { data: attempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("required_correct,correct_count,study_set_id,created_at")
    .eq("user_id", userId)
    .gte("created_at", weekStart.toISOString());
  if (attemptsError) throw attemptsError;

  const accuracy =
    attempts && attempts.length > 0
      ? Math.round(
          (attempts.reduce((sum, attempt) => sum + attempt.correct_count / Math.max(attempt.required_correct, 1), 0) /
            attempts.length) *
            100,
        )
      : 0;

  return {
    sessionsThisWeek: sessions?.length ?? 0,
    totalStudyMinutes: sessions?.reduce((sum, session) => sum + session.duration_minutes, 0) ?? 0,
    averageAccuracy: accuracy,
    weakestSubject: attempts?.length ? "Revisar intentos" : "Sin intentos",
    streakLabel: sessions?.length ? `${Math.min(sessions.length, 7)} dias` : "0 dias",
  };
}
