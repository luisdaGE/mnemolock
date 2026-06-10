export type Chunk = {
  chunk_index: number;
  content: string;
  page_number: number | null;
  metadata: Record<string, unknown>;
};

export function chunkText(text: string, maxWords = 500): Chunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  const chunks: Chunk[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    if (wordCount + words.length > maxWords && current.length > 0) {
      chunks.push({
        chunk_index: chunks.length,
        content: current.join(" ").trim(),
        page_number: null,
        metadata: { max_words: maxWords },
      });
      current = [];
      wordCount = 0;
    }
    current.push(sentence.trim());
    wordCount += words.length;
  }

  if (current.length > 0) {
    chunks.push({
      chunk_index: chunks.length,
      content: current.join(" ").trim(),
      page_number: null,
      metadata: { max_words: maxWords },
    });
  }

  return chunks;
}
