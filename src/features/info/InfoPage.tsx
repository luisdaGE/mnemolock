import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { infoPages } from "../../data/infoPages";

export function InfoPage() {
  const { slug } = useParams();
  const page = infoPages.find((item) => item.slug === slug) ?? infoPages[0];

  return (
    <section className="ml-section ml-info" aria-labelledby="info-title">
      <div className="ml-container">
        <Link className="ml-back" to="/">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
        <div className="ml-info-grid">
          <div>
            <span className="ml-eyebrow">{page.eyebrow}</span>
            <h1 id="info-title">{page.title}</h1>
            <p className="ml-lead">{page.summary}</p>
            <div className="ml-info-bullets">
              {page.bullets.map((bullet) => (
                <span key={bullet}>
                  <CheckCircle2 size={18} />
                  {bullet}
                </span>
              ))}
            </div>
          </div>
          <img alt={`Ilustración de ${page.title}`} className="ml-info-img" src={page.image} />
        </div>

        <div className="ml-info-note">
          <h2>Contenido en preparación</h2>
          <p>
            Esta página queda lista para completar con materiales, PDFs, casos y detalles específicos del producto cuando
            tengas la información final.
          </p>
          <Link className="ml-btn ml-btn-primary" to="/login" style={{ marginTop: 20 }}>
            Empezar gratis
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
