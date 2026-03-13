/**
 * Knowledge base loader for RAG.
 * Loads KB documents from /docs/kb and chunks by headings.
 */

import fs from "fs";
import path from "path";

export type KbChunk = {
  id: string;
  source: string;
  title: string;
  headingPath: string;
  content: string;
};

const KB_DIR = path.join(process.cwd(), "docs", "kb");

function extractChunksFromMarkdown(
  content: string,
  source: string,
  baseTitle: string
): KbChunk[] {
  const chunks: KbChunk[] = [];
  const lines = content.split("\n");
  let currentHeadingPath: string[] = [];
  let currentContent: string[] = [];
  let chunkIndex = 0;

  const flushChunk = () => {
    const text = currentContent.join("\n").trim();
    if (text) {
      chunks.push({
        id: `${source}-${chunkIndex}`,
        source,
        title: baseTitle,
        headingPath: currentHeadingPath.join(" > ") || baseTitle,
        content: text,
      });
      chunkIndex++;
    }
    currentContent = [];
  };

  for (const line of lines) {
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h1Match) {
      flushChunk();
      currentHeadingPath = [h1Match[1]];
    } else if (h2Match) {
      flushChunk();
      currentHeadingPath = currentHeadingPath.slice(0, 1).concat(h2Match[1]);
    } else if (h3Match) {
      flushChunk();
      currentHeadingPath = currentHeadingPath.slice(0, 2).concat(h3Match[1]);
    } else {
      currentContent.push(line);
    }
  }
  flushChunk();

  return chunks;
}

export async function loadKb(): Promise<KbChunk[]> {
  const dir = KB_DIR;
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const allChunks: KbChunk[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const baseTitle = file.replace(/\.md$/, "").replace(/-/g, " ");
    const source = `docs/kb/${file}`;
    const chunks = extractChunksFromMarkdown(content, source, baseTitle);
    allChunks.push(...chunks);
  }

  return allChunks;
}
