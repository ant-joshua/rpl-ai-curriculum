<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
  import { fade } from 'svelte/transition';
  import { addToast } from '$lib/stores/toast.svelte';
  import { auth } from '$lib/stores/auth.svelte';
  import { browser } from '$app/environment';
  import Icon from '$lib/components/ui/Icon.svelte';
  import SearchInput from '$lib/components/ui/SearchInput.svelte';
  import { EmptyState, SkeletonCard } from '$lib/components/ui/index.js';
  import CourseCard from '$lib/components/catalog/CourseCard.svelte';

  let { data }: { data: import('./$types').PageData } = $props();

  let offerings = $state(data.offerings || []);
  let isAuthenticated = $state(false);
  let enrollingId = $state<string | null>(null);
  let loading = $state(true);

  // Artificial loading delay so skeleton shows
  $effect(() => {
    if (browser) {
      isAuthenticated = auth.isLoggedIn;
      const t = setTimeout(() => (loading = false), 300);
      return () => clearTimeout(t);
    }
  });

  let searchQuery = $state('');
  let levelFilter = $state<string>('all');
  let categoryFilter = $state<string>('all');

  let categories = $derived([...new Set(offerings.map(o => o.category).filter(Boolean))]);

  let filteredOfferings = $derived(
    offerings.filter(o => {
      if (levelFilter !== 'all' && o.level !== levelFilter) return false;
      if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.courseTitle.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.name && o.name.toLowerCase().includes(q))
        );
      }
      return true;
    })
  );

  async function handleEnroll(offeringId: string) {
    if (!isAuthenticated) {
      addToast('Please login first to enroll', 'warning');
      return;
    }

    enrollingId = offeringId;
    try {
      const res = await fetch('/api/my/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId }),
      });
      const body = await res.json();

      if (body.success) {
        addToast('Successfully enrolled! 🎉', 'success');
        offerings = offerings.map(o =>
          o.id === offeringId
            ? { ...o, isEnrolled: true, enrolledCount: o.enrolledCount + 1 }
            : o
        );
      } else {
        addToast(body.error || 'Enrollment failed', 'error');
      }
    } catch {
      addToast('Failed to connect to server', 'error');
    } finally {
      enrollingId = null;
    }
  }

  function clearFilters() {
    searchQuery = '';
    levelFilter = 'all';
    categoryFilter = 'all';
  }
</script>

<svelte:head>
  <title>Course Catalog — RPL AI Curriculum</title>
</svelte:head>

<div class="catalog-page">
  <header class="catalog-header">
    <h1>Course Catalog</h1>
    <p class="catalog-subtitle">Browse and enroll in available courses</p>
  </header>

  <!-- Search + Filters -->
  <div class="catalog-controls">
    <SearchInput bind:value={searchQuery} placeholder="Search courses..." />

    <div class="filter-row">
      <select class="filter-select" bind:value={levelFilter}>
        <option value="all">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <select class="filter-select" bind:value={categoryFilter}>
        <option value="all">All Categories</option>
        {#each categories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>

      <span class="result-count">{filteredOfferings.length} course{filteredOfferings.length !== 1 ? 's' : ''}</span>
    </div>
  </div>

  {#if loading}
    <!-- Skeleton loading -->
    <div class="catalog-grid">
      {#each Array(6) as _}
        <SkeletonCard />
      {/each}
    </div>
  {:else if filteredOfferings.length === 0}
    <!-- Empty state -->
    <EmptyState
      icon="search"
      title="No courses found"
      description={searchQuery ? 'Try a different search term or clear your filters.' : 'No courses match your current filters.'}
    >
      <button class="clear-btn" onclick={clearFilters}>Clear all filters</button>
    </EmptyState>
  {:else}
    <!-- Course grid -->
    <div class="catalog-grid" transition:fade>
      {#each filteredOfferings as offering, i (offering.id)}
        <div
          transition:fade={{ duration: 200, delay: i * 30 }}
        >
          <CourseCard
            {offering}
            {isAuthenticated}
            {enrollingId}
            onenroll={handleEnroll}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .catalog-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .catalog-header {
    margin-bottom: 24px;
  }

  .catalog-header h1 {
    font-size: 28px;
    font-weight: 590;
    color: #1a1a2e;
    margin: 0 0 4px;
    font-feature-settings: 'cv01', 'ss03';
    letter-spacing: -0.288px;
  }

  .catalog-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    font-feature-settings: 'cv01', 'ss03';
  }

  .catalog-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-select {
    padding: 6px 12px;
    font-size: 13px;
    font-family: inherit;
    font-feature-settings: 'cv01', 'ss03';
    font-weight: 510;
    background: transparent;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 6px;
    color: #64748b;
    outline: none;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 140px;
  }

  .filter-select:hover {
    background: rgba(0,0,0,0.04);
    border-color: rgba(255,255,255,0.12);
    color: #1a1a2e;
  }

  .filter-select:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 2px rgba(79,70,229,0.15);
    color: #1a1a2e;
  }

  .result-count {
    margin-left: auto;
    font-size: 13px;
    color: #94a3b8;
    font-weight: 510;
    font-feature-settings: 'cv01', 'ss03';
  }

  /* Grid */
  .catalog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  /* Clear button */
  .clear-btn {
    background: transparent;
    border: 1px solid rgba(0,0,0,0.06);
    color: #64748b;
    font-family: inherit;
    font-size: 13px;
    font-weight: 510;
    font-feature-settings: 'cv01', 'ss03';
    padding: 7px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-btn:hover {
    background: rgba(79,70,229,0.06);
    border-color: rgba(79,70,229,0.15);
    color: #4F46E5;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .catalog-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .catalog-grid {
      grid-template-columns: 1fr;
    }

    .catalog-header h1 {
      font-size: 22px;
      letter-spacing: -0.264px;
    }

    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }

    .result-count {
      margin-left: 0;
      text-align: right;
    }
  }
</style>
