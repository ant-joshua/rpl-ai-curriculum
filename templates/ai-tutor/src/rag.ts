import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// --- Types ---

interface Section {
  file: string;
  heading: string;
  content: string;
  embedding?: number[];
}

// --- Config ---

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let sections: Section[] = [];
let loaded = false;

// --- File loading & splitting ---

function loadModules(moduleDir: string): void {
  const absPath = path.resolve(moduleDir);

  if (!fs.existsSync(absPath)) {
    console.warn(`[RAG] Module directory not found: ${absPath}`);
    return;
  }

  const files = fs.readdirSync(absPath).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(absPath, file), 'utf-8');
    const fileSections = splitIntoSections(file, content);
    sections.push(...fileSections);
  }

  console.log(`[RAG] Loaded ${sections.length} sections from ${files.length} files`);
  loaded = true;
}

function splitIntoSections(file: string, content: string): Section[] {
  const lines = content.split('\n');
  const result: Section[] = [];
  let currentHeading = 'Pendahuluan';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      if (currentContent.length > 0) {
        result.push({
          file,
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
        });
      }
      currentHeading = headingMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Last section
  if (currentContent.length > 0) {
    result.push({
      file,
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
    });
  }

  return result;
}

// --- Embedding ---

async function embedSection(section: Section): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: `${section.heading}\n${section.content.slice(0, 2000)}`,
  });
  return response.data[0].embedding;
}

async function embedAll(): Promise<void> {
  for (const section of sections) {
    if (!section.embedding) {
      section.embedding = await embedSection(section);
    }
  }
}

// --- Search ---

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

async function search(query: string, topK: number = 3): Promise<Section[]> {
  if (sections.length === 0) return [];

  // Embed query
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = response.data[0].embedding;

  // Score & rank
  const scored = sections
    .filter((s) => s.embedding)
    .map((s) => ({
      section: s,
      score: cosineSimilarity(queryEmbedding, s.embedding!),
    }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.section);
}

// --- Public API ---

export async function initializeRag(moduleDir: string): Promise<void> {
  loadModules(moduleDir);
  if (sections.length > 0) {
    await embedAll();
    console.log(`[RAG] Embedded ${sections.length} sections`);
  }
}

export async function getContext(query: string, topK: number = 3): Promise<string> {
  if (!loaded || sections.length === 0) {
    return '';
  }

  const results = await search(query, topK);

  if (results.length === 0) return '';

  const context = results
    .map(
      (s, i) =>
        `[Sumber: ${s.file} — ${s.heading}]\n${s.content.slice(0, 1000)}`,
    )
    .join('\n\n---\n\n');

  return context;
}
