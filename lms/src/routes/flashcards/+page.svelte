<script lang="ts">
  import { flashcards } from '$lib/stores/flashcards.svelte';
  import { modules } from '$lib/stores/modules';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let selectedModule = $state('');
  let isGenerating = $state(false);
  let generationResult = $state<{ slug: string; count: number } | null>(null);
  let refreshKey = $state(0);

  let counts = $derived.by(() => {
    void refreshKey;
    void flashcards.version;
    return flashcards.getCardCounts();
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
  </div>

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
          🚀 Mulai Review ({counts.dueToday} kartu)
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .page { max-width: 700px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
  .stat-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

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
  }
</style>
