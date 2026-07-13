<script lang="ts">
  import { tutor } from '$lib/stores/tutor.svelte';
  import { parseMarkdown } from '$lib/utils/markdown';
  import { onMount } from 'svelte';

  let { context = '' }: { context?: string } = $props();

  let inputText = $state('');
  let chatContainer: HTMLDivElement | undefined = $state();
  let userScrolledUp = $state(false);
  let suggestions = $state<string[]>([]);

  const suggestionSets: Record<string, string[]> = {
    api: ['Apa bedanya REST dan GraphQL?', 'Jelaskan method HTTP', 'Contoh endpoint API'],
    js: ['Apa itu closure?', 'Jelaskan Promise', 'Array method map vs filter'],
    docker: ['Apa itu Docker?', 'Bedanya image dan container', 'Cara buat Dockerfile'],
    git: ['Apa itu Git?', 'Perintah Git dasar', 'Cara resolve conflict'],
    general: ['Apa itu API?', 'Jelaskan Big O Notation', 'Apa itu Docker?'],
  };

  onMount(() => {
    tutor.loadChatHistory();
    if (tutor.messages.length === 0) {
      suggestions = suggestionSets.general;
    }
  });

  $effect(() => {
    if (chatContainer && !userScrolledUp) {
      // read tutor.messages to track deps
      tutor.messages;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    userScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
  }

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      userScrolledUp = false;
    }
  }

  async function sendMessage() {
    const q = inputText.trim();
    if (!q || tutor.isWaiting) return;
    inputText = '';
    suggestions = [];
    await tutor.askQuestion(q, context ? { context } : undefined);
    generateSuggestions(q);
  }

  function clickSuggestion(text: string) {
    inputText = text;
    sendMessage();
  }

  function generateSuggestions(query: string) {
    const lower = query.toLowerCase();
    if (lower.includes('api') || lower.includes('rest') || lower.includes('graphql') || lower.includes('endpoint')) {
      suggestions = suggestionSets.api;
    } else if (lower.includes('docker') || lower.includes('container') || lower.includes('image')) {
      suggestions = suggestionSets.docker;
    } else if (lower.includes('git') || lower.includes('commit') || lower.includes('branch') || lower.includes('merge')) {
      suggestions = suggestionSets.git;
    } else if (lower.includes('js') || lower.includes('javascript') || lower.includes('promise') || lower.includes('function') || lower.includes('array') || lower.includes('variable')) {
      suggestions = suggestionSets.js;
    } else {
      // Try to pick based on last AI response content
      const last = tutor.messages[tutor.messages.length - 1];
      if (last?.content) {
        const c = last.content.toLowerCase();
        if (c.includes('api') || c.includes('rest')) suggestions = suggestionSets.api;
        else if (c.includes('docker') || c.includes('container')) suggestions = suggestionSets.docker;
        else if (c.includes('git')) suggestions = suggestionSets.git;
        else if (c.includes('javascript') || c.includes('function')) suggestions = suggestionSets.js;
        else suggestions = suggestionSets.general;
      } else {
        suggestions = suggestionSets.general;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleContainerClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest('[data-copy-btn]') as HTMLElement | null;
    if (!btn) return;
    e.preventDefault();
    const pre = btn.closest('pre');
    const code = pre?.querySelector('code');
    if (!code) return;
    const text = code.textContent || '';
    navigator.clipboard.writeText(text);
    const original = btn.innerHTML;
    const prevWidth = btn.offsetWidth;
    btn.textContent = '✅ Copied!';
    btn.style.minWidth = prevWidth + 'px';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.minWidth = '';
      btn.classList.remove('copied');
    }, 1800);
  }

  function renderWithCopyButtons(content: string): string {
    let html = parseMarkdown(content);
    // Wrap in markdown-content div for app.css styling
    // Inject copy button into each <pre> block
    html = '<div class="markdown-content">' + html.replace(/<pre(?=\s|>)/g, '<pre><button class="copy-btn" data-copy-btn>Copy</button>') + '</div>';
    return html;
  }

  function stopGeneration() {
    tutor.cancelRequest();
  }
</script>

