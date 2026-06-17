import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  LineChart,
  Lock,
  Minus,
  Play,
  Plus,
  Quote,
  Repeat,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Unlock,
  X,
  Zap,
} from "lucide-react";
import { LockPanel } from "../../components/LockPanel";
import { useStudySession } from "../study-session/useStudySession";
import { formatTime } from "../../utils/study";

const steps = [
  {
    title: "Elige qué estudiar",
    body: "Selecciona una materia o sube tus PDFs y apuntes. MindLatch genera preguntas reales sobre ese material.",
    icon: BrainCircuit,
  },
  {
    title: "Bloquéate y enfócate",
    body: "Inicia la sesión a pantalla completa. Sin pestañas, sin atajos, sin negociar con el impulso de salir.",
    icon: Lock,
  },
  {
    title: "Desbloquea con memoria",
    body: "Para salir respondes preguntas del tema. Si demuestras que aprendiste, recuperas tu libertad.",
    icon: Unlock,
  },
];

const features = [
  {
    icon: Target,
    title: "Desbloqueo por dominio",
    body: "La salida no es un botón: es una prueba corta de lo que estudiaste. Cada intento refuerza la memoria.",
  },
  {
    icon: FileText,
    title: "Preguntas de tu material",
    body: "Convierte tus PDFs, apuntes y guías en preguntas citables. Cada una enlaza al fragmento que la origina.",
  },
  {
    icon: ShieldCheck,
    title: "Modo estricto real",
    body: "Si fallas, hay una penalización corta. Nada de trucos: el enfoque se gana, no se simula.",
  },
  {
    icon: Repeat,
    title: "Repaso espaciado",
    body: "Lo que más te cuesta vuelve a aparecer con mayor frecuencia para fijarlo a largo plazo.",
  },
  {
    icon: LineChart,
    title: "Progreso claro",
    body: "Rachas, aciertos y tiempo enfocado por materia para ver cómo mejoras sesión a sesión.",
  },
];

const useCases = [
  {
    icon: GraduationCap,
    title: "Estudiantes",
    body: "Convierte la procrastinación en práctica activa antes de cada examen.",
    points: ["Sesiones guiadas", "Preguntas de repaso", "Historial de progreso"],
    href: "/info/estudiantes",
  },
  {
    icon: Sparkles,
    title: "Opositores y autodidactas",
    body: "Estudia tu propio temario con bloqueos largos y memoria activa de verdad.",
    points: ["Tus PDFs como fuente", "Modo estricto", "Repaso espaciado"],
    href: "/info/metodo",
  },
  {
    icon: ShieldCheck,
    title: "Escuelas",
    body: "Retos por grupo y reportes agregados sin convertir el aula en vigilancia.",
    points: ["Panel por grupo", "Retos académicos", "Privacidad por defecto"],
    href: "/info/escuelas",
  },
];

type CompareValue = boolean | "parcial";

const comparison: { feature: string; us: CompareValue; blockers: CompareValue; quiz: CompareValue }[] = [
  { feature: "Bloqueo durante la sesión", us: true, blockers: true, quiz: false },
  { feature: "Salir solo si demuestras aprendizaje", us: true, blockers: false, quiz: false },
  { feature: "Preguntas de tu propio material", us: true, blockers: false, quiz: "parcial" },
  { feature: "Fuente citable en cada pregunta", us: true, blockers: false, quiz: false },
  { feature: "Modo estricto con penalización", us: true, blockers: "parcial", quiz: false },
];

const testimonials = [
  {
    quote:
      "Probé mil bloqueadores y siempre me los saltaba. Aquí no puedo salir sin responder, así que termino estudiando de verdad.",
    name: "Lucía M.",
    role: "Estudiante de Medicina",
    initials: "LM",
  },
  {
    quote:
      "Subo mis PDFs de oposición y me hace preguntas sobre lo que acabo de leer. Es lo más cercano a un examen real.",
    name: "Diego R.",
    role: "Opositor",
    initials: "DR",
  },
  {
    quote:
      "Mis alumnos llegan a clase habiendo repasado. Ver el progreso por grupo cambió cómo preparo las sesiones.",
    name: "Prof. Andrea V.",
    role: "Docente de Secundaria",
    initials: "AV",
  },
];

const faqs = [
  {
    q: "¿Cómo me desbloquea MindLatch?",
    a: "En vez de un botón de salida, respondes preguntas cortas sobre lo que acabas de estudiar. Cuando demuestras que aprendiste, la sesión se desbloquea. El esfuerzo de salir se convierte en repaso.",
  },
  {
    q: "¿Necesito registrarme para probarlo?",
    a: "No. Puedes lanzar una demo de bloqueo en menos de 30 segundos sin crear cuenta. Solo necesitas cuenta para guardar tus sesiones, materias y progreso.",
  },
  {
    q: "¿Puede bloquear otras apps de mi celular?",
    a: "La versión web/PWA crea un bloqueo cognitivo durante la sesión: pantalla completa y aviso al intentar salir. El bloqueo total del sistema operativo llegará con la app nativa.",
  },
  {
    q: "¿De dónde salen las preguntas?",
    a: "De bancos por materia o de tus propios PDFs y apuntes. Cada pregunta generada enlaza al fragmento que la justifica, para que confíes en lo que respondes.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Empezar es gratis: sesiones de bloqueo, bancos manuales, rachas y estadísticas básicas. El plan Pro añade generación con IA desde tu material y analíticas por materia.",
  },
];

