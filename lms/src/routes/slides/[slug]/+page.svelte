<script lang="ts">
  import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
  import { onMount } from 'svelte';

  let { data } = $props();

  let slug = $derived(data.slug);
  let slidesContent = $state('');
  let slides = $state<string[]>([]);
  let currentSlide = $state(0);
  let loading = $state(true);
  let error = $state('');
  let fullscreen = $state(false);
  let showNotes = $state(false);
  let containerEl: HTMLElement | undefined = $state();

  const totalSlides = $derived(slides.length);
  const hasNotes = $derived.by(() => {
    if (!slides[currentSlide]) return false;
    return slides[currentSlide].includes(':::notes');
  });
  const notesContent = $derived.by(() => {
    if (!slides[currentSlide]) return '';
    const match = slides[currentSlide].match(/:::notes\s*([\s\S]*?)(?:::|\n*$)/);
    return match ? match[1].trim() : '';
  });
  const cleanContent = $derived.by(() => {
    if (!slides[currentSlide]) return '';
    return slides[currentSlide].replace(/:::notes[\s\S]*?(:::|\n*$)/g, '').trim();
  });

  function navigateSlide(dir: number) {
    const next = currentSlide + dir;
    if (next >= 0 && next < totalSlides) {
      currentSlide = next;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      navigateSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigateSlide(-1);
    } else if (e.key === 'f') {
      toggleFullscreen();
    } else if (e.key === 'n') {
      showNotes = !showNotes;
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreen = true;
    } else {
      document.exitFullscreen();
      fullscreen = false;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  async function loadSlides() {
    try {
      const res = await fetch(`/content/slides/${slug}`);
      if (!res.ok) throw new Error('Slide tidak ditemukan');
      const text = await res.text();
      slidesContent = text;
      // Split on --- separator (consistent with slide markdown format)
      const parts = text.split(/\n---\n/).filter(p => p.trim());
      slides = parts.length > 0 ? parts : [text];
    } catch (e) {
      error = 'Gagal memuat slide';
    }
    loading = false;
  }

  $effect(() => {
    loadSlides();
  });
</script>

<svelte:head>
  <title>{slug} — Slides</title>
</svelte:head>

{#if loading}
  <div class="slides-loading">Memuat slide...</div>
{:else if error}
  <div class="slides-error">
    <h2>{error}</h2>
    <p>Slide "{slug}" tidak ditemukan</p>
    <a href="/">Kembali ke Beranda</a>
  </div>
{:else}
  <div
    class="slides-container"
    class:fullscreen={fullscreen}
    bind:this={containerEl}
  >
    <!-- Toolbar -->
    <div class="slides-toolbar">
      <div class="slide-counter">
        {currentSlide + 1} / {totalSlides}
      </div>
      <div class="toolbar-actions">
        {#if hasNotes}
          <button
            class="toolbar-btn"
            class:active={showNotes}
            onclick={() => showNotes = !showNotes}
            title="Speaker Notes (n)"
          >
            📝 Notes
          </button>
        {/if}
        <button class="toolbar-btn" onclick={toggleFullscreen} title="Fullscreen (f)">
          {fullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
        </button>
      </div>
    </div>

    <!-- Slide content -->
    <div class="slide-viewport">
      <div class="slide-content markdown-content">
        {@html parseMarkdown(cleanContent)}
      </div>

      <!-- Speaker notes panel -->
      {#if showNotes && notesContent}
        <div class="speaker-notes">
          <h4>📝 Speaker Notes</h4>
          <p>{notesContent}</p>
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <div class="slides-nav">
      <button
        class="nav-arrow"
        disabled={currentSlide === 0}
        onclick={() => navigateSlide(-1)}
      >
        &larr; Previous
      </button>

      <div class="slide-dots">
        {#each Array(totalSlides) as _, i}
          <button
            class="dot"
            class:active={i === currentSlide}
            onclick={() => currentSlide = i}
            aria-label="Go to slide {i + 1}"
          ></button>
        {/each}
      </div>

      <button
        class="nav-arrow"
        disabled={currentSlide === totalSlides - 1}
        onclick={() => navigateSlide(1)}
      >
        Next &rarr;
      </button>
    </div>
  </div>
{/if}

<style>
  .slides-loading, .slides-error {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }
  .slides-error h2 { margin-bottom: 8px; }
  .slides-error a { color: var(--accent); }
  .slides-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: calc(100vh - 100px);
  }
  .slides-container.fullscreen {
    max-width: 100%;
    height: 100vh;
    padding: 12px;
    background: var(--bg);
  }
  .slides-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .slide-counter {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .toolbar-actions {
    display: flex;
    gap: 8px;
  }
  .toolbar-btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .toolbar-btn:hover { border-color: var(--accent); color: var(--accent); }
  .toolbar-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
  .slide-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }
  .slide-content {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 400px;
    font-size: 1.1em;
    line-height: 1.7;
  }
  .slide-content :global(h1) { font-size: 32px; margin-bottom: 20px; }
  .slide-content :global(h2) { font-size: 26px; margin-bottom: 16px; }
  .slide-content :global(h3) { font-size: 20px; margin-bottom: 12px; }
  .slide-content :global(p) { margin-bottom: 16px; }
  .slide-content :global(ul), .slide-content :global(ol) { margin-bottom: 16px; padding-left: 24px; }
  .slide-content :global(img) { max-width: 100%; border-radius: 8px; margin: 16px 0; }
  .slide-content :global(code) {
    background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px;
    font-size: 0.9em; font-family: 'Fira Code', 'JetBrains Mono', monospace;
  }
  .slide-content :global(pre) {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;
  }
  .slide-content :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary);
  }
  .speaker-notes {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;
  }
  .speaker-notes h4 {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-secondary);
  }
  .speaker-notes p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .slides-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .nav-arrow {
    padding: 8px 20px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .nav-arrow:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .nav-arrow:disabled { opacity: 0.3; cursor: default; }
  .slide-dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease;
  }
  .dot:hover { border-color: var(--accent); }
  .dot.active {
    background: var(--accent);
    border-color: var(--accent);
  }
  @media (max-width: 768px) {
    .slide-content { padding: 24px; min-height: 300px; }
    .slide-content :global(h1) { font-size: 24px; }
    .slide-content :global(h2) { font-size: 20px; }
    .slides-nav { flex-direction: column; gap: 12px; }
  }
</style>
