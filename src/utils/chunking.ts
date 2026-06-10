export function chunkStudyText(text: string, maxWords = 420) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  const chunks: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    if (wordCount + sentenceWords.length > maxWords && current.length > 0) {
      chunks.push(current.join(" ").trim());
      current = [];
      wordCount = 0;
    }
    current.push(sentence.trim());
    wordCount += sentenceWords.length;
  }

  if (current.length > 0) chunks.push(current.join(" ").trim());
  return chunks;
}

export function canPreviewTextFile(file: File) {
  const name = file.name.toLowerCase();
  return file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md");
}
