import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config/appConfig";
import { studySets } from "../../data/studySets";
import type { Question, SessionState } from "../../types/domain";
import { countCorrectAnswers, getInitialSeconds } from "../../utils/study";

export function useStudySession() {
  const [selectedSetId, setSelectedSetId] = useState(studySets[0].id);
  const selectedSet = studySets.find((set) => set.id === selectedSetId) ?? studySets[0];
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [secondsLeft, setSecondsLeft] = useState(getInitialSeconds(selectedSet));
  const [answers, setAnswers] = useState<number[]>([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [strictMode, setStrictMode] = useState(true);
  const [unlockTarget, setUnlockTarget] = useState(appConfig.baseRequiredCorrect);
  const [cooldownMinutes, setCooldownMinutes] = useState(appConfig.defaultCooldownMinutes);

  const correctCount = useMemo(() => countCorrectAnswers(answers, selectedSet), [answers, selectedSet]);
  const progress = Math.round(((getInitialSeconds(selectedSet) - secondsLeft) / getInitialSeconds(selectedSet)) * 100);
  const currentQuestion: Question = selectedSet.questions[activeQuestion] ?? selectedSet.questions[0];
  const isLocked = sessionState === "locked" || sessionState === "quiz";

  useEffect(() => {
    setSecondsLeft(getInitialSeconds(selectedSet));
    setAnswers([]);
    setActiveQuestion(0);
    setUnlockTarget(Math.min(appConfig.baseRequiredCorrect, selectedSet.questions.length));
    setSessionState("setup");
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

  function startSession() {
    setSecondsLeft(getInitialSeconds(selectedSet));
    setAnswers([]);
    setActiveQuestion(0);
    setSessionState("locked");
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  function chooseAnswer(answerIndex: number) {
    const nextAnswers = [...answers];
    nextAnswers[activeQuestion] = answerIndex;
    setAnswers(nextAnswers);

    const nextCorrect = countCorrectAnswers(nextAnswers, selectedSet);

    if (activeQuestion < selectedSet.questions.length - 1) {
      setActiveQuestion((index) => index + 1);
      return;
    }

    if (nextCorrect >= unlockTarget) {
      setSessionState("unlocked");
      document.exitFullscreen?.().catch(() => undefined);
      return;
    }

    setAnswers([]);
    setActiveQuestion(0);
    setSessionState(strictMode ? "locked" : "quiz");
    setSecondsLeft(strictMode ? cooldownMinutes * 60 : 0);
  }

  return {
    activeQuestion,
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
    unlockTarget,
  };
}
