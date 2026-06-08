import { ArrowRight, BookOpenCheck, FileUp, LockKeyhole, Play, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StudyControls } from "../study-session/StudyControls";
import { useStudySession } from "../study-session/useStudySession";

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

export function DashboardPage() {
  const session = useStudySession();

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
            strictMode={session.strictMode}
            unlockTarget={session.unlockTarget}
          />
        </aside>

        <section className="current-session-card">
          <p className="eyebrow">Sesion actual</p>
          <h2>{session.selectedSet.title}</h2>
          <p>{session.unlockTarget} aciertos para desbloquear. Penalizacion: {session.cooldownMinutes} min.</p>
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
        </section>
      </div>
    </section>
  );
}
