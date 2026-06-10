import { useCallback, useEffect, useState } from "react";
import {
  createLocalStudySet,
  createStudySet,
  deleteStudySet,
  getDashboardStats,
  listStudySetsWithQuestions,
  type DashboardStats,
  type RepositoryMode,
  type StudySetInput,
  updateStudySetDetails,
} from "../../lib/studyRepository";
import type { StudySet } from "../../types/domain";
import { validateQuestionInput, validateStudySetInput } from "../../utils/validation";

const defaultStats: DashboardStats = {
  sessionsThisWeek: 0,
  totalStudyMinutes: 0,
  averageAccuracy: 67,
  weakestSubject: "Demo",
  streakLabel: "Demo",
};

export function useStudyLibrary() {
  const [sets, setSets] = useState<StudySet[]>([]);
  const [mode, setMode] = useState<RepositoryMode>("demo");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("Cargando materias...");
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const [library, nextStats] = await Promise.all([listStudySetsWithQuestions(), getDashboardStats()]);
      setSets(library.sets);
      setMode(library.mode);
      setStats(nextStats);
      setMessage(library.message);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar las materias.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addSet(input: StudySetInput) {
    const setValidation = validateStudySetInput(input);
    if (!setValidation.ok) {
      setMessage(setValidation.message);
      setStatus("error");
      return false;
    }

    const questionValidation = validateQuestionInput(input.question);
    if (!questionValidation.ok) {
      setMessage(questionValidation.message);
      setStatus("error");
      return false;
    }

    setStatus("saving");
    try {
      const created = mode === "demo" ? createLocalStudySet(input) : await createStudySet(input);
      setSets((current) => [created, ...current]);
      setMessage(mode === "demo" ? "Materia creada localmente en modo demo." : "Materia guardada en Supabase.");
      setStatus("ready");
      return true;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo crear la materia.");
      return false;
    }
  }

  async function updateSet(set: StudySet, input: Pick<StudySetInput, "title" | "subject" | "minutes">) {
    const validation = validateStudySetInput({ ...input });
    if (!validation.ok) {
      setMessage(validation.message);
      setStatus("error");
      return false;
    }

    setStatus("saving");
    try {
      const updated = mode === "demo" ? { ...set, ...input } : await updateStudySetDetails(set, input);
      setSets((current) =>
        current.map((item) =>
          item.id === set.id
            ? {
                ...item,
                ...updated,
                questions: item.questions,
              }
            : item,
        ),
      );
      setMessage(mode === "demo" ? "Materia actualizada localmente." : "Materia actualizada.");
      setStatus("ready");
      return true;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar la materia.");
      return false;
    }
  }

  async function removeSet(set: StudySet) {
    setStatus("saving");
    try {
      if (mode !== "demo") await deleteStudySet(set);
      setSets((current) => current.filter((item) => item.id !== set.id));
      setMessage(mode === "demo" ? "Materia eliminada localmente." : "Materia eliminada.");
      setStatus("ready");
      return true;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la materia.");
      return false;
    }
  }

  return {
    addSet,
    message,
    mode,
    refresh,
    removeSet,
    sets,
    stats,
    status,
    updateSet,
  };
}