<div class="chat-page">
  <!-- Header -->
  <div class="chat-header">
    <div class="header-left">
      <h1>AI Tutor</h1>
      <span class="header-badge">RPL Curriculum</span>
    </div>
    <div class="header-actions">
      {#if tutor.messages.length > 0}
        <button class="header-btn" onclick={() => tutor.clearChat()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Clear
        </button>
      {/if}
    </div>
  </div>

  <!-- Messages -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
  <div
    class="chat-messages"
    bind:this={chatContainer}
    onscroll={handleScroll}
    onclick={handleContainerClick}
    role="log"
    aria-label="Chat messages"
    tabindex="-1"
  >
    {#if tutor.messages.length === 0}
      <div class="welcome animate-in">
        <div class="welcome-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </div>
        <h2>Halo! Aku AI Tutor RPL</h2>
        <p>Tanya apa aja tentang materi RPL AI Curriculum. Aku bisa bantu jelasin konsep, kode, dan praktik terbaik.</p>
        <div class="suggestion-chips">
          {#each suggestionSets.general as text}
            <button class="chip" onclick={() => clickSuggestion(text)}>
              {text}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Existing messages -->
      {#each tutor.messages as msg, i}
        <div
          class="message {msg.role}"
          class:streaming={msg.role === 'assistant' && i === tutor.messages.length - 1 && tutor.isWaiting}
          style="animation-delay: {i * 0.03}s"
        >
          <div class="msg-avatar">
            {#if msg.role === 'assistant'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
              </svg>
            {:else}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            {/if}
          </div>
          <div class="msg-content">
            <div class="msg-bubble">
              {#if msg.role === 'user'}
                <p class="msg-text">{msg.content}</p>
              {:else}
                {#if msg.content}
                  {@html renderWithCopyButtons(msg.content)}
                {:else if tutor.isWaiting}
                  <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                  </div>
                {/if}
              {/if}
            </div>
            <span class="msg-time">
              {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              {#if i === tutor.messages.length - 1 && msg.role === 'assistant' && tutor.isWaiting}
                <span class="stream-dot"></span>
              {/if}
            </span>
          </div>
        </div>
      {/each}

      <!-- Suggestion chips after last assistant message -->
      {#if suggestions.length > 0 && !tutor.isWaiting}
        <div class="suggestion-chips animate-in">
          {#each suggestions as text}
            <button class="chip" onclick={() => clickSuggestion(text)}>
              {text}
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  <!-- Scroll to bottom button -->
  {#if userScrolledUp}
    <button class="scroll-bottom-btn" onclick={scrollToBottom}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  {/if}

  <!-- Input -->
  <div class="chat-input-wrap">
    <div class="chat-input-row">
      <textarea
        class="chat-input"
        bind:value={inputText}
        onkeydown={handleKeydown}
        placeholder="Tanya tentang materi RPL..."
        rows="1"
        disabled={tutor.isWaiting}
      ></textarea>
      {#if tutor.isWaiting}
        <button class="stop-btn" onclick={stopGeneration} title="Stop">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
        </button>
      {:else}
        <button
          class="send-btn"
          onclick={sendMessage}
          disabled={!inputText.trim()}
          title="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      {/if}
    </div>
    <p class="input-hint">{tutor.isWaiting ? 'AI sedang menulis...' : 'Enter untuk kirim · Shift+Enter untuk newline'}</p>
  </div>
</div>

<style>
  .chat-page {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px);
    position: relative;
  }

  /* ── Header ── */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 12px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0;
    flex-shrink: 0;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .chat-header h1 {
    font-size: 18px;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .header-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--accent-dim);
    color: var(--accent-secondary);
    -webkit-text-fill-color: var(--accent-secondary);
  }
  .header-actions {
    display: flex;
    gap: 6px;
  }
  .header-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .header-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(239, 68, 68, 0.06);
  }

  /* ── Messages ── */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 4px 8px 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 0;
    scroll-behavior: smooth;
  }

  .message {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    animation: fadeIn 0.25s ease both;
  }
  .message.user {
    flex-direction: row-reverse;
  }

  .msg-avatar {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .message.assistant .msg-avatar {
    background: var(--accent-dim);
    color: var(--accent-secondary);
  }
  .message.user .msg-avatar {
    background: var(--accent);
    color: #fff;
  }

  .msg-content {
    max-width: 80%;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .message.user .msg-content {
    align-items: flex-end;
  }
  .message.assistant .msg-content {
    align-items: flex-start;
  }

  .msg-bubble {
    padding: 10px 16px;
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.55;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .message.user .msg-bubble {
    background: var(--accent);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .message.assistant .msg-bubble {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    border-bottom-left-radius: 4px;
  }
  .message.streaming .msg-bubble {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent-dim);
  }

  .msg-text {
    margin: 0;
    white-space: pre-wrap;
  }

  .msg-time {
    font-size: 10px;
    color: var(--text-secondary);
    opacity: 0.5;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 4px;
  }
  .message.user .msg-time {
    color: var(--accent-secondary);
    opacity: 0.6;
  }

  .stream-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 1s ease-in-out infinite;
    display: inline-block;
  }

  /* ── Typing Indicator ── */
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 2px;
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

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Welcome ── */
  .welcome {
    text-align: center;
    padding: 48px 20px 24px;
    margin: auto;
  }
  .welcome-icon {
    margin-bottom: 16px;
    color: var(--accent-secondary);
    opacity: 0.6;
  }
  .welcome h2 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text);
  }
  .welcome p {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 440px;
    margin: 0 auto 24px;
    line-height: 1.6;
  }

  /* ── Suggestion Chips ── */
  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0 8px;
  }
  .message .suggestion-chips {
    margin-left: 44px;
  }
  .chip {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .chip:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
    transform: translateY(-1px);
  }
  .chip:active {
    transform: translateY(0) scale(0.97);
  }

  /* ── Scroll to bottom ── */
  .scroll-bottom-btn {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: fadeIn 0.2s ease both;
  }
  .scroll-bottom-btn:hover {
    background: var(--surface-hover);
    color: var(--accent);
    border-color: var(--accent);
    transform: translateX(-50%) translateY(-2px);
  }

  /* ── Input ── */
  .chat-input-wrap {
    border-top: 1px solid var(--border);
    padding: 10px 0 0;
    flex-shrink: 0;
  }
  .chat-input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .chat-input {
    flex: 1;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    min-height: 44px;
    max-height: 132px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    line-height: 1.5;
  }
  .chat-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .chat-input::placeholder { color: var(--text-secondary); }
  .chat-input:disabled {
    opacity: 0.5;
  }

  /* Send button */
  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: var(--accent);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .send-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.04);
  }
  .send-btn:active:not(:disabled) {
    transform: scale(0.96);
  }
  .send-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  /* Stop button */
  .stop-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: var(--danger);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;
    animation: fadeIn 0.15s ease both;
  }
  .stop-btn:hover {
    opacity: 0.9;
    transform: scale(1.04);
  }

  .input-hint {
    font-size: 10px;
    color: var(--text-secondary);
    text-align: right;
    margin-top: 5px;
    opacity: 0.4;
    transition: opacity 0.2s;
  }
  .chat-input-wrap:hover .input-hint {
    opacity: 0.7;
  }

  /* ── Markdown overrides inside bubbles ── */
  .message.assistant .msg-bubble :global(.markdown-content) {
    font-size: 14px;
    line-height: 1.6;
  }
  .message.assistant .msg-bubble :global(.markdown-content p) {
    margin: 0.5em 0;
  }
  .message.assistant .msg-bubble :global(.markdown-content p:first-child) {
    margin-top: 0;
  }
  .message.assistant .msg-bubble :global(.markdown-content p:last-child) {
    margin-bottom: 0;
  }
  .message.assistant .msg-bubble :global(.markdown-content pre) {
    margin: 0.75em 0;
    border-radius: 10px;
  }
  .message.assistant .msg-bubble :global(.markdown-content code) {
    font-size: 0.82em;
  }
  .message.assistant .msg-bubble :global(.markdown-content .copy-btn) {
    font-size: 0.7rem;
    padding: 2px 8px;
    font-family: inherit;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .chat-page {
      height: calc(100vh - 60px);
      padding: 0;
    }
    .chat-messages {
      padding: 12px 2px 4px;
    }
    .msg-content {
      max-width: 88%;
    }
    .welcome {
      padding: 32px 12px 16px;
    }
    .welcome h2 {
      font-size: 17px;
    }
    .chat-input {
      font-size: 13px;
      min-height: 40px;
    }
    .send-btn, .stop-btn {
      width: 40px;
      height: 40px;
    }
  }
</style>
