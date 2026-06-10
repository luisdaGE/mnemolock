import { ArrowRight, BookOpenCheck, BrainCircuit, CheckCircle2, FileQuestion, LockKeyhole, Play, TimerReset, Unlock } from "lucide-react";
import { LockPanel } from "../../components/LockPanel";
import { infoPages } from "../../data/infoPages";
import { useStudySession } from "../study-session/useStudySession";
import { formatTime } from "../../utils/study";

const steps = [
  { title: "Estudia", body: "Activa una sesion sin distracciones.", icon: BrainCircuit },
  { title: "Responde", body: "Contesta preguntas del tema.", icon: FileQuestion },
  { title: "Desbloquea", body: "Sales cuando demuestras aprendizaje.", icon: Unlock },
];

export function HomePage() {
  const session = useStudySession();

  return (
    <>
      {session.sessionState !== "setup" ? (
        <section className="session-overlay" aria-label="Sesion de estudio activa">
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
        </section>
      ) : null}

      <section className="calm-hero" id="inicio">
        <div className="calm-hero-copy">
          <p className="eyebrow">Enfoque para estudiar</p>
          <h1>Estudia. Bloqueate. Demuestra que aprendiste.</h1>
          <p>
            MnemoLock convierte una salida impulsiva en una prueba corta de memoria activa. Empieza una demo en menos
            de 30 segundos.
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="/login">
              Empezar
              <ArrowRight size={18} />
            </a>
            <button className="secondary-btn" onClick={session.startSession}>
              <Play size={18} />
              Ver demo
            </button>
          </div>
          <div className="calm-proof">
            <span>
              <CheckCircle2 size={15} />
              Demo sin registro
            </span>
            <span>
              <BookOpenCheck size={15} />
              Bloqueo cognitivo
            </span>
          </div>
        </div>

        <aside className="calm-preview" aria-label="Vista rapida de una sesion">
          <div className="calm-preview-top">
            <span>Sesion de estudio</span>
            <LockKeyhole size={20} />
          </div>
          <h2>{session.selectedSet.title}</h2>
          <div className="calm-preview-meta">
            <span>Ciencias</span>
            <span>Demo web</span>
            <span>Modo estricto</span>
          </div>
          <strong>{formatTime(session.secondsLeft)}</strong>
          <p>{session.unlockTarget} aciertos para desbloquear</p>
          <button className="primary-btn full" onClick={session.startSession}>
            Iniciar bloqueo
          </button>
        </aside>
      </section>

      <section className="simple-steps" id="como-funciona" aria-labelledby="steps-title">
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2 id="steps-title">El proceso completo en tres pasos</h2>
        </div>
        <div className="simple-step-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
            <article className="simple-step" key={step.title}>
              <div className="step-visual">
                <span>{index + 1}</span>
                <Icon size={38} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
            );
          })}
        </div>
      </section>

      <section className="minimal-info" id="mas-informacion" aria-labelledby="info-title">
        <div>
          <p className="eyebrow">Mas informacion</p>
          <h2 id="info-title">Explora solo si quieres profundizar</h2>
        </div>
        <div className="minimal-info-list visual-info-list">
          {infoPages.map((item) => (
            <a href={`/info/${item.slug}`} key={item.slug}>
              <img alt="" src={item.image} />
              <span>{item.title}</span>
              <ArrowRight size={16} />
            </a>
          ))}
        </div>
      </section>

      <section className="quiet-cta" id="contacto">
        <div>
          <TimerReset size={20} />
          <strong>Empieza con una sesion corta.</strong>
          <span>Despues ajustas materias, PDFs y dificultad.</span>
        </div>
        <a className="primary-btn" href="/login">
          Crear cuenta
        </a>
      </section>
    </>
  );
}
