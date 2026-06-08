import type { StudySet } from "../types/domain";

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function getInitialSeconds(set: StudySet) {
  return Math.max(60, Math.round(set.minutes * 60));
}

export function countCorrectAnswers(answers: number[], set: StudySet) {
  return answers.reduce((total, answer, index) => {
    return total + (answer === set.questions[index]?.answerIndex ? 1 : 0);
  }, 0);
}
