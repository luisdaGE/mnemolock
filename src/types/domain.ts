export type SessionState = "setup" | "locked" | "quiz" | "unlocked";

export type Question = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  tag: string;
};

export type StudySet = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  questions: Question[];
};

export type ResearchInsight = {
  title: string;
  body: string;
};
