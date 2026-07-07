import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import curriculumAgent from './agent';
import { initializeRag, getContext } from './rag';

// --- Config ---

const PORT = parseInt(process.env.PORT || '3000', 10);
const MODEL = process.env.MODEL_NAME || 'gpt-4o';
const MODULE_DIR = process.env.MODULE_DIR || '../../modul';
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '10', 10);

// --- OpenAI ---

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Rate limiter (simple in-memory) ---

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts) {
    if (now > entry.resetAt) {
      requestCounts.delete(ip);
    }
  }
}, 300_000);

// --- Express ---

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', agent: 'RPL AI Tutor' });
});

// Chat endpoint — streaming SSE
app.post('/api/chat', async (req: Request, res: Response) => {
  // Rate limit
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests. Silakan coba lagi nanti.' });
    return;
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Field "message" required (string)' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // --- RAG: retrieve context ---
    const context = await getContext(message);

    // --- Build messages array ---
    const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: curriculumAgent.instructions + (context
        ? `\n\n**Konteks dari kurikulum:**\n${context}`
        : ''),
    };

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      systemMessage,
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // --- Stream response ---
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('[Chat Error]', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Internal server error' })}\n\n`);
    res.end();
  }
});

// --- Start ---

async function main() {
  // Init RAG
  try {
    await initializeRag(MODULE_DIR);
  } catch (err) {
    console.warn('[RAG] Init failed, running without RAG:', (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🤖 RPL AI Tutor running on http://localhost:${PORT}`);
    console.log(`   Model: ${MODEL}`);
    console.log(`   Rate limit: ${RATE_LIMIT} req/min per IP`);
    console.log(`   Module dir: ${MODULE_DIR}`);
  });
}

main();
