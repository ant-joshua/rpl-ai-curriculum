<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { modules } from '$lib/stores/modules';
  import { fade } from 'svelte/transition';

  // Get modules that have slide content (from slides/ dir by module dirName)
  // Map from slide dir name to module slug
  let slideModules = $derived(
    modules.filter(m => {
      // Check if slide content exists — we'll know after prebuild
      return true; // All modules have slide dirs
    }).map(m => ({
      slug: m.slug,
      title: m.title,
      sessionCount: m.sessions.length,
    }))
  );
</script>

<svelte:head>
  <title>Slides — RPL AI Curriculum</title>
</svelte:head>

<div class="slides-page">
  <h1 class="slides-title">🖥️ Slides</h1>
  <p class="slides-subtitle">Presentasi slide untuk setiap modul — navigasi arrow keys, fullscreen, speaker notes</p>

  <div class="slides-grid">
    {#each slideModules as sm (sm.slug)}
      <a href="/slides/{sm.slug}" class="slide-card" in:fade={{ duration: 200 }}>
        <div class="slide-card-icon">🖥️</div>
        <div class="slide-card-info">
          <h2>{sm.title}</h2>
          <span class="slide-count">{sm.sessionCount} sesi</span>
        </div>
        <span class="slide-arrow">&rarr;</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .slides-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 0;
  }
  .slides-title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 4px;
    color: var(--text);
  }
  .slides-subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 28px;
  }
  .slides-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 10px;
  }
  .slide-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    text-decoration: none !important;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .slide-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-dim);
  }
  .slide-card-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 10px;
    flex-shrink: 0;
  }
  .slide-card-info {
    flex: 1;
    min-width: 0;
  }
  .slide-card-info h2 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
    line-height: 1.3;
  }
  .slide-count {
    font-size: 12px;
    color: var(--text-secondary);
  }
  .slide-arrow {
    font-size: 18px;
    color: var(--text-secondary);
    flex-shrink: 0;
  }
  @media (max-width: 768px) {
    .slides-grid { grid-template-columns: 1fr; }
  }
</style>
