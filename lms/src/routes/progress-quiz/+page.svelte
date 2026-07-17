<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/user.svelte';
  import { progress } from '$lib/stores/progress.svelte';
  import { modules } from '$lib/stores/modules';

  const BLOCK_SIZE = 5;
  const totalModules = modules.length;
  const totalBlocks = Math.ceil(totalModules / BLOCK_SIZE);

  type BlockInfo = {
    id: number;
    modules: string[];
    moduleTitles: string[];
    locked: boolean;
    completed: boolean;
    tries: number;
    bestScore: number;
    bestPct: number;
  };

  let blocks = $state<BlockInfo[]>([]);
  let loading = $state(true);

  let totalCompleted = $derived(blocks.filter(b => b.completed).length);
  let totalAvailable = $derived(blocks.filter(b => !b.locked).length);
  let overallPct = $derived(totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0);

  onMount(() => {
    if (!user.isLoggedIn) {
      goto('/login');
      return;
    }
    buildBlocks();
  });

  function getBlockTries(blockId: number): { tries: number; bestScore: number; bestPct: number } {
    if (typeof localStorage === 'undefined') return { tries: 0, bestScore: 0, bestPct: 0 };
    const tryKey = `progquiz-tries-${blockId}`;
    const bestKey = `progquiz-best-${blockId}`;
    const tries = parseInt(localStorage.getItem(tryKey) || '0', 10);
    const bestScore = parseInt(localStorage.getItem(bestKey) || '0', 10);
    const bestPct = bestScore > 0 ? Math.round((bestScore / 10) * 100) : 0; // assume 10 questions per block
    return { tries, bestScore, bestPct };
  }

  function buildBlocks() {
    const result: BlockInfo[] = [];
    for (let i = 0; i < totalBlocks; i++) {
      const start = i * BLOCK_SIZE;
      const end = Math.min(start + BLOCK_SIZE, totalModules);
      const blockMods = modules.slice(start, end);
      const modSlugs = blockMods.map(m => m.slug);
      const modTitles = blockMods.map(m => m.title);

      let allDone = true;
      let allPrevDone = true;
      for (const m of blockMods) {
        for (const s of m.sessions) {
          if (!progress.isSessionCompleted(m.slug, s.id)) {
            allDone = false;
            break;
          }
        }
        if (!allDone) break;
      }

      if (i > 0) {
        const prevStart = (i - 1) * BLOCK_SIZE;
        const prevEnd = Math.min(prevStart + BLOCK_SIZE, totalModules);
        const prevMods = modules.slice(prevStart, prevEnd);
        for (const m of prevMods) {
          for (const s of m.sessions) {
            if (!progress.isSessionCompleted(m.slug, s.id)) {
              allPrevDone = false;
              break;
            }
          }
          if (!allPrevDone) break;
        }
      }

      const stats = getBlockTries(i);

      result.push({
        id: i,
        modules: modSlugs,
        moduleTitles: modTitles,
        locked: i > 0 && !allPrevDone,
        completed: allDone,
        tries: stats.tries,
        bestScore: stats.bestScore,
        bestPct: stats.bestPct,
      });
    }
    blocks = result;
    loading = false;
  }
</script>

<div class="progress-quiz-page">
  <h1>📊 Progress Quiz</h1>
  <p class="subtitle">Uji pemahaman setiap {BLOCK_SIZE} modul. 10 soal, 5 menit, minimal 70% untuk lulus.</p>

  <!-- Summary stats -->
  <div class="summary-cards">
    <div class="summary-card">
      <span class="summary-value">{totalCompleted}</span>
      <span class="summary-label">Blok Selesai</span>
    </div>
    <div class="summary-card">
      <span class="summary-value">{overallPct}%</span>
      <span class="summary-label">Progres Quiz</span>
    </div>
    <div class="summary-card">
      <span class="summary-value">{totalBlocks}</span>
      <span class="summary-label">Total Blok</span>
    </div>
  </div>

  {#if loading}
    <div class="loading-state">Memuat...</div>
  {:else}
    <div class="blocks-grid">
      {#each blocks as block}
        <div
          class="block-card"
          class:locked={block.locked}
          class:completed={block.completed}
          class:unlocked={!block.locked && !block.completed}
        >
          <div class="block-header">
            <span class="block-num">Blok {block.id + 1}</span>
            <span class="block-range">
              Modul {block.id * BLOCK_SIZE + 1}–{Math.min((block.id + 1) * BLOCK_SIZE, totalModules)}
            </span>
          </div>
          <div class="block-modules">
            {#each block.moduleTitles.slice(0, 3) as title}
              <span class="block-module">{title}</span>
            {/each}
            {#if block.moduleTitles.length > 3}
              <span class="block-more">+{block.moduleTitles.length - 3} lagi</span>
            {/if}
          </div>
          <div class="block-status">
            {#if block.locked}
              <span class="status-locked">🔒 Selesaikan blok sebelumnya</span>
            {:else if block.completed}
              <span class="status-completed">✅ Selesai</span>
              {#if block.tries > 0}
                <span class="block-stats">{block.tries}x coba · Terbaik {block.bestScore}/10 ({block.bestPct}%)</span>
              {/if}
            {:else}
              <button class="btn-start" onclick={() => goto(`/progress-quiz/${block.id}`)}>
                Mulai Quiz →
              </button>
            {/if}
          </div>
          {#if !block.locked && block.tries > 0 && !block.completed}
            <div class="block-footer-stats">
              <span>{block.tries}x coba · Terbaik {block.bestPct}%</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if totalCompleted === totalBlocks && totalBlocks > 0}
      <div class="all-done-banner">
        <span>🎉 Semua blok quiz selesai! Kamu telah menyelesaikan seluruh Progress Quiz.</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .progress-quiz-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 0;
  }

  h1 {
    font-size: 28px;
    color: var(--text);
    margin-bottom: 4px;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 24px;
  }

  .summary-cards {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .summary-card {
    flex: 1;
    text-align: center;
    padding: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .summary-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .summary-label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
    margin-top: 2px;
    display: block;
  }

  .loading-state {
    text-align: center;
    padding: 60px;
    color: var(--text-secondary);
  }

  .blocks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .block-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: border-color 0.15s;
  }

  .block-card.locked { opacity: 0.5; }
  .block-card.unlocked { border-color: var(--accent-dim); }
  .block-card.completed { border-color: rgba(46, 204, 113, 0.3); }

  .block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .block-num { font-size: 16px; font-weight: 700; color: var(--text); }
  .block-range { font-size: 12px; color: var(--text-secondary); }

  .block-modules {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
  }

  .block-module { font-size: 13px; color: var(--text-secondary); }
  .block-more { font-size: 12px; color: var(--text-secondary); font-style: italic; }

  .block-status { text-align: center; }
  .status-locked { font-size: 13px; color: var(--text-secondary); }
  .status-completed { font-size: 13px; color: #2ecc71; font-weight: 500; display: block; }
  .block-stats { font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block; }
  .block-footer-stats { text-align: center; margin-top: 10px; font-size: 11px; color: var(--text-secondary); padding-top: 8px; border-top: 1px solid var(--border); }

  .btn-start {
    padding: 10px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .btn-start:hover { opacity: 0.9; }

  .all-done-banner {
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid rgba(46, 204, 113, 0.3);
    border-radius: 12px;
    color: #2ecc71;
    font-weight: 600;
    font-size: 15px;
  }
</style>
