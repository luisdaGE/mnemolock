import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RequestBody = {
  study_set_id?: string;
  source_id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildQuestionFromChunk(content: string) {
  const excerpt = content.slice(0, 180).trim();
  return {
    prompt: `Segun este fragmento, cual es la idea central? "${excerpt}${content.length > 180 ? "..." : ""}"`,
    options: ["La idea principal del fragmento", "Un dato no relacionado", "Una conclusion opuesta", "Una definicion externa"],
    answer_index: 0,
    explanation: "La respuesta correcta debe poder verificarse en el fragmento citado.",
    difficulty: "medium",
    origin: "source_generated",
  };
}

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

  const { study_set_id, source_id }: RequestBody = await req.json();
  if (!study_set_id || !source_id) {
    return Response.json({ error: "study_set_id and source_id are required" }, { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: chunks, error: chunksError } = await supabase
    .from("source_chunks")
    .select("id,content")
    .eq("source_id", source_id)
    .limit(10);

  if (chunksError) return Response.json({ error: chunksError.message }, { status: 500, headers: corsHeaders });
  if (!chunks?.length) return Response.json({ error: "No chunks found" }, { status: 422, headers: corsHeaders });

  const questions = chunks.map((chunk) => ({
    study_set_id,
    source_chunk_id: chunk.id,
    ...buildQuestionFromChunk(chunk.content),
  }));

  const { data, error } = await supabase.from("questions").insert(questions).select("id,source_chunk_id");
  if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });

  return Response.json(
    {
      questions_created: data?.length ?? 0,
      note: "Deterministic placeholder generator. Replace buildQuestionFromChunk with an LLM call when API credentials and quotas are configured.",
    },
    { headers: corsHeaders },
  );
});
