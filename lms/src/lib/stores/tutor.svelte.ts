import { browser } from '$app/environment';

const CHAT_HISTORY_KEY = 'lms-tutor-chat';
const MAX_HISTORY = 50;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function createTutorStore() {
  let messages = $state<ChatMessage[]>([]);

  function migrateLegacyFormat(): void {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      // Legacy format was just [{role, content}] — add timestamps
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
      // Keep only last MAX_HISTORY messages
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

  async function askQuestion(query: string, contextUrl?: string): Promise<string> {
    addMessage('user', query);

    const apiUrl = 'https://9router.ant-joshua.my.id/v1/chat/completions';
    const model = 'ocg/deepseek-v4-flash';

    // Build system prompt with optional context
    let systemPrompt = 'kamu asisten belajar RPL AI Curriculum, jawab berdasarkan konten modul, bahasa Indonesia';
    if (contextUrl) {
      systemPrompt += `\n\nKonteks dari modul: ${contextUrl}`;
    }

    // Build conversation history for context (last 10 messages)
    const historyMessages = messages
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: query },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Maaf, tidak ada jawaban.';
      addMessage('assistant', reply);
      return reply;
    } catch (err) {
      const fallback = 'Maaf, sedang offline. Coba lagi nanti.';
      addMessage('assistant', fallback);
      return fallback;
    }
  }

  return {
    get messages() { return messages; },
    loadChatHistory,
    saveChatHistory,
    clearChat,
    askQuestion,
    addMessage,
  };
}

export const tutor = createTutorStore();
