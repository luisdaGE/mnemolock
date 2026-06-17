import { ArrowRight, Check, LockKeyhole, Pause, ShieldCheck, TimerReset, Unlock, X } from "lucide-react";
import type { Question, SessionState, StudySet, SyncStatus } from "../types/domain";
import { formatTime } from "../utils/study";

type LockPanelProps = {
  state: SessionState;
  set: StudySet;
  secondsLeft: number;
  progress: number;
  correctCount: number;
  currentQuestion: Question;
  activeQuestion: number;
  answers: number[];
  unlockTarget: number;
  syncStatus?: SyncStatus;
  syncMessage?: string;
  isDemoMode?: boolean;
  onAnswer: (answerIndex: number) => void;
  onStart: () => void;
  onExitDemo?: () => void;
};

function statusLabel(status?: SyncStatus) {
  if (status === "synced") return "Sincronizado";
  if (status === "syncing") return "Sincronizando";
  if (status === "error") return "Error de sync";
  return "Demo web";
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(progress, 100)) / 100) * circumference;

  return (
    <div className="progress-ring" aria-hidden="true">
      <svg viewBox="0 0 132 132">
        <circle className="progress-ring-track" cx="66" cy="66" r={radius} />
        <circle
          className="progress-ring-value"
          cx="66"
          cy="66"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

export function LockPanel({
  state,
  set,
  secondsLeft,
  progress,
  correctCount,
  currentQuestion,
  activeQuestion,
  answers,
  unlockTarget,
  syncStatus = "demo",
  syncMessage = "Demo web local.",
  isDemoMode = true,
  onAnswer,
  onStart,
  onExitDemo,
}: LockPanelProps) {
  if (state === "quiz") {
    return (
      <div className="lock-card quiz-card upgraded-lock-card" aria-live="polite">
        <div className="quiz-topline">
          <span>{currentQuestion.tag}</span>
          <span>
            {activeQuestion + 1}/{set.questions.length}
          </span>
        </div>
        <div className="quiz-progress" aria-hidden="true">
          <span style={{ width: `${((activeQuestion + 1) / set.questions.length) * 100}%` }} />
        </div>
        <h2>{currentQuestion.prompt}</h2>
        <div className="answer-list">
          {currentQuestion.options.map((option, index) => {
            const chosen = answers[activeQuestion] === index;
            return (
              <button
                aria-pressed={chosen}
                className={chosen ? "answer selected" : "answer"}
                key={option}
                onClick={() => onAnswer(index)}
              >
                <span>{option}</span>
                {chosen ? <Check size={17} /> : <ArrowRight size={17} />}
              </button>
            );
          })}
        </div>
        <p className="microcopy">{correctCount} respuestas correctas detectadas</p>
        <p className={`sync-note ${syncStatus}`}>{syncMessage}</p>
      </div>
    );
  }

  if (state === "unlocked") {
    return (
      <div className="lock-card success-card upgraded-lock-card" aria-live="polite">
        <Unlock size={34} />
        <h2>Desbloqueado</h2>
        <p>Sesion completada con {correctCount} aciertos. La friccion hizo su trabajo.</p>
        <p className={`sync-note ${syncStatus}`}>{syncMessage}</p>
        <button className="primary-btn compact" onClick={onStart}>
          <TimerReset size={17} />
          Nueva sesion
        </button>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="lock-card focus-card upgraded-lock-card active-lock-card" aria-live="polite">
        <div className="lock-topline">
          <span className={isDemoMode ? "session-badge demo" : "session-badge synced"}>
            {isDemoMode ? "Demo web" : statusLabel(syncStatus)}
          </span>
          {onExitDemo ? (
            <button className="icon-exit-btn" onClick={onExitDemo} type="button" aria-label="Salir del modo demo">
              <X size={16} />
            </button>
          ) : null}
        </div>
        <ProgressRing progress={progress} />
        <LockKeyhole size={34} />
        <p className="eyebrow">Bloqueo cognitivo activo</p>
        <h2>{formatTime(secondsLeft)}</h2>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          {set.title} · {unlockTarget} aciertos para salir
        </p>
        <p className={`sync-note ${syncStatus}`}>{syncMessage}</p>
        <button className="ghost-btn">
          <Pause size={17} />
          Pantalla completa activa
        </button>
      </div>
    );
  }

  return (
    <div className="lock-card ready-card upgraded-lock-card">
      <ShieldCheck size={32} />
      <p className="eyebrow">{set.subject}</p>
      <h2>{set.title}</h2>
      <p>
        {set.minutes} minutos + {unlockTarget} aciertos para salir.
      </p>
      <p className="sync-note demo">La PWA crea un bloqueo cognitivo; el bloqueo total de otras apps requiere fase nativa.</p>
      <button className="primary-btn compact" onClick={onStart}>
        <LockKeyhole size={17} />
        Bloquear
      </button>
    </div>
  );
}
