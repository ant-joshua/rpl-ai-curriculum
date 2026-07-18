<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { caseStudies, type CaseStudy } from '$lib/stores/case-studies';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  let { data } = $props();

  function getLevelColor(level: string): string {
    if (level.includes('Beginner')) return 'var(--success, #22c55e)';
    if (level.includes('Intermediate')) return 'var(--accent, #f59e0b)';
    return '#ef4444';
  }
</script>

<svelte:head>
  <title>Case Studies — RPL AI Curriculum</title>
</svelte:head>

<div class="cs-page">
  <h1 class="cs-title">📋 Case Studies</h1>
  <p class="cs-subtitle">Studi kasus perusahaan teknologi nyata yang relevan dengan materi kurikulum</p>

  <div class="cs-grid">
    {#each caseStudies as cs (cs.slug)}
      <a href="/case-study/{cs.slug}" class="cs-card" in:fade={{ duration: 300 }}>
        <div class="cs-card-header">
          <span class="cs-company">{cs.company}</span>
          <span class="cs-level" style="background: {getLevelColor(cs.level)}22; color: {getLevelColor(cs.level)}">
            {cs.level}
          </span>
        </div>
        <h2 class="cs-card-title">{cs.title}</h2>
        <p class="cs-card-desc">{cs.description}</p>
        <div class="cs-card-footer">
          {#if cs.moduleSlug}
            <span class="cs-module-badge">🔗 Terkait: {cs.moduleSlug}</span>
          {/if}
          <span class="cs-read-more">Baca selengkapnya &rarr;</span>
        </div>
      </a>
    {/each}
  </div>
</div>

<style>
  .cs-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 0;
  }
  .cs-title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 4px;
    color: var(--text);
  }
  .cs-subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 28px;
  }
  .cs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
  .cs-card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-radius: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    text-decoration: none !important;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  }
  .cs-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-dim);
    transform: translateY(-2px);
  }
  .cs-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .cs-company {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .cs-level {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .cs-card-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text);
    line-height: 1.3;
  }
  .cs-card-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    flex: 1;
    margin-bottom: 12px;
  }
  .cs-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cs-module-badge {
    font-size: 11px;
    color: var(--accent);
    opacity: 0.8;
  }
  .cs-read-more {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }
</style>
