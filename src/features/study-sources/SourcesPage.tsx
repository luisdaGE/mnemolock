import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Eye,
  FileQuestion,
  FileText,
  FileUp,
  Layers3,
  RotateCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PipelineStep } from "../../components/PipelineStep";
import { appConfig } from "../../config/appConfig";
import {
  deleteStudySource,
  generateQuestionsFromSource,
  listSourceChunks,
  listSources,
  processStudySource,
  uploadStudySource,
} from "../../lib/sourceRepository";
import type { SourceChunk, StudySource } from "../../types/domain";
import { validateSourceFile } from "../../utils/validation";
import { useStudyLibrary } from "../dashboard/useStudyLibrary";
import { sourcePipeline } from "./sourcePipeline";

export function SourcesPage() {
  const library = useStudyLibrary();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sources, setSources] = useState<StudySource[]>([]);
  const [chunks, setChunks] = useState<SourceChunk[]>([]);
  const [selectedStudySetId, setSelectedStudySetId] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("Sube un archivo para preparar preguntas citables.");
  const hasFile = Boolean(uploadedFile);
  const fileType = uploadedFile?.name.split(".").pop()?.toUpperCase() ?? "PDF";

  useEffect(() => {
    if (!selectedStudySetId && library.sets[0]) setSelectedStudySetId(library.sets[0].id);
  }, [library.sets, selectedStudySetId]);

  useEffect(() => {
    async function loadSources() {
      if (!selectedStudySetId) return;
      try {
        const result = await listSources(selectedStudySetId);
        setSources(result.sources);
        if (result.sources[0]) setChunks(await listSourceChunks(result.sources[0].id));
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudieron cargar las fuentes.");
      }
    }

    loadSources();
  }, [selectedStudySetId]);

  async function handleFile(file: File | null) {
    if (!file) return;

    const validation = validateSourceFile(file);
    if (!validation.ok) {
      setStatus("error");
      setMessage(validation.message);
      return;
    }

    setUploadedFile(file);
    setStatus("uploading");
    setMessage("Subiendo y preparando fuente...");

    try {
      const result = await uploadStudySource({
        file,
        studySetId: selectedStudySetId || library.sets[0]?.id || "demo-set",
      });
      setSources((current) => [result.source, ...current.filter((source) => source.id !== result.source.id)]);
      setChunks(result.chunks);
      setStatus("ready");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    }
  }

  async function handleDeleteSource(source: StudySource) {
    try {
      await deleteStudySource(source);
      setSources((current) => current.filter((item) => item.id !== source.id));
      if (source.id === chunks[0]?.sourceId) setChunks([]);
      setMessage("Fuente eliminada.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la fuente.");
    }
  }

  async function handleSelectSource(source: StudySource) {
    setUploadedFile(null);
    setChunks(await listSourceChunks(source.id));
  }

  async function handleProcessSource(source: StudySource) {
    setStatus("uploading");
    setMessage("Procesando fuente...");
    try {
      const result = await processStudySource(source);
      setMessage(result.message);
      setStatus("ready");
      const sourceChunks = await listSourceChunks(source.id);
      setChunks(sourceChunks);
      const refreshed = await listSources(selectedStudySetId);
      setSources(refreshed.sources);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo procesar la fuente.");
    }
  }

  async function handleGenerateQuestions(source: StudySource) {
    setStatus("uploading");
    setMessage("Generando preguntas con source_chunk_id...");
    try {
      const result = await generateQuestionsFromSource(source);
      setMessage(result.message);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudieron generar preguntas.");
    }
  }

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
          <span>{uploadedFile ? uploadedFile.name : "PDF, TXT, Markdown o guia de examen"}</span>
          <small>Maximo 6 MB con upload estandar. TXT/MD generan chunks locales inmediatos.</small>
          <input
            accept={appConfig.supportedSourceTypes}
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <label className="source-set-selector">
          Materia destino
          <select
            className="auth-input"
            onChange={(event) => setSelectedStudySetId(event.target.value)}
            value={selectedStudySetId}
          >
            {library.sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.title}
              </option>
            ))}
          </select>
        </label>
        <div className="pipeline-grid">
          <PipelineStep icon={status === "ready" ? <CheckCircle2 size={18} /> : <FileUp size={18} />} label="Carga" />
          <PipelineStep icon={chunks.length > 0 ? <CheckCircle2 size={18} /> : <FileText size={18} />} label="Extraccion" />
          <PipelineStep icon={chunks.length > 0 ? <CheckCircle2 size={18} /> : <Layers3 size={18} />} label="Chunks" />
          <PipelineStep icon={<BrainCircuit size={18} />} label="Preguntas" />
          <PipelineStep icon={<Eye size={18} />} label="Citar fuente" />
        </div>
        <div className="pipeline-notes">
          {sourcePipeline.map((step) => (
            <p key={step.label}>
              <strong>{step.label}:</strong> {step.description}
            </p>
          ))}
        </div>
        <p className={`source-message ${status}`}>{message}</p>
      </div>

      <div className="sources-workspace">
        {hasFile || sources.length > 0 ? (
          <>
            <section className="source-list-panel" aria-labelledby="source-list-title">
              <div className="section-heading inline">
                <FileText size={18} />
                <span id="source-list-title">Fuente cargada</span>
              </div>
              <div className="source-table" role="table" aria-label="Fuentes de estudio">
                <div role="row">
                  <strong role="columnheader">Nombre</strong>
                  <strong role="columnheader">Tipo</strong>
                  <strong role="columnheader">Estado</strong>
                  <strong role="columnheader">Acciones</strong>
                </div>
                {sources.length > 0 ? (
                  sources.map((source) => (
                    <div role="row" key={source.id}>
                      <span role="cell">{source.fileName}</span>
                      <span role="cell">{source.mimeType.includes("pdf") ? "PDF" : fileType}</span>
                      <span className={`source-status ${source.status}`} role="cell">
                        <CheckCircle2 size={15} />
                        {source.status}
                      </span>
                      <span className="source-actions" role="cell">
                        <button className="secondary-btn compact-btn" onClick={() => handleSelectSource(source)} type="button">
                          <Eye size={15} />
                          Ver chunks
                        </button>
                        <button className="secondary-btn compact-btn" onClick={() => handleProcessSource(source)} type="button">
                          <RotateCcw size={15} />
                          Procesar
                        </button>
                        <button
                          className="secondary-btn compact-btn"
                          type="button"
                          disabled={chunks.length === 0}
                          onClick={() => handleGenerateQuestions(source)}
                        >
                          <FileQuestion size={15} />
                          Generar quiz
                        </button>
                        <button
                          className="icon-danger-btn"
                          onClick={() => handleDeleteSource(source)}
                          type="button"
                          aria-label={`Eliminar ${source.fileName}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </span>
                    </div>
                  ))
                ) : (
                  <div role="row">
                    <span role="cell">{uploadedFile?.name}</span>
                    <span role="cell">{fileType}</span>
                    <span className={`source-status ${status}`} role="cell">
                      <CheckCircle2 size={15} />
                      {status}
                    </span>
                    <span className="source-actions" role="cell">
                      <button className="icon-danger-btn" onClick={() => setUploadedFile(null)} type="button" aria-label="Eliminar fuente">
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className="chunk-preview-panel" aria-labelledby="chunk-preview-title">
              <div className="section-heading inline">
                <Eye size={18} />
                <span id="chunk-preview-title">Preview de chunks citables</span>
              </div>
              <div className="chunk-list">
                {chunks.length > 0 ? chunks.map((chunk) => (
                  <article className="chunk-card" key={chunk.id}>
                    <span>chunk-{chunk.chunkIndex + 1} · {chunk.pageNumber ? `p. ${chunk.pageNumber}` : "sin pagina"}</span>
                    <p>{chunk.content}</p>
                  </article>
                )) : (
                  <article className="chunk-card">
                    <span>PDF pendiente</span>
                    <p>Los PDFs se guardan como fuente y quedan listos para la Edge Function de extraccion server-side.</p>
                  </article>
                )}
              </div>
              <p className="source-helper">
                En produccion, cada pregunta generada desde esta fuente debe persistirse con <code>source_chunk_id</code>.
              </p>
            </section>
          </>
        ) : (
          <section className="empty-state-panel">
            <FileUp size={26} />
            <h2>Sube tus primeros apuntes</h2>
            <p>
              Cuando agregues un archivo, aqui veras su estado, los chunks extraidos, errores de procesamiento y el boton
              para generar preguntas verificables.
            </p>
          </section>
        )}

        <section className="source-error-panel">
          <AlertTriangle size={18} />
          <div>
            <strong>Errores visibles por diseno</strong>
            <p>Si falla la extraccion, la app debe mostrar causa y permitir reintentar. No ocultar errores en silencio.</p>
          </div>
          <button
            className="secondary-btn compact-btn"
            type="button"
            onClick={() => sources[0] && handleProcessSource(sources[0])}
            disabled={!sources[0]}
          >
            <RotateCcw size={15} />
            Reintentar
          </button>
        </section>
      </div>
    </section>
  );
}
