<script lang="ts">
  import { flashcards } from '$lib/stores/flashcards.svelte';
  import type { DeckMeta } from '$lib/stores/flashcards.svelte';
  import { modules } from '$lib/stores/modules';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let selectedModule = $state('');
  let selectedDifficulty = $state<string>('all');
  let deckFilter = $state<string>('all');
  let isGenerating = $state(false);
  let generationResult = $state<{ slug: string; count: number } | null>(null);
  let refreshKey = $state(0);

  let counts = $derived.by(() => {
    void refreshKey;
    void flashcards.version;
    return flashcards.getCardCounts();
  });

  let decks = $derived.by(() => {
    void refreshKey;
    void flashcards.version;
    return flashcards.getDecks();
  });

  let reviewStats = $derived.by(() => {
    void refreshKey;
    return flashcards.getReviewStats();
  });

  function refresh() { refreshKey++; }

  onMount(() => { refresh(); });

  async function generateFlashcards() {
    if (!selectedModule || isGenerating) return;
    isGenerating = true;
    generationResult = null;
    const count = await flashcards.generateFromModule(selectedModule);
    if (count > 0) {
      generationResult = { slug: selectedModule, count };
    }
    isGenerating = false;
    refresh();
  }

  function startReview() {
    goto('/flashcards/review');
  }

  function reviewDeck(slug: string) {
    goto(`/flashcards/review?deck=${slug}`);
  }

  function deleteDeckCards(slug: string) {
    if (!confirm(`Hapus semua kartu dari deck "${slug}"?`)) return;
    const cards = flashcards.getCardsByDeck(slug);
    for (const c of cards) flashcards.deleteCard(c.id);
    refresh();
  }
</script>

<div class="page">
  <h1>🃏 Flashcards</h1>
  <p class="subtitle">Kartu belajar dengan sistem pengulangan terjadwal (spaced repetition)</p>

  <!-- Stats Dashboard -->
  <div class="stats-grid">
    <div class="stat-card accent">
      <span class="stat-value">{counts.dueToday}</span>
      <span class="stat-label">Jatuh Tempo Hari Ini</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{counts.total}</span>
      <span class="stat-label">Total Kartu</span>
    </div>
    <div class="stat-card success">
      <span class="stat-value">{counts.known}</span>
      <span class="stat-label">Diketahui</span>
    </div>
    <div class="stat-card warn">
      <span class="stat-value">{counts.learning}</span>
      <span class="stat-label">Sedang Dipelajari</span>
    </div>
    <div class="stat-card info">
      <span class="stat-value">{counts.newCards}</span>
      <span class="stat-label">Kartu Baru</span>
    </div>
    <div class="stat-card neutral">
      <span class="stat-value">{counts.decks}</span>
      <span class="stat-label">Deck</span>
    </div>
  </div>

  <!-- Review Stats -->
  {#if reviewStats.totalReviewed > 0}
    <div class="review-stats">
      <span class="rs-item">✅ {reviewStats.totalCorrect} benar</span>
      <span class="rs-item">📊 {counts.total > 0 ? Math.round((reviewStats.totalCorrect / Math.max(reviewStats.totalReviewed, 1)) * 100) : 0}% akurasi</span>
      <span class="rs-item">🔥 Streak: {reviewStats.streak} (rekor: {reviewStats.bestStreak})</span>
      <span class="rs-item">📅 Total review: {reviewStats.totalReviewed}</span>
    </div>
  {/if}

  <!-- Deck Categories -->
  {#if decks.length > 0}
    <div class="decks-section">
      <h2>📂 Deck Berdasarkan Modul</h2>
      <div class="decks-grid">
        {#each decks as deck}
          <div class="deck-card">
            <div class="deck-header">
              <span class="deck-title">{deck.title}</span>
              <span class="deck-count">{deck.cardCount} kartu</span>
            </div>
            <div class="deck-category">
              {#if deck.category === 'quiz'}
                <span class="cat-badge quiz">📝 Quiz</span>
              {:else if deck.category === 'summary'}
                <span class="cat-badge summary">📖 Ringkasan</span>
              {:else}
                <span class="cat-badge custom">✏️ Custom</span>
              {/if}
            </div>
            <div class="deck-actions">
              <button class="btn small accent" onclick={() => reviewDeck(deck.slug)}>
                Review
              </button>
              <button class="btn small danger" onclick={() => deleteDeckCards(deck.slug)}>
                Hapus
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Actions -->
  <div class="actions-card">
    <h2>⚙️ Kelola Flashcards</h2>

    <div class="generate-section">
      <label for="module-select">Pilih Modul:</label>
      <select id="module-select" bind:value={selectedModule}>
        <option value="">-- Pilih Modul --</option>
        {#each modules as mod}
          <option value={mod.slug}>{mod.title}</option>
        {/each}
      </select>
      <button
        class="btn primary"
        onclick={generateFlashcards}
        disabled={!selectedModule || isGenerating}
      >
        {isGenerating ? '⏳ Membuat...' : '🎴 Generate Flashcards'}
      </button>
    </div>

    {#if generationResult}
      <div class="result-banner">
        ✅ {generationResult.count} kartu baru dibuat!
      </div>
    {/if}

    {#if counts.total > 0}
      <div class="review-section">
        <button class="btn big primary" onclick={startReview}>
          🚀 Mulai Review ({counts.dueToday} kartu jatuh tempo)
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .page { max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .stat-card.accent { border-color: var(--accent); }
  .stat-card.success { border-color: #22c55e; }
  .stat-card.warn { border-color: #f59e0b; }
  .stat-card.info { border-color: #3b82f6; }
  .stat-card.neutral { border-color: var(--text-secondary); }
  .stat-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
  }
  .stat-card.accent .stat-value { color: var(--accent); }
  .stat-card.success .stat-value { color: #22c55e; }
  .stat-card.warn .stat-value { color: #f59e0b; }
  .stat-card.info .stat-value { color: #3b82f6; }
  .stat-card.neutral .stat-value { color: var(--text-secondary); }
  .stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Review stats bar */
  .review-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .rs-item { font-weight: 500; }

  /* Decks */
  .decks-section { margin-bottom: 20px; }
  .decks-section h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
  }
  .deck-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.15s;
  }
  .deck-card:hover { border-color: var(--accent); }
  .deck-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .deck-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .deck-count { font-size: 11px; color: var(--text-secondary); }
  .deck-actions {
    display: flex;
    gap: 6px;
  }

  .cat-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .cat-badge.quiz { background: rgba(59,130,246,0.1); color: #3b82f6; }
  .cat-badge.summary { background: rgba(139,92,246,0.1); color: #8b5cf6; }
  .cat-badge.custom { background: rgba(107,114,128,0.1); color: var(--text-secondary); }

  .btn.small { padding: 6px 12px; font-size: 12px; border-radius: 6px; }
  .btn.danger { border-color: #ef4444; color: #ef4444; }
  .btn.danger:hover { background: rgba(239,68,68,0.1); }

  .actions-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
  }
  .actions-card h2 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }

  .generate-section {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
  }
  .generate-section label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
  select {
    flex: 1;
    min-width: 200px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    font-family: inherit;
  }

  .btn {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .btn.primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .btn.primary:hover:not(:disabled) { opacity: 0.9; }
  .btn:disabled { opacity: 0.4; cursor: default; }
  .btn.big { padding: 12px 24px; font-size: 15px; width: 100%; }

  .result-banner {
    padding: 10px 16px;
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .review-section { margin-top: 8px; }

  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .decks-grid { grid-template-columns: 1fr; }
  }
</style>
