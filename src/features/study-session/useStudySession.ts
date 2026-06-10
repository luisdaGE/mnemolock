import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config/appConfig";
import { studySets } from "../../data/studySets";
import {
  createFocusSession,
  finishFocusSession,
  isSupabaseConfigured,
  recordQuizAttempt,
} from "../../lib/supabase";
import type { Question, SessionState, StudySet, SyncStatus } from "../../types/domain";
import { countCorrectAnswers, getInitialSeconds } from "../../utils/study";

export function useStudySession(availableSets: StudySet[] = studySets) {
  const sessionSets = availableSets.length > 0 ? availableSets : studySets;
  const [selectedSetId, setSelectedSetId] = useState(sessionSets[0].id);
  const selectedSet = sessionSets.find((set) => set.id === selectedSetId) ?? sessionSets[0];
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [secondsLeft, setSecondsLeft] = useState(getInitialSeconds(selectedSet));
  const [answers, setAnswers] = useState<number[]>([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [strictMode, setStrictMode] = useState(true);
  const [unlockTarget, setUnlockTarget] = useState(appConfig.baseRequiredCorrect);
  const [cooldownMinutes, setCooldownMinutes] = useState(appConfig.defaultCooldownMinutes);
  const [activeFocusSessionId, setActiveFocusSessionId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured ? "idle" : "demo");
  const [syncMessage, setSyncMessage] = useState(
    isSupabaseConfigured ? "Listo para sincronizar si inicias sesion." : "Demo web: Supabase no esta configurado.",
  );

  const correctCount = useMemo(() => countCorrectAnswers(answers, selectedSet), [answers, selectedSet]);
  const progress = Math.round(((getInitialSeconds(selectedSet) - secondsLeft) / getInitialSeconds(selectedSet)) * 100);
  const currentQuestion: Question = selectedSet.questions[activeQuestion] ?? selectedSet.questions[0];
  const isLocked = sessionState === "locked" || sessionState === "quiz";

  useEffect(() => {
    if (!sessionSets.some((set) => set.id === selectedSetId)) {
      setSelectedSetId(sessionSets[0].id);
    }
  }, [selectedSetId, sessionSets]);

  useEffect(() => {
    setSecondsLeft(getInitialSeconds(selectedSet));
    setAnswers([]);
    setActiveQuestion(0);
    setUnlockTarget(Math.min(appConfig.baseRequiredCorrect, selectedSet.questions.length));
    setSessionState("setup");
    setActiveFocusSessionId(null);
  }, [selectedSet]);

  useEffect(() => {
    if (sessionState !== "locked") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setSessionState("quiz");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionState]);

  useEffect(() => {
    if (!isLocked) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      const navWithWakeLock = navigator as Navigator & {
        wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
      };
      wakeLock = (await navWithWakeLock.wakeLock?.request("screen").catch(() => null)) ?? null;
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    requestWakeLock();

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      wakeLock?.release().catch(() => undefined);
    };
  }, [isLocked]);

  async function startSession() {
    setSecondsLeft(getInitialSeconds(selectedSet));
    setAnswers([]);
    setActiveQuestion(0);
    setSyncStatus("syncing");
    setSyncMessage("Preparando sesion...");
    setSessionState("locked");
    document.documentElement.requestFullscreen?.().catch(() => undefined);

    try {
      const result = await createFocusSession({
        cooldownMinutes,
        set: selectedSet,
        strictMode,
        unlockTarget,
      });
      setActiveFocusSessionId(result.id);
      setSyncStatus(result.mode === "synced" ? "synced" : "demo");
      setSyncMessage(
        result.mode === "synced"
          ? "Sesion sincronizada con Supabase."
          : `${result.reason} El bloqueo corre como demo local.`,
      );
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "No se pudo sincronizar la sesion.");
    }
  }

  async function finishQuiz(nextAnswers: number[], passed: boolean, nextCorrect: number) {
    setSyncStatus("syncing");
    setSyncMessage("Guardando intento de quiz...");

    try {
      await recordQuizAttempt({
        answers: nextAnswers,
        correctCount: nextCorrect,
        focusSessionId: activeFocusSessionId,
        passed,
        requiredCorrect: unlockTarget,
        set: selectedSet,
      });
      await finishFocusSession({
        correctCount: nextCorrect,
        focusSessionId: activeFocusSessionId,
        passed,
      });
      setSyncStatus(activeFocusSessionId ? "synced" : "demo");
      setSyncMessage(activeFocusSessionId ? "Intento guardado." : "Intento completado en modo demo local.");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "No se pudo guardar el intento.");
    }
  }

  async function chooseAnswer(answerIndex: number) {
    const nextAnswers = [...answers];
    nextAnswers[activeQuestion] = answerIndex;
    setAnswers(nextAnswers);

    const nextCorrect = countCorrectAnswers(nextAnswers, selectedSet);

    if (activeQuestion < selectedSet.questions.length - 1) {
      setActiveQuestion((index) => index + 1);
      return;
    }

    const passed = nextCorrect >= unlockTarget;
    await finishQuiz(nextAnswers, passed, nextCorrect);

    if (passed) {
      setSessionState("unlocked");
      document.exitFullscreen?.().catch(() => undefined);
      return;
    }

    setAnswers([]);
    setActiveQuestion(0);
    setSessionState(strictMode ? "locked" : "quiz");
    setSecondsLeft(strictMode ? cooldownMinutes * 60 : 0);
  }

  function exitDemoSession() {
    setSessionState("setup");
    setAnswers([]);
    setActiveQuestion(0);
    setSecondsLeft(getInitialSeconds(selectedSet));
    setActiveFocusSessionId(null);
    setSyncStatus(isSupabaseConfigured ? "idle" : "demo");
    setSyncMessage("Sesion demo cerrada.");
    document.exitFullscreen?.().catch(() => undefined);
  }

  return {
    activeQuestion,
    activeFocusSessionId,
    answers,
    chooseAnswer,
    cooldownMinutes,
    correctCount,
    currentQuestion,
    isLocked,
    progress,
    secondsLeft,
    selectedSet,
    selectedSetId,
    sessionState,
    setCooldownMinutes,
    setSelectedSetId,
    setSessionState,
    setStrictMode,
    setUnlockTarget,
    startSession,
    strictMode,
    syncMessage,
    syncStatus,
    unlockTarget,
    exitDemoSession,
  };
}
