import { BrainCircuit, Eye, FileText, FileUp, SlidersHorizontal, UploadCloud } from "lucide-react";
import { useState } from "react";
import { PipelineStep } from "../../components/PipelineStep";
import { appConfig } from "../../config/appConfig";
import { sourcePipeline } from "./sourcePipeline";

export function SourcesPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <section className="page-grid">
      <div className="page-intro">
        <p className="eyebrow">Fuente de estudio</p>
        <h1>Sube PDFs para generar preguntas confiables</h1>
        <p className="lead">
          Esta ruta prepara el flujo escalable: archivo en nube segura, texto extraido automaticamente, fragmentos citables y
          preguntas enlazadas a la fuente.
        </p>
      </div>

      <div className="feature-band source-band">
        <div>
          <span className="section-heading inline">
            <FileUp size={18} />
            Pipeline
          </span>
          <h2>De apuntes a quiz verificable</h2>
          <p>
            El frontend solo selecciona el archivo. En produccion, la extraccion y generacion deben vivir en funciones
            server-side para no exponer llaves ni saturar el navegador.
          </p>
        </div>
        <label className="upload-zone">
          <UploadCloud size={28} />
          <span>{uploadedFile ? uploadedFile.name : "PDF, apuntes o guia de examen"}</span>
          <small>Subida segura + procesamiento automatico + preguntas con fuente.</small>
          <input
            accept={appConfig.supportedSourceTypes}
            onChange={(event) => setUploadedFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <div className="pipeline-grid">
          <PipelineStep icon={<FileText size={18} />} label="Extraer" />
          <PipelineStep icon={<SlidersHorizontal size={18} />} label="Filtrar" />
          <PipelineStep icon={<BrainCircuit size={18} />} label="Preguntar" />
          <PipelineStep icon={<Eye size={18} />} label="Citar fuente" />
        </div>
        <div className="pipeline-notes">
          {sourcePipeline.map((step) => (
            <p key={step.label}>
              <strong>{step.label}:</strong> {step.description}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