function CompareCell({ value }: { value: CompareValue }) {
  if (value === true) {
    return (
      <span className="ml-compare-cell yes">
        <Check size={17} /> Sí
      </span>
    );
  }
  if (value === "parcial") {
    return (
      <span className="ml-compare-cell">
        <Minus size={17} /> Parcial
      </span>
    );
  }
  return (
    <span className="ml-compare-cell no">
      <X size={17} /> No
    </span>
  );
}

export function HomePage() {
  const session = useStudySession();

  return (
    <>
      {session.sessionState !== "setup" ? (
        <section className="session-overlay" aria-label="Sesión de estudio activa">
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

      {/* HERO */}
      <section className="ml-hero" id="inicio">
        <span className="ml-blob one" aria-hidden="true" />
        <span className="ml-blob two" aria-hidden="true" />
        <div className="ml-container ml-hero-grid">
          <div className="ml-hero-copy">
            <span className="ml-badge">
              <span className="ml-dot" />
              Enfoque por memoria activa
            </span>
            <h1>
              Estudia sin distracciones y <span className="grad">desbloquea con lo que aprendiste</span>
            </h1>
            <p className="ml-hero-sub">
              MindLatch convierte cada intento de salir en una prueba corta de memoria. No desbloqueas por fuerza de
              voluntad: desbloqueas porque aprendiste.
            </p>
            <div className="ml-hero-cta">
              <button className="ml-btn ml-btn-primary ml-btn-lg" onClick={session.startSession}>
                <Play size={18} />
                Probar demo gratis
              </button>
              <a className="ml-btn ml-btn-ghost ml-btn-lg" href="/login">
                Crear cuenta
                <ArrowRight size={18} />
              </a>
            </div>
            <div className="ml-hero-proof">
              <span>
                <CheckCircle2 size={17} />
                Demo sin registro
              </span>
              <span>
                <CheckCircle2 size={17} />
                Listo en 30 segundos
              </span>
              <span>
                <CheckCircle2 size={17} />
                Sin tarjeta
              </span>
            </div>
          </div>

          <div className="ml-preview" aria-hidden="true">
            <div className="ml-preview-float top">
              <Lock size={20} />
              <div>
                <strong>Sesión bloqueada</strong>
                <span>Pantalla completa activa</span>
              </div>
            </div>

            <article className="ml-preview-card">
              <div className="ml-preview-top">
                <span>Sesión de estudio</span>
                <span className="ml-live">En curso</span>
              </div>
              <h2 className="ml-preview-title">{session.selectedSet.title}</h2>
              <div className="ml-preview-meta">
                <span>{session.selectedSet.subject}</span>
                <span>Modo estricto</span>
                <span>{session.unlockTarget} aciertos</span>
              </div>
              <div className="ml-preview-timer">
                {formatTime(session.secondsLeft)}
                <small>Tiempo de enfoque restante</small>
              </div>
              <div className="ml-preview-bar">
                <span />
              </div>
              <div className="ml-preview-q">
                <p>Pregunta de desbloqueo</p>
                <strong>{session.currentQuestion.prompt}</strong>
                <div className="ml-preview-opts">
                  {session.currentQuestion.options.slice(0, 3).map((option, index) => (
                    <span className={index === session.currentQuestion.answerIndex ? "ok" : ""} key={option}>
                      <i>{index === session.currentQuestion.answerIndex ? "✓" : String.fromCharCode(65 + index)}</i>
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <div className="ml-preview-float bottom">
              <Unlock size={20} />
              <div>
                <strong>Desbloqueo</strong>
                <span>Demuestra y sal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="ml-trust">
        <div className="ml-container ml-trust-inner">
          <p>Pensado para</p>
          <div className="ml-trust-logos">
            <span>Universidad</span>
            <span>Oposiciones</span>
            <span>Bachillerato</span>
            <span>Autodidactas</span>
            <span>Academias</span>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="ml-section">
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">El problema real</span>
            <h2 className="ml-h2">La fuerza de voluntad no escala. La memoria sí.</h2>
            <p className="ml-lead">
              Los bloqueadores tradicionales confían en que no harás trampa. MindLatch cambia la regla: el desbloqueo
              exige evidencia de aprendizaje.
            </p>
          </div>
          <div className="ml-split">
            <div className="ml-pane problem">
              <span className="ml-pane-tag">
                <X size={16} /> Bloqueadores de siempre
              </span>
              <h3>Te bloquean… hasta que negocias</h3>
              <ul className="ml-checklist">
                <li>
                  <X size={18} /> Un botón de "salir 5 minutos" que se vuelve toda la tarde.
                </li>
                <li>
                  <X size={18} /> Preguntas genéricas que no se parecen a tu examen.
                </li>
                <li>
                  <X size={18} /> Cero evidencia de que realmente aprendiste algo.
                </li>
                <li>
                  <X size={18} /> Castigan el impulso, pero no construyen memoria.
                </li>
              </ul>
            </div>
            <div className="ml-pane solution">
              <span className="ml-pane-tag">
                <Check size={16} /> El método MindLatch
              </span>
              <h3>Sales solo cuando demuestras dominio</h3>
              <ul className="ml-checklist">
                <li>
                  <Check size={18} /> La salida es una prueba corta de memoria activa.
                </li>
                <li>
                  <Check size={18} /> Preguntas de tu propio material, con fuente citable.
                </li>
                <li>
                  <Check size={18} /> Cada intento de salir refuerza lo que estudias.
                </li>
                <li>
                  <Check size={18} /> Recuperas tu libertad cuando aprendiste, no antes.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ml-section" id="como-funciona">
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Cómo funciona</span>
            <h2 className="ml-h2">De la distracción al dominio en tres pasos</h2>
            <p className="ml-lead">Un recorrido simple, diseñado para que empieces a enfocarte sin fricción.</p>
          </div>
          <div className="ml-steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="ml-step" key={step.title}>
                  <span className="ml-step-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ml-step-num">
                    <Icon size={22} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ml-section" id="caracteristicas" style={{ background: "var(--c-surface-2)" }}>
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Características</span>
            <h2 className="ml-h2">Todo lo que necesitas para estudiar con intención</h2>
            <p className="ml-lead">
              Herramientas pensadas para que el enfoque se convierta en aprendizaje real y medible.
            </p>
          </div>
          <div className="ml-features">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="ml-feature" key={feature.title}>
                  <span className="ml-feature-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
            <article className="ml-feature is-wide">
              <span className="ml-feature-icon">
                <Zap size={24} />
              </span>
              <div>
                <h3>PWA instalable, lista offline</h3>
                <p>
                  Instala MindLatch como app en tu equipo o celular. El shell carga al instante y tus sesiones siguen
                  contigo, estudies donde estudies.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="ml-section" id="casos">
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Casos de uso</span>
            <h2 className="ml-h2">Para quien necesita enfocarse de verdad</h2>
          </div>
          <div className="ml-usecases">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <article className="ml-usecase" key={useCase.title}>
                  <span className="ml-usecase-icon">
                    <Icon size={22} />
                  </span>
                  <h3>{useCase.title}</h3>
                  <p>{useCase.body}</p>
                  <ul>
                    {useCase.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={16} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a className="ml-usecase-link" href={useCase.href}>
                    Saber más
                    <ArrowRight size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="ml-section" id="comparativa" style={{ background: "var(--c-surface-2)" }}>
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Comparativa</span>
            <h2 className="ml-h2">Por qué MindLatch es diferente</h2>
          </div>
          <div className="ml-compare">
            <div className="ml-compare-row head">
              <div className="ml-col-feature">Característica</div>
              <div className="ml-col-us">MindLatch</div>
              <div>Bloqueadores</div>
              <div>Apps de quiz</div>
            </div>
            {comparison.map((row) => (
              <div className="ml-compare-row" key={row.feature}>
                <div className="ml-col-feature">{row.feature}</div>
                <div className="ml-col-us">
                  <CompareCell value={row.us} />
                </div>
                <div>
                  <CompareCell value={row.blockers} />
                </div>
                <div>
                  <CompareCell value={row.quiz} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ml-section">
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Testimonios</span>
            <h2 className="ml-h2">Quienes ya estudian sin negociar consigo mismos</h2>
          </div>
          <div className="ml-testimonials">
            {testimonials.map((testimonial) => (
              <article className="ml-quote" key={testimonial.name}>
                <Quote size={26} color="var(--c-primary)" />
                <div className="ml-quote-stars" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <p>“{testimonial.quote}”</p>
                <div className="ml-quote-by">
                  <span className="ml-avatar">{testimonial.initials}</span>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ml-section" id="preguntas" style={{ background: "var(--c-surface-2)" }}>
        <div className="ml-container">
          <div className="ml-section-head center">
            <span className="ml-eyebrow">Preguntas frecuentes</span>
            <h2 className="ml-h2">Todo lo que quieres saber</h2>
          </div>
          <div className="ml-faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>
                  {faq.q}
                  <span className="ml-faq-icon">
                    <Plus size={16} />
                  </span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ml-section-tight">
        <div className="ml-container">
          <div className="ml-cta">
            <h2>Empieza a estudiar como si tu salida dependiera de aprender.</h2>
            <p>Lanza una sesión de bloqueo ahora mismo. Después ajustas materias, PDFs y dificultad.</p>
            <div className="ml-cta-actions">
              <button className="ml-btn ml-btn-accent ml-btn-lg" onClick={session.startSession}>
                <Play size={18} />
                Probar la demo
              </button>
              <a className="ml-btn ml-btn-light ml-btn-lg" href="/login">
                Crear cuenta gratis
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="ml-cta-note">Sin tarjeta · Demo sin registro · Cancela cuando quieras</p>
          </div>
        </div>
      </section>
    </>
  );
}
