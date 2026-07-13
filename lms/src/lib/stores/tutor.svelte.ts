import { browser } from '$app/environment';

const CHAT_HISTORY_KEY = 'lms-tutor-chat';
const MAX_HISTORY = 50;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

let messages = $state<ChatMessage[]>([]);
let isWaiting = $state(false);
let abortController: AbortController | null = null;

function migrateLegacyFormat(): void {
  const raw = localStorage.getItem(CHAT_HISTORY_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0 && typeof data[0].timestamp !== 'number') {
      const migrated = data.map((m: any) => ({
        ...m,
        timestamp: Date.now(),
      }));
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(migrated));
    }
  } catch {
    // ignore
  }
}

function loadChatHistory(): void {
  if (!browser) return;
  try {
    migrateLegacyFormat();
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    messages = raw ? JSON.parse(raw) : [];
  } catch {
    messages = [];
  }
}

function saveChatHistory(): void {
  if (!browser) return;
  try {
    const recent = messages.slice(-MAX_HISTORY);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(recent));
  } catch {
    // storage full or unavailable
  }
}

function addMessage(role: 'user' | 'assistant', content: string): void {
  messages = [...messages, { role, content, timestamp: Date.now() }];
  saveChatHistory();
}

function clearChat(): void {
  messages = [];
  if (browser) {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }
}

function cancelRequest(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  isWaiting = false;
}

interface AskOptions {
  contextUrl?: string;
  context?: string;
}

async function askQuestion(query: string, opts?: AskOptions): Promise<string> {
  addMessage('user', query);

  const apiUrl = 'https://9router.ant-joshua.my.id/v1/chat/completions';
  const model = 'ocg/deepseek-v4-flash';

  let systemPrompt = 'kamu asisten belajar RPL AI Curriculum, jawab berdasarkan konten modul, bahasa Indonesia';

  if (opts?.context) {
    systemPrompt += `\n\nKonteks dari pengguna: ${opts.context}`;
  } else if (opts?.contextUrl) {
    systemPrompt += `\n\nKonteks dari modul: ${opts.contextUrl}`;
  }

  // Build conversation history for context (last 10 messages)
  const historyMessages = messages
    .slice(-10, -1) // exclude the just-added user message
    .map(m => ({ role: m.role, content: m.content }));

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: query },
    ],
    max_tokens: 2048,
    temperature: 0.7,
    stream: true,
  };

  isWaiting = true;
  abortController = new AbortController();

  // Add empty assistant message placeholder for streaming
  const msgIdx = messages.length;
  messages = [...messages, { role: 'assistant', content: '', timestamp: Date.now() }];

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`API error ${res.status}: ${errText}`);
    }

    // Handle streaming response
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            messages[msgIdx] = {
              ...messages[msgIdx],
              content: messages[msgIdx].content + delta,
            };
            // Trigger reactivity — assign a fresh array
            messages = [...messages];
          }
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User cancelled — keep whatever was streamed
      if (!messages[msgIdx]?.content) {
        messages = messages.slice(0, -1); // remove empty placeholder
      }
      return messages[msgIdx]?.content || '';
    }
    // Error fallback — replace placeholder
    const fallback = 'Maaf, sedang gagal terhubung. Coba lagi nanti.';
    messages[msgIdx] = { ...messages[msgIdx], content: fallback };
    messages = [...messages];
    return fallback;
  } finally {
    isWaiting = false;
    abortController = null;
    saveChatHistory();
  }

  return messages[msgIdx]?.content || '';
}

export const tutor = {
  get messages() { return messages; },
  get isWaiting() { return isWaiting; },
  loadChatHistory,
  saveChatHistory,
  clearChat,
  askQuestion,
  addMessage,
  cancelRequest,
};
