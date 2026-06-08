import { Flame, ShieldCheck, Sparkles } from "lucide-react";
import { businessIdeas, researchInsights } from "../../data/product";

export function StrategyPage() {
  return (
    <section className="page-grid">
      <div className="page-intro">
        <p className="eyebrow">Producto</p>
        <h1>Escalar sin perder la idea central</h1>
        <p className="lead">
          La app debe crecer alrededor de una promesa simple: bloquear distracciones y desbloquear con aprendizaje
          verificable.
        </p>
      </div>

      <div className="feature-band research-band">
        <div>
          <span className="section-heading inline">
            <Flame size={18} />
            Debilidades detectadas
          </span>
          <h2>Oportunidades que atacamos</h2>
        </div>
        <div className="insight-grid">
          {researchInsights.map((insight) => (
            <article className="insight-card" key={insight.title}>
              <h3>{insight.title}</h3>
              <p>{insight.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="feature-band">
        <div>
          <span className="section-heading inline">
            <Sparkles size={18} />
            Negocio
          </span>
          <h2>Modelo de negocio mejorado</h2>
        </div>
        <div className="business-grid">
          {businessIdeas.map((idea) => (
            <div className="business-card" key={idea}>
              <ShieldCheck size={18} />
              <p>{idea}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
