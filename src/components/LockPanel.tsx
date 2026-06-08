import { ArrowRight, Check, LockKeyhole, Pause, ShieldCheck, TimerReset, Unlock } from "lucide-react";
import type { Question, SessionState, StudySet } from "../types/domain";
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
  onAnswer: (answerIndex: number) => void;
  onStart: () => void;
};

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
  onAnswer,
  onStart,
}: LockPanelProps) {
  if (state === "quiz") {
    return (
      <div className="lock-card quiz-card">
        <div className="quiz-topline">
          <span>{currentQuestion.tag}</span>
          <span>
            {activeQuestion + 1}/{set.questions.length}
          </span>
        </div>
        <h2>{currentQuestion.prompt}</h2>
        <div className="answer-list">
          {currentQuestion.options.map((option, index) => {
            const chosen = answers[activeQuestion] === index;
            return (
              <button className={chosen ? "answer selected" : "answer"} key={option} onClick={() => onAnswer(index)}>
                <span>{option}</span>
                {chosen ? <Check size={17} /> : <ArrowRight size={17} />}
              </button>
            );
          })}
        </div>
        <p className="microcopy">{correctCount} respuestas correctas detectadas</p>
      </div>
    );
  }

  if (state === "unlocked") {
    return (
      <div className="lock-card success-card">
        <Unlock size={34} />
        <h2>Desbloqueado</h2>
        <p>Sesion completada con {correctCount} aciertos. La friccion hizo su trabajo.</p>
        <button className="primary-btn compact" onClick={onStart}>
          <TimerReset size={17} />
          Nueva sesion
        </button>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="lock-card focus-card">
        <LockKeyhole size={34} />
        <p className="eyebrow">Bloqueado</p>
        <h2>{formatTime(secondsLeft)}</h2>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>{set.title}</p>
        <button className="ghost-btn">
          <Pause size={17} />
          Salida cerrada
        </button>
      </div>
    );
  }

  return (
    <div className="lock-card ready-card">
      <ShieldCheck size={32} />
      <p className="eyebrow">{set.subject}</p>
      <h2>{set.title}</h2>
      <p>
        {set.minutes} minutos + {unlockTarget} aciertos para salir.
      </p>
      <button className="primary-btn compact" onClick={onStart}>
        <LockKeyhole size={17} />
        Bloquear
      </button>
    </div>
  );
}
