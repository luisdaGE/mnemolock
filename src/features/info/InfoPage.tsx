import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { infoPages } from "../../data/infoPages";

export function InfoPage() {
  const { slug } = useParams();
  const page = infoPages.find((item) => item.slug === slug) ?? infoPages[0];

  return (
    <section className="info-page" aria-labelledby="info-title">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
      <div className="info-page-grid">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 id="info-title">{page.title}</h1>
          <p className="lead">{page.summary}</p>
          <div className="info-bullets">
            {page.bullets.map((bullet) => (
              <span key={bullet}>
                <CheckCircle2 size={18} />
                {bullet}
              </span>
            ))}
          </div>
        </div>
        <img alt={`Ilustracion de ${page.title}`} className="info-page-image" src={page.image} />
      </div>
      <div className="info-placeholder">
        <h2>Contenido en preparacion</h2>
        <p>
          Esta pagina queda lista para completar con materiales, PDFs, casos y detalles especificos del producto cuando
          tengas la informacion final.
        </p>
      </div>
    </section>
  );
}
