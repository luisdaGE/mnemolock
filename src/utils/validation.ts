import { appConfig } from "../config/appConfig";

export type ValidationResult = {
  ok: boolean;
  message: string;
};

export function validateStudySetInput({
  title,
  subject,
  minutes,
}: {
  title: string;
  subject: string;
  minutes: number;
}): ValidationResult {
  if (title.trim().length < 3) return { ok: false, message: "La materia necesita un nombre de al menos 3 caracteres." };
  if (subject.trim().length < 2) return { ok: false, message: "Agrega una categoria o asignatura." };
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 180) {
    return { ok: false, message: "La duracion debe estar entre 5 y 180 minutos." };
  }
  return { ok: true, message: "Materia valida." };
}

export function validateQuestionInput({
  prompt,
  options,
  answerIndex,
}: {
  prompt: string;
  options: string[];
  answerIndex: number;
}): ValidationResult {
  const cleanOptions = options.map((option) => option.trim()).filter(Boolean);
  if (prompt.trim().length < 8) return { ok: false, message: "La pregunta necesita mas contexto." };
  if (cleanOptions.length < 2) return { ok: false, message: "Agrega al menos dos opciones." };
  if (answerIndex < 0 || answerIndex >= cleanOptions.length) {
    return { ok: false, message: "Selecciona la respuesta correcta." };
  }
  return { ok: true, message: "Pregunta valida." };
}

export function validateSourceFile(file: File): ValidationResult {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const allowed = appConfig.supportedSourceTypes.split(",");
  if (!allowed.includes(extension)) {
    return { ok: false, message: `Formato no soportado. Usa ${appConfig.supportedSourceTypes}.` };
  }
  if (file.size > appConfig.maxStandardUploadBytes) {
    return { ok: false, message: "Para esta version, sube archivos de 6 MB o menos." };
  }
  return { ok: true, message: "Archivo valido." };
}
