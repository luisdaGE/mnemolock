export type SessionState = "setup" | "locked" | "quiz" | "unlocked";

export type SyncStatus = "idle" | "demo" | "syncing" | "synced" | "error";

export type Question = {
  id?: string;
  sourceChunkId?: string | null;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  tag: string;
};

export type StudySet = {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  minutes: number;
  sourceNotes?: string | null;
  createdAt?: string;
  questions: Question[];
};

export type StudySourceStatus = "uploaded" | "processing" | "ready" | "failed";

export type StudySource = {
  id: string;
  studySetId: string;
  userId?: string;
  fileName: string;
  filePath: string | null;
  mimeType: string;
  status: StudySourceStatus;
  createdAt?: string;
};

export type SourceChunk = {
  id: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  metadata?: Record<string, unknown>;
};

export type ResearchInsight = {
  title: string;
  body: string;
};
