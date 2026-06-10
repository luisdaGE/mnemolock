import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  FileUp,
  Flame,
  LockKeyhole,
  Pencil,
  Play,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LockPanel } from "../../components/LockPanel";
import type { StudySet } from "../../types/domain";
import { StudyControls } from "../study-session/StudyControls";
import { useStudySession } from "../study-session/useStudySession";
import { useStudyLibrary } from "./useStudyLibrary";

const guideSteps = [
  {
    icon: BookOpenCheck,
    title: "1. Elige tu tema",
    body: "Selecciona una materia de prueba o sube apuntes cuando tengas tu material.",
  },
  {
    icon: Settings2,
    title: "2. Ajusta la salida",
    body: "Define cuantos aciertos necesitas para desbloquear.",
  },
  {
    icon: LockKeyhole,
    title: "3. Inicia bloqueo",
    body: "Estudia sin salir. Al final respondes para recuperar acceso.",
  },
];

const emptyDraft = {
  title: "",
  subject: "",
  minutes: 25,
  prompt: "",
  options: "Opcion A\nOpcion B\nOpcion C",
  answerIndex: 0,
  explanation: "",
  tag: "manual",
};

export function DashboardPage() {
  const library = useStudyLibrary();
  const session = useStudySession(library.sets);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: "", subject: "", minutes: 25 });

  const averageAccuracy = library.stats.averageAccuracy || Math.round((session.unlockTarget / session.selectedSet.questions.length) * 100);

  async function handleCreateSet() {
    const created = await library.addSet({
      title: draft.title,
      subject: draft.subject,
      minutes: Number(draft.minutes),
      question: {
        prompt: draft.prompt,
        options: draft.options.split("\n"),
        answerIndex: Number(draft.answerIndex),
        explanation: draft.explanation,
        tag: draft.tag,
      },
    });
    if (created) setDraft(emptyDraft);
  }

  function startEditing(set: StudySet) {
    setEditingSetId(set.id);
    setEditDraft({ title: set.title, subject: set.subject, minutes: set.minutes });
  }

  async function saveEditing(set: StudySet) {
    const saved = await library.updateSet(set, {
      title: editDraft.title,
      subject: editDraft.subject,
      minutes: Number(editDraft.minutes),
    });
    if (saved) setEditingSetId(null);
  }

  return (
    <section className="guided-dashboard" aria-labelledby="dashboard-title">
      <div className="guided-header">
        <div>
          <p className="eyebrow">Tu espacio</p>
          <h1 id="dashboard-title">Empieza una sesion de estudio</h1>
          <p className="lead">Sigue estos pasos. No necesitas configurar todo ahora.</p>
        </div>
        <button className="primary-btn" onClick={session.startSession}>
          <Play size={18} />
          Iniciar bloqueo
        </button>
      </div>

      <div className="guide-grid">
        {guideSteps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="guide-card" key={step.title}>
              <Icon size={22} />
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </article>
          );
        })}
      </div>

      <div className="stats-ribbon" aria-label="Metricas de progreso">
        <article>
          <BookOpenCheck size={18} />
          <span>Sesiones esta semana</span>
          <strong>{library.stats.sessionsThisWeek}</strong>
        </article>
        <article>
          <BarChart3 size={18} />
          <span>Promedio de aciertos</span>
          <strong>{averageAccuracy}%</strong>
        </article>
        <article>
          <Flame size={18} />
          <span>Racha actual</span>
          <strong>{library.stats.streakLabel}</strong>
        </article>
      </div>

      <div className={`sync-banner ${library.status}`}>
        <strong>{library.mode === "synced" ? "Datos sincronizados" : "Modo demo"}</strong>
        <span>{library.message}</span>
        <button className="secondary-btn compact-btn" onClick={library.refresh} type="button">
          Refrescar
        </button>
      </div>

      <div className="guided-workspace">
        <aside className="control-panel">
          <StudyControls
            cooldownMinutes={session.cooldownMinutes}
            onCooldownChange={session.setCooldownMinutes}
            onSelectedSetChange={session.setSelectedSetId}
            onStrictModeChange={session.setStrictMode}
            onUnlockTargetChange={session.setUnlockTarget}
            questionCount={session.selectedSet.questions.length}
            selectedSetId={session.selectedSetId}
            sets={library.sets}
            strictMode={session.strictMode}
            unlockTarget={session.unlockTarget}
          />
        </aside>

        <section className="current-session-card">
          {session.sessionState === "setup" ? (
            <>
              <p className="eyebrow">Sesion actual</p>
              <h2>{session.selectedSet.title}</h2>
              <p>
                {session.unlockTarget} aciertos para desbloquear. Penalizacion: {session.cooldownMinutes} min. La PWA
                usa fullscreen, Wake Lock cuando existe y un contrato claro de demo web.
              </p>
              <div className="session-actions">
                <button className="primary-btn" onClick={session.startSession}>
                  <Play size={18} />
                  Empezar ahora
                </button>
                <Link className="secondary-btn" to="/sources">
                  <FileUp size={18} />
                  Subir apuntes
                </Link>
              </div>
              <Link className="quiet-link" to="/info/metodo">
                Entender el metodo <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <LockPanel
              activeQuestion={session.activeQuestion}
              answers={session.answers}
              correctCount={session.correctCount}
              currentQuestion={session.currentQuestion}
              isDemoMode={!session.activeFocusSessionId}
              onAnswer={session.chooseAnswer}
              onExitDemo={session.exitDemoSession}
              onStart={session.startSession}
              progress={session.progress}
              secondsLeft={session.secondsLeft}
              set={session.selectedSet}
              state={session.sessionState}
              syncMessage={session.syncMessage}
              syncStatus={session.syncStatus}
              unlockTarget={session.unlockTarget}
            />
          )}
        </section>
      </div>

      <section className="study-admin-grid" aria-labelledby="study-admin-title">
        <div className="study-form-panel">
          <div className="section-heading inline">
            <Plus size={18} />
            <span id="study-admin-title">Nueva materia</span>
          </div>
          <div className="study-form-grid">
            <label>
              Nombre
              <input
                className="auth-input"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Biologia celular"
                value={draft.title}
              />
            </label>
            <label>
              Asignatura
              <input
                className="auth-input"
                onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Ciencias"
                value={draft.subject}
              />
            </label>
            <label>
              Minutos
              <input
                className="auth-input"
                max={180}
                min={5}
                onChange={(event) => setDraft((current) => ({ ...current, minutes: Number(event.target.value) }))}
                type="number"
                value={draft.minutes}
              />
            </label>
            <label className="wide-field">
              Primera pregunta
              <textarea
                className="auth-input text-area-input"
                onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))}
                placeholder="Que concepto quieres evaluar?"
                value={draft.prompt}
              />
            </label>
            <label className="wide-field">
              Opciones, una por linea
              <textarea
                className="auth-input text-area-input"
                onChange={(event) => setDraft((current) => ({ ...current, options: event.target.value }))}
                value={draft.options}
              />
            </label>
            <label>
              Respuesta correcta
              <select
                className="auth-input"
                onChange={(event) => setDraft((current) => ({ ...current, answerIndex: Number(event.target.value) }))}
                value={draft.answerIndex}
              >
                {draft.options
                  .split("\n")
                  .filter(Boolean)
                  .map((option, index) => (
                    <option key={`${option}-${index}`} value={index}>
                      {index + 1}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Etiqueta
              <input
                className="auth-input"
                onChange={(event) => setDraft((current) => ({ ...current, tag: event.target.value }))}
                placeholder="Energia"
                value={draft.tag}
              />
            </label>
            <label className="wide-field">
              Explicacion
              <textarea
                className="auth-input text-area-input"
                onChange={(event) => setDraft((current) => ({ ...current, explanation: event.target.value }))}
                placeholder="Por que esa respuesta es correcta?"
                value={draft.explanation}
              />
            </label>
          </div>
          <button className="primary-btn" disabled={library.status === "saving"} onClick={handleCreateSet} type="button">
            <Save size={18} />
            {library.status === "saving" ? "Guardando..." : "Guardar materia"}
          </button>
        </div>

        <div className="study-set-admin-list">
          <div className="section-heading inline">
            <BookOpenCheck size={18} />
            Materias
          </div>
          {library.sets.length === 0 ? (
            <div className="empty-state-panel compact-empty">
              <BookOpenCheck size={24} />
              <h2>No hay materias todavia</h2>
              <p>Crea una materia o sube apuntes para empezar con preguntas verificables.</p>
            </div>
          ) : (
            library.sets.map((set) => (
              <article className="study-set-admin-card" key={set.id}>
                {editingSetId === set.id ? (
                  <div className="study-set-edit-grid">
                    <input
                      className="auth-input"
                      onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
                      value={editDraft.title}
                    />
                    <input
                      className="auth-input"
                      onChange={(event) => setEditDraft((current) => ({ ...current, subject: event.target.value }))}
                      value={editDraft.subject}
                    />
                    <input
                      className="auth-input"
                      min={5}
                      onChange={(event) => setEditDraft((current) => ({ ...current, minutes: Number(event.target.value) }))}
                      type="number"
                      value={editDraft.minutes}
                    />
                    <button className="primary-btn compact" onClick={() => saveEditing(set)} type="button">
                      <Save size={16} />
                      Guardar
                    </button>
                    <button className="secondary-btn compact-btn" onClick={() => setEditingSetId(null)} type="button">
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3>{set.title}</h3>
                      <p>
                        {set.subject} · {set.minutes}m · {set.questions.length} pregunta(s)
                      </p>
                    </div>
                    <div className="study-set-actions">
                      <button className="secondary-btn compact-btn" onClick={() => startEditing(set)} type="button">
                        <Pencil size={15} />
                        Editar
                      </button>
                      <button className="icon-danger-btn" onClick={() => library.removeSet(set)} type="button" aria-label={`Eliminar ${set.title}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
