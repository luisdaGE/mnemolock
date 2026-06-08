import { Settings, Target } from "lucide-react";
import { studySets } from "../../data/studySets";

type StudyControlsProps = {
  cooldownMinutes: number;
  selectedSetId: string;
  strictMode: boolean;
  unlockTarget: number;
  questionCount: number;
  onCooldownChange: (minutes: number) => void;
  onSelectedSetChange: (setId: string) => void;
  onStrictModeChange: (enabled: boolean) => void;
  onUnlockTargetChange: (target: number) => void;
};

export function StudyControls({
  cooldownMinutes,
  selectedSetId,
  strictMode,
  unlockTarget,
  questionCount,
  onCooldownChange,
  onSelectedSetChange,
  onStrictModeChange,
  onUnlockTargetChange,
}: StudyControlsProps) {
  return (
    <>
      <div className="section-heading">
        <span>Materia</span>
        <Target size={18} />
      </div>
      <div className="set-list">
        {studySets.map((set) => (
          <button
            className={set.id === selectedSetId ? "set-button selected" : "set-button"}
            key={set.id}
            onClick={() => onSelectedSetChange(set.id)}
          >
            <span>
              <strong>{set.title}</strong>
              <small>{set.subject}</small>
            </span>
            <span>{set.minutes}m</span>
          </button>
        ))}
      </div>

      <label className="switch-row">
        <span>
          <strong>Modo estricto</strong>
          <small>Si fallas, vuelves a un bloqueo corto.</small>
        </span>
        <input checked={strictMode} onChange={(event) => onStrictModeChange(event.target.checked)} type="checkbox" />
      </label>

      <div className="settings-block">
        <div className="section-heading inline">
          <Settings size={18} />
          Ajustes
        </div>
        <label className="range-row">
          <span>Aciertos para desbloquear</span>
          <strong>{unlockTarget}</strong>
          <input
            max={questionCount}
            min={1}
            onChange={(event) => onUnlockTargetChange(Number(event.target.value))}
            type="range"
            value={unlockTarget}
          />
        </label>
        <label className="range-row">
          <span>Penalizacion si falla</span>
          <strong>{cooldownMinutes}m</strong>
          <input
            max={10}
            min={1}
            onChange={(event) => onCooldownChange(Number(event.target.value))}
            type="range"
            value={cooldownMinutes}
          />
        </label>
      </div>
    </>
  );
}
