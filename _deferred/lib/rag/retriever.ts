/**
 * Simple keyword-based retriever for RAG.
 * No embeddings; uses term frequency scoring.
 */

import type { KbChunk } from "./kb";
import { loadKb } from "./kb";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  return tf;
}

function scoreChunk(chunk: KbChunk, queryTf: Map<string, number>): number {
  const chunkTokens = tokenize(chunk.content);
  const chunkTf = termFreq(chunkTokens);
  let score = 0;
  for (const [term, qCount] of queryTf) {
    const cCount = chunkTf.get(term) ?? 0;
    if (cCount > 0) {
      score += qCount * (1 + Math.log(1 + cCount));
    }
  }
  return score;
}

let cachedChunks: KbChunk[] | null = null;

async function getChunks(): Promise<KbChunk[]> {
  if (cachedChunks) return cachedChunks;
  cachedChunks = await loadKb();
  return cachedChunks;
}

/**
 * Retrieve top K chunks for a query using keyword scoring.
 * Deterministic and fast.
 */
export async function retrieve(
  query: string,
  topK: number = 5
): Promise<KbChunk[]> {
  const chunks = await getChunks();
  const queryTokens = tokenize(query);
  const queryTf = termFreq(queryTokens);

  if (queryTf.size === 0) {
    return chunks.slice(0, topK);
  }

  const scored = chunks.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, queryTf),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map((s) => s.chunk);
}
