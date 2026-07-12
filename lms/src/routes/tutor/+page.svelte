<script lang="ts">
  import { tutor, type ChatMessage } from '$lib/stores/tutor.svelte';
  import { modules } from '$lib/stores/modules';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let inputText = $state('');
  let isWaiting = $state(false);
  let showApiPrompt = $state(false);
  let lastLocalAnswer = $state('');
  let pendingQuery = $state('');

  // Keyword search index built from module content
  let keywordIndex = $state<{ text: string; moduleTitle: string; sessionId: string }[]>([]);

  onMount(() => {
    tutor.loadChatHistory();
    buildKeywordIndex();
  });

  async function buildKeywordIndex() {
    if (!browser) return;
    const entries: { text: string; moduleTitle: string; sessionId: string }[] = [];

    for (const mod of modules) {
      try {
        const res = await fetch(`/content/${mod.dirName}.json`);
        if (!res.ok) continue;
        const content: Record<string, string> = await res.json();
        for (const [key, text] of Object.entries(content)) {
          if (key === 'README' || key === 'cheatsheet' || key === 'quiz') continue;
          entries.push({
            text: stripHtml(text).slice(0, 2000),
            moduleTitle: mod.title,
            sessionId: key,
          });
        }
      } catch {
        // skip
      }
    }
    keywordIndex = entries;
  }

  function stripHtml(html: string): string {
    return html
      .replace(/<img[^>]*>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchLocal(query: string): { answer: string; confidence: number } | null {
    const q = query.toLowerCase();
    let bestScore = 0;
    let bestText = '';

    for (const entry of keywordIndex) {
      const text = entry.text.toLowerCase();
      // Count keyword matches
      const terms = q.split(/\s+/).filter(t => t.length > 2);
      if (terms.length === 0) continue;

      let score = 0;
      for (const term of terms) {
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = text.match(regex);
        if (matches) score += matches.length;
      }

      // Bonus for phrase match
      if (text.includes(q)) score += 5;

      // Normalize by content length
      const normalized = text.length > 0 ? score / (text.length / 500) : 0;

      if (normalized > bestScore) {
        bestScore = normalized;
        bestText = entry.text;
      }
    }

    if (bestScore > 0.5 && bestText) {
      // Extract relevant snippet
      const queryLower = query.toLowerCase();
      const textLower = bestText.toLowerCase();
      const idx = textLower.indexOf(queryLower);
      if (idx >= 0) {
        const start = Math.max(0, idx - 100);
        const end = Math.min(bestText.length, idx + query.length + 200);
        let snippet = (start > 0 ? '...' : '') + bestText.slice(start, end) + (end < bestText.length ? '...' : '');
        return { answer: snippet, confidence: Math.min(1, bestScore / 3) };
      }
      // Return first 500 chars of best match
      return { answer: bestText.slice(0, 500) + '...', confidence: Math.min(1, bestScore / 3) };
    }

    return null;
  }

  async function sendMessage() {
    const q = inputText.trim();
    if (!q || isWaiting) return;
    inputText = '';
    isWaiting = true;
    showApiPrompt = false;
    pendingQuery = q;

    // Step 1: Search local keyword index
    const local = searchLocal(q);
    if (local && local.confidence > 0.3) {
      lastLocalAnswer = local.answer;
      tutor.addMessage('assistant', local.answer);
      isWaiting = false;
      return;
    }

    // Step 2: No good local match — show API prompt
    showApiPrompt = true;
    isWaiting = false;
  }

  async function askAI() {
    if (!pendingQuery) return;
    showApiPrompt = false;
    isWaiting = true;

    await tutor.askQuestion(pendingQuery);
    isWaiting = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    tutor.clearChat();
  }
</script>

<div class="chat-page">
  <div class="chat-header">
    <h1>🤖 AI Tutor</h1>
    <p class="subtitle">Tanya tentang materi RPL AI Curriculum</p>
    {#if tutor.messages.length > 0}
      <button class="clear-btn" onclick={clearChat}>🗑️ Hapus Chat</button>
    {/if}
  </div>

  <div class="chat-messages" id="chat-messages">
    {#if tutor.messages.length === 0}
      <div class="welcome">
        <div class="welcome-icon">🤖</div>
        <h2>Halo! Aku AI Tutor RPL</h2>
        <p>Tanya apa aja tentang materi RPL AI Curriculum. Aku bisa jawab offline dari konten yang tersedia, atau pakai AI kalo butuh bantuan lebih.</p>
        <div class="example-questions">
          <button class="example-btn" onclick={() => { inputText = 'Apa itu API?'; }}>Apa itu API?</button>
          <button class="example-btn" onclick={() => { inputText = 'Jelaskan Big O Notation'; }}>Jelaskan Big O Notation</button>
          <button class="example-btn" onclick={() => { inputText = 'Apa itu Docker?'; }}>Apa itu Docker?</button>
        </div>
      </div>
    {/if}

    {#each tutor.messages as msg}
      <div class="message {msg.role}">
        <div class="msg-bubble">
          <p>{msg.content}</p>
          <span class="msg-time">{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    {/each}

    {#if isWaiting}
      <div class="message assistant">
        <div class="msg-bubble typing">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-label">sedang mengetik...</span>
        </div>
      </div>
    {/if}

    {#if showApiPrompt && !isWaiting}
      <div class="message assistant">
        <div class="msg-bubble api-prompt">
          <p>Maaf, belum ada informasi yang cocok di konten offline.</p>
          <button class="api-btn" onclick={askAI}>
            🌐 Mau tanya ke AI? (membutuhkan koneksi)
          </button>
        </div>
      </div>
    {/if}
  </div>

  <div class="chat-input-wrap">
    <div class="chat-input-row">
      <textarea
        class="chat-input"
        bind:value={inputText}
        onkeydown={handleKeydown}
        placeholder="Tanya tentang materi RPL..."
        rows="1"
        disabled={isWaiting}
      ></textarea>
      <button class="send-btn" onclick={sendMessage} disabled={!inputText.trim() || isWaiting}>
        ➤
      </button>
    </div>
    <p class="input-hint">Enter untuk kirim</p>
  </div>
</div>

<style>
  .chat-page {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px);
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }
  .chat-header h1 { font-size: 18px; font-weight: 700; }
  .subtitle { font-size: 12px; color: var(--text-secondary); flex: 1; }
  .clear-btn {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .clear-btn:hover { color: var(--danger, #ef4444); border-color: var(--danger, #ef4444); }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .welcome {
    text-align: center;
    padding: 40px 20px;
  }
  .welcome-icon { font-size: 48px; margin-bottom: 12px; }
  .welcome h2 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .welcome p { font-size: 13px; color: var(--text-secondary); max-width: 400px; margin: 0 auto 20px; line-height: 1.5; }

  .example-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .example-btn {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .example-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }

  .message {
    display: flex;
    flex-direction: column;
  }
  .message.user { align-items: flex-end; }
  .message.assistant { align-items: flex-start; }

  .msg-bubble {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .message.user .msg-bubble {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    border-bottom-right-radius: 4px;
  }
  .message.assistant .msg-bubble {
    border-bottom-left-radius: 4px;
  }

  .msg-time {
    display: block;
    font-size: 10px;
    color: inherit;
    opacity: 0.5;
    margin-top: 4px;
    text-align: right;
  }
  .message.user .msg-time { color: rgba(255,255,255,0.7); }

  .typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 20px;
  }
  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: bounce 1.4s infinite ease-in-out both;
  }
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  .typing-dot:nth-child(3) { animation-delay: 0s; }
  .typing-label {
    font-size: 11px;
    color: var(--text-secondary);
    margin-left: 8px;
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .api-prompt {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .api-prompt p { font-size: 13px; color: var(--text-secondary); }
  .api-btn {
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid var(--accent);
    background: var(--accent-dim);
    color: var(--accent);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .api-btn:hover { background: var(--accent); color: #fff; }

  .chat-input-wrap {
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }
  .chat-input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .chat-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    min-height: 42px;
    max-height: 120px;
    transition: border-color 0.15s ease;
  }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--text-secondary); }
  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    background: var(--accent);
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
  .send-btn:disabled { opacity: 0.4; cursor: default; }
  .input-hint {
    font-size: 10px;
    color: var(--text-secondary);
    text-align: right;
    margin-top: 4px;
    opacity: 0.5;
  }
</style>
