<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface SearchResult {
    id: string;
    blockTitle: string | null;
    lessonTitle: string;
    lessonSlug: string;
    offeringId: string;
    offeringName: string;
    courseTitle: string;
    snippet: string;
  }

  let {
    isOpen = false,
    onClose = () => {},
  }: {
    isOpen?: boolean;
    onClose?: () => void;
  } = $props();

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let searching = $state(false);
  let hasSearched = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (isOpen) {
      setTimeout(() => inputEl?.focus(), 100);
    }
  });

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function handleInput(value: string) {
    query = value;
    clearTimeout(debounceTimer);
    if (value.trim().length < 2) {
      results = [];
      hasSearched = false;
      return;
    }
    debounceTimer = setTimeout(() => doSearch(value.trim()), 300);
  }

  async function doSearch(q: string) {
    searching = true;
    hasSearched = true;
    try {
      const token = localStorage.getItem('lms-auth-token');
      const res = await fetch(`/api/my/courses/search?q=${encodeURIComponent(q)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const json = await res.json();
      results = json.data || [];
    } catch {
      results = [];
    } finally {
      searching = false;
    }
  }

  function closeSearch() {
    isOpen = false;
    onClose();
    query = '';
    results = [];
    hasSearched = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeSearch();
  }
</script>

{#if isOpen}
  <!-- Overlay -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="search-overlay" onclick={closeSearch}></div>

  <div class="search-panel" transition:fade={{ duration: 150 }} onkeydown={handleKeydown}>
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        bind:this={inputEl}
        type="text"
        class="search-input"
        placeholder="Cari materi, pelajaran..."
        value={query}
        oninput={(e) => handleInput((e.target as HTMLInputElement).value)}
        onkeydown={handleKeydown}
      />
      {#if searching}
        <span class="search-status">🔎</span>
      {:else if query && !searching}
        <button class="search-clear" onclick={() => { query = ''; results = []; hasSearched = false; }}>✕</button>
      {/if}
    </div>

    <div class="search-results">
      {#if !hasSearched}
        <div class="search-hint">Ketik minimal 2 karakter untuk mencari</div>
      {:else if searching}
        <div class="search-status-msg">Mencari...</div>
      {:else if results.length === 0}
        <div class="search-empty">Tidak ada hasil untuk "{query}"</div>
      {:else}
        <div class="result-count">{results.length} hasil</div>
        {#each results as r}
          <a
            href="/learn/{r.offeringId}/lessons/{r.lessonSlug}"
            class="result-item"
            onclick={closeSearch}
          >
            <div class="result-header">
              <span class="result-lesson-title">{r.lessonTitle}</span>
              {#if r.blockTitle}
                <span class="result-block-title">→ {r.blockTitle}</span>
              {/if}
            </div>
            <div class="result-snippet">{r.snippet}</div>
            <div class="result-meta">
              <span class="result-offering">{r.courseTitle} — {r.offeringName}</span>
            </div>
          </a>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .search-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 200;
  }
  .search-panel {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 560px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 160px);
    background: #1a1b1e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    z-index: 201;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideDown 0.2s ease both;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .search-icon { font-size: 16px; flex-shrink: 0; }
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f7f8f8;
    font-size: 15px;
    font-family: inherit;
  }
  .search-input::placeholder { color: #62666d; }
  .search-status { font-size: 14px; }
  .search-clear {
    background: none;
    border: none;
    color: #8a8f98;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
  }
  .search-clear:hover { color: #f7f8f8; }
  .search-results {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  .search-hint, .search-status-msg, .search-empty {
    text-align: center;
    padding: 24px 16px;
    color: #8a8f98;
    font-size: 13px;
  }
  .result-count {
    padding: 4px 16px 10px;
    font-size: 12px;
    color: #62666d;
    font-weight: 500;
  }
  .result-item {
    display: block;
    padding: 10px 16px;
    text-decoration: none;
    transition: background 0.1s;
  }
  .result-item:hover { background: rgba(255,255,255,0.04); }
  .result-header {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;
  }
  .result-lesson-title { font-size: 14px; font-weight: 600; color: #f7f8f8; }
  .result-block-title { font-size: 12px; color: #8a8f98; }
  .result-snippet {
    font-size: 12px;
    color: #8a8f98;
    margin-top: 2px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }
  .result-meta { margin-top: 4px; }
  .result-offering { font-size: 11px; color: #62666d; }
</style>
