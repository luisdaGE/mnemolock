import { describe, expect, it } from "vitest";
import type { StudySet } from "../types/domain";
import { chunkStudyText } from "./chunking";
import { getInitialReviewState, scheduleNextReview } from "./spacedRepetition";
import { countCorrectAnswers, formatTime, getInitialSeconds } from "./study";

const set: StudySet = {
  id: "demo",
  title: "Demo",
  subject: "Test",
  minutes: 0.2,
  questions: [
    {
      prompt: "A?",
      options: ["a", "b"],
      answerIndex: 0,
      explanation: "A",
      tag: "one",
    },
    {
      prompt: "B?",
      options: ["a", "b"],
      answerIndex: 1,
      explanation: "B",
      tag: "two",
    },
  ],
};

describe("study utilities", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("enforces at least 60 seconds per session", () => {
    expect(getInitialSeconds(set)).toBe(60);
  });

  it("counts correct answers by question index", () => {
    expect(countCorrectAnswers([0, 0], set)).toBe(1);
    expect(countCorrectAnswers([0, 1], set)).toBe(2);
  });
});

describe("chunking", () => {
  it("splits long study text into bounded chunks", () => {
    const chunks = chunkStudyText("Uno. Dos. Tres. Cuatro.", 2);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain("Uno.");
  });
});

describe("spaced repetition", () => {
  it("resets repetitions after failed recall", () => {
    const state = getInitialReviewState(new Date("2026-06-10T00:00:00Z"));
    const next = scheduleNextReview({ ...state, repetitions: 3, intervalDays: 10 }, 2, new Date("2026-06-10T00:00:00Z"));
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
  });

  it("increases interval after successful recall", () => {
    const state = getInitialReviewState(new Date("2026-06-10T00:00:00Z"));
    const next = scheduleNextReview(state, 5, new Date("2026-06-10T00:00:00Z"));
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
  });
});
