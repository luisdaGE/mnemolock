import { appConfig } from "../config/appConfig";
import type { Database } from "../types/database";
import type { SourceChunk, StudySource } from "../types/domain";
import { canPreviewTextFile, chunkStudyText } from "../utils/chunking";
import { getCurrentUserId, isSupabaseConfigured, isUuid, supabase } from "./supabase";

type SourceRow = Database["public"]["Tables"]["study_sources"]["Row"];
type ChunkRow = Database["public"]["Tables"]["source_chunks"]["Row"];

function mapSource(row: SourceRow): StudySource {
  return {
    id: row.id,
    studySetId: row.study_set_id,
    userId: row.user_id,
    fileName: row.file_name,
    filePath: row.file_path,
    mimeType: row.mime_type,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapChunk(row: ChunkRow): SourceChunk {
  return {
    id: row.id,
    sourceId: row.source_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    pageNumber: row.page_number,
    metadata: typeof row.metadata === "object" && row.metadata !== null && !Array.isArray(row.metadata) ? row.metadata : {},
  };
}

function safeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function createLocalChunks(sourceId: string, file: File, text: string): SourceChunk[] {
  return chunkStudyText(text).map((content, index) => ({
    id: `local-chunk-${index + 1}`,
    sourceId,
    chunkIndex: index,
    content,
    pageNumber: null,
    metadata: {
      file_name: file.name,
      client_preview: true,
    },
  }));
}

export async function listSources(studySetId?: string) {
  if (!isSupabaseConfigured || !supabase) return { mode: "demo" as const, sources: [] as StudySource[] };

  const userId = await getCurrentUserId();
  if (!userId) return { mode: "demo" as const, sources: [] as StudySource[] };

  let query = supabase.from("study_sources").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (studySetId && isUuid(studySetId)) query = query.eq("study_set_id", studySetId);

  const { data, error } = await query;
  if (error) throw error;
  return { mode: "synced" as const, sources: (data ?? []).map(mapSource) };
}

export async function listSourceChunks(sourceId: string) {
  if (!isSupabaseConfigured || !supabase || !isUuid(sourceId)) return [] as SourceChunk[];

  const { data, error } = await supabase
    .from("source_chunks")
    .select("*")
    .eq("source_id", sourceId)
    .order("chunk_index", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapChunk);
}

export async function uploadStudySource({
  file,
  studySetId,
}: {
  file: File;
  studySetId: string;
}) {
  const isTextPreview = canPreviewTextFile(file);
  const text = isTextPreview ? await file.text() : "";

  if (!isSupabaseConfigured || !supabase || !isUuid(studySetId)) {
    const sourceId = `local-source-${Date.now().toString(36)}`;
    return {
      mode: "demo" as const,
      source: {
        id: sourceId,
        studySetId,
        fileName: file.name,
        filePath: null,
        mimeType: file.type || "application/octet-stream",
        status: isTextPreview ? "ready" : "uploaded",
        createdAt: new Date().toISOString(),
      } satisfies StudySource,
      chunks: isTextPreview ? createLocalChunks(sourceId, file, text) : [],
      message: isTextPreview
        ? "Preview local creado. Inicia sesion para guardar en Supabase."
        : "PDF listo en modo demo. El procesamiento real vive server-side.",
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    const sourceId = `local-source-${Date.now().toString(36)}`;
    return {
      mode: "demo" as const,
      source: {
        id: sourceId,
        studySetId,
        fileName: file.name,
        filePath: null,
        mimeType: file.type || "application/octet-stream",
        status: isTextPreview ? "ready" : "uploaded",
        createdAt: new Date().toISOString(),
      } satisfies StudySource,
      chunks: isTextPreview ? createLocalChunks(sourceId, file, text) : [],
      message: "Inicia sesion para guardar el archivo.",
    };
  }

  const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { data: uploaded, error: uploadError } = await supabase.storage.from(appConfig.sourceBucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: source, error: sourceError } = await supabase
    .from("study_sources")
    .insert({
      user_id: userId,
      study_set_id: studySetId,
      file_name: file.name,
      file_path: uploaded.path,
      mime_type: file.type || "application/octet-stream",
      status: isTextPreview ? "ready" : "uploaded",
      error_message: isTextPreview ? null : "PDF pendiente de process-source Edge Function.",
    })
    .select("*")
    .single();
  if (sourceError) throw sourceError;

  const chunks = isTextPreview ? createLocalChunks(source.id, file, text) : [];
  if (chunks.length > 0) {
    const { data: insertedChunks, error: chunksError } = await supabase
      .from("source_chunks")
      .insert(
        chunks.map((chunk) => ({
          source_id: source.id,
          chunk_index: chunk.chunkIndex,
          content: chunk.content,
          page_number: chunk.pageNumber,
          metadata: chunk.metadata ?? {},
        })),
      )
      .select("*");
    if (chunksError) throw chunksError;
    return {
      mode: "synced" as const,
      source: mapSource(source),
      chunks: (insertedChunks ?? []).map(mapChunk),
      message: "Archivo y chunks guardados.",
    };
  }

  return {
    mode: "synced" as const,
    source: mapSource(source),
    chunks,
    message: "Archivo guardado. Procesa el PDF con la Edge Function.",
  };
}

export async function deleteStudySource(source: StudySource) {
  if (!isSupabaseConfigured || !supabase || !isUuid(source.id)) return;

  if (source.filePath) {
    const { error: storageError } = await supabase.storage.from(appConfig.sourceBucket).remove([source.filePath]);
    if (storageError) throw storageError;
  }

  const { error } = await supabase.from("study_sources").delete().eq("id", source.id);
  if (error) throw error;
}

export async function processStudySource(source: StudySource) {
  if (!isSupabaseConfigured || !supabase || !isUuid(source.id)) {
    return { mode: "demo" as const, message: "Procesamiento server-side disponible al conectar Supabase." };
  }

  const { data, error } = await supabase.functions.invoke("process-source", {
    body: { source_id: source.id },
  });
  if (error) throw error;
  return { mode: "synced" as const, message: `Procesamiento terminado: ${data?.chunks_created ?? 0} chunks.` };
}

export async function generateQuestionsFromSource(source: StudySource) {
  if (!isSupabaseConfigured || !supabase || !isUuid(source.id) || !isUuid(source.studySetId)) {
    return { mode: "demo" as const, message: "Generacion server-side disponible al conectar Supabase." };
  }

  const { data, error } = await supabase.functions.invoke("generate-questions", {
    body: { source_id: source.id, study_set_id: source.studySetId },
  });
  if (error) throw error;
  return { mode: "synced" as const, message: `Quiz generado: ${data?.questions_created ?? 0} preguntas.` };
}
