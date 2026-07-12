<script lang="ts">
  import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
  import { caseStudies, getCaseStudyBySlug } from '$lib/stores/case-studies';

  let { data } = $props();

  let slug = $derived(data.slug);
  let cs = $derived(data.caseStudy);
  let content = $state('');
  let loading = $state(true);
  let error = $state('');

  async function loadContent() {
    if (!cs) {
      error = 'Case study tidak ditemukan';
      loading = false;
      return;
    }
    try {
      const res = await fetch(`/content/references/case-studies/${cs.filePath}`);
      if (!res.ok) throw new Error('Gagal memuat konten');
      const text = await res.text();
      const cleaned = stripFrontmatter(text);
      content = parseMarkdown(cleaned);
    } catch (e) {
      error = 'Gagal memuat konten case study';
    }
    loading = false;
  }

  $effect(() => {
    loadContent();
  });
</script>

<svelte:head>
  <title>{cs?.title ?? 'Case Study'} — RPL AI Curriculum</title>
</svelte:head>

<div class="cs-detail-page">
  {#if loading}
    <div class="cs-loading">Memuat case study...</div>
  {:else if error}
    <div class="cs-error">
      <h2>{error}</h2>
      <a href="/case-studies" class="back-link">&larr; Kembali ke daftar case studies</a>
    </div>
  {:else if cs}
    <a href="/case-studies" class="back-link">&larr; Semua Case Studies</a>
    <div class="cs-meta">
      <span class="cs-company-badge">{cs.company}</span>
      <span class="cs-level-badge">{cs.level}</span>
      {#if cs.moduleSlug}
        <a href="/module/{cs.moduleSlug}" class="cs-module-link">📚 Terkait: {cs.moduleSlug}</a>
      {/if}
    </div>
    <div class="cs-content markdown-content">
      {@html content}
    </div>
  {:else}
    <div class="cs-error">
      <h2>Case study tidak ditemukan</h2>
      <a href="/case-studies" class="back-link">&larr; Kembali ke daftar case studies</a>
    </div>
  {/if}
</div>

<style>
  .cs-detail-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 0;
  }
  .cs-loading, .cs-error {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }
  .back-link {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 16px;
    text-decoration: none !important;
  }
  .back-link:hover {
    color: var(--accent);
  }
  .cs-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .cs-company-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 6px;
    background: var(--accent-dim);
    color: var(--accent);
  }
  .cs-level-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
  }
  .cs-module-link {
    font-size: 12px;
    color: var(--accent);
    text-decoration: none !important;
  }
  .cs-module-link:hover {
    text-decoration: underline !important;
  }
  .cs-content {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    line-height: 1.7;
  }
  .cs-content :global(h1),
  .cs-content :global(h2),
  .cs-content :global(h3),
  .cs-content :global(h4) {
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 600;
    color: var(--text);
  }
  .cs-content :global(h1) { font-size: 24px; }
  .cs-content :global(h2) { font-size: 20px; }
  .cs-content :global(h3) { font-size: 18px; }
  .cs-content :global(p) { margin-bottom: 16px; color: var(--text); }
  .cs-content :global(ul), .cs-content :global(ol) { margin-bottom: 16px; padding-left: 24px; }
  .cs-content :global(img) { max-width: 100%; border-radius: 8px; margin: 16px 0; }
  .cs-content :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary);
  }
  .cs-content :global(table) { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .cs-content :global(th), .cs-content :global(td) { padding: 10px 14px; border: 1px solid var(--border); text-align: left; }
  .cs-content :global(th) { background: var(--bg-secondary); font-weight: 600; }
  .cs-content :global(code) {
    background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px;
    font-size: 0.9em; font-family: 'Fira Code', 'JetBrains Mono', monospace;
  }
  .cs-content :global(pre) {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;
  }
  .cs-content :global(pre code) { background: none; padding: 0; }
  @media (max-width: 768px) {
    .cs-meta { flex-direction: column; align-items: flex-start; }
  }
</style>
