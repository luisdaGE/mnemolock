export const sourcePipeline = [
  { label: "Carga", description: "Subir PDF, TXT o Markdown a storage privado del usuario." },
  { label: "Extraccion", description: "Leer texto server-side sin exponer llaves ni saturar el navegador." },
  { label: "Chunks", description: "Limpiar ruido y partir el material en fragmentos citables con pagina." },
  { label: "Preguntas", description: "Generar preguntas alineadas al material del estudiante." },
  { label: "Citar fuente", description: "Guardar cada pregunta con el fragmento que la respalda." },
];
