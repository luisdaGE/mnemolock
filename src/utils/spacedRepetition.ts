export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewState = {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  dueAt: string;
};

const dayMs = 24 * 60 * 60 * 1000;

export function getInitialReviewState(now = new Date()): ReviewState {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueAt: now.toISOString(),
  };
}

export function scheduleNextReview(state: ReviewState, grade: ReviewGrade, now = new Date()): ReviewState {
  if (grade < 3) {
    return {
      intervalDays: 1,
      easeFactor: Math.max(1.3, state.easeFactor - 0.2),
      repetitions: 0,
      dueAt: new Date(now.getTime() + dayMs).toISOString(),
    };
  }

  const repetitions = state.repetitions + 1;
  const intervalDays =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(state.intervalDays * state.easeFactor));
  const easeFactor = Math.max(1.3, state.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  return {
    intervalDays,
    easeFactor,
    repetitions,
    dueAt: new Date(now.getTime() + intervalDays * dayMs).toISOString(),
  };
}
