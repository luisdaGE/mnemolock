import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chunkText } from "../_shared/chunking.ts";

type RequestBody = {
  source_id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Missing Supabase service env vars" }, { status: 500, headers: corsHeaders });
  }

  const { source_id }: RequestBody = await req.json();
  if (!source_id) return Response.json({ error: "source_id is required" }, { status: 400, headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: source, error: sourceError } = await supabase
    .from("study_sources")
    .select("*")
    .eq("id", source_id)
    .single();

  if (sourceError || !source) {
    return Response.json({ error: sourceError?.message ?? "Source not found" }, { status: 404, headers: corsHeaders });
  }

  if (!source.file_path) {
    await supabase.from("study_sources").update({ status: "failed", error_message: "Missing file_path" }).eq("id", source_id);
    return Response.json({ error: "Missing file_path" }, { status: 400, headers: corsHeaders });
  }

  await supabase.from("study_sources").update({ status: "processing", error_message: null }).eq("id", source_id);

  const { data: file, error: downloadError } = await supabase.storage.from("study-sources").download(source.file_path);
  if (downloadError || !file) {
    await supabase
      .from("study_sources")
      .update({ status: "failed", error_message: downloadError?.message ?? "Download failed" })
      .eq("id", source_id);
    return Response.json({ error: downloadError?.message ?? "Download failed" }, { status: 500, headers: corsHeaders });
  }

  if (!source.mime_type.startsWith("text/") && !source.file_name.endsWith(".md")) {
    await supabase
      .from("study_sources")
      .update({
        status: "failed",
        error_message: "PDF extraction/OCR is intentionally not implemented in this function yet.",
      })
      .eq("id", source_id);
    return Response.json(
      { error: "PDF extraction requires a dedicated parser/OCR worker." },
      { status: 422, headers: corsHeaders },
    );
  }

  const text = await file.text();
  const chunks = chunkText(text).map((chunk) => ({
    source_id,
    ...chunk,
  }));

  const { error: deleteOldError } = await supabase.from("source_chunks").delete().eq("source_id", source_id);
  if (deleteOldError) {
    return Response.json({ error: deleteOldError.message }, { status: 500, headers: corsHeaders });
  }

  const { error: insertError } = chunks.length > 0 ? await supabase.from("source_chunks").insert(chunks) : { error: null };
  if (insertError) {
    await supabase.from("study_sources").update({ status: "failed", error_message: insertError.message }).eq("id", source_id);
    return Response.json({ error: insertError.message }, { status: 500, headers: corsHeaders });
  }

  await supabase.from("study_sources").update({ status: "ready", error_message: null }).eq("id", source_id);
  return Response.json({ source_id, chunks_created: chunks.length }, { headers: corsHeaders });
});
