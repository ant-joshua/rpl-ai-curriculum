<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import { Card, EmptyState, SearchInput, Skeleton } from '$lib/components/ui';

	type FilterType = 'all' | 'lesson' | 'course' | 'offering' | 'exercise' | 'video' | 'flashcard' | 'project';

	interface SearchResultItem {
		type: 'lesson' | 'course' | 'offering' | 'exercise' | 'video' | 'flashcard' | 'project';
		title: string;
		url: string;
		snippet: string;
		icon: string;
		moduleSlug?: string;
		difficulty?: string;
	}

	const RECENT_KEY = 'lms-recent-searches';

	let { data: pageData } = $props() as { data: { query: string; results: SearchResultItem[]; total: number } };
	const { query: initialQuery, results: initialResults, total: initialTotal } = pageData;

	let query = $state(initialQuery || '');
	let results = $state<SearchResultItem[]>(initialResults || []);
	let total = $state(initialTotal || 0);
	let loading = $state(false);
	let hasSearched = $state(initialQuery.length >= 2);
	let inputEl: HTMLInputElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	// Recent searches (stored in localStorage)
	let recentSearches = $state<string[]>([]);

	// Filter toggles
	let activeFilter = $state<FilterType>('all');

	$effect(() => {
		if (browser) {
			recentSearches = loadRecentSearches();
		}
	});

	function loadRecentSearches(): string[] {
		try {
			const raw = localStorage.getItem(RECENT_KEY);
			return raw ? JSON.parse(raw).slice(0, 8) : [];
		} catch { return []; }
	}

	function saveRecentSearch(q: string) {
		try {
			const list = loadRecentSearches();
			const filtered = list.filter(s => s !== q);
			filtered.unshift(q);
			localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 8)));
			recentSearches = filtered.slice(0, 8);
		} catch { /* ignore */ }
	}

	function removeRecentSearch(q: string) {
		try {
			const list = loadRecentSearches();
			const filtered = list.filter(s => s !== q);
			localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
			recentSearches = filtered;
		} catch { /* ignore */ }
	}

	function clearRecentSearches() {
		localStorage.removeItem(RECENT_KEY);
		recentSearches = [];
	}

	// Filtered results (client-side)
	let filteredResults = $derived(
		activeFilter === 'all'
			? results
			: results.filter(r => r.type === activeFilter)
	);

	let filteredTotal = $derived(filteredResults.length);

	async function doSearch(q: string) {
		if (!q.trim() || q.length < 2) {
			results = [];
			total = 0;
			hasSearched = false;
			return;
		}
		loading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`);
			if (!res.ok) throw new Error('Search failed');
			const data = await res.json();
			results = data.results || [];
			total = data.total || 0;
			hasSearched = true;
			if (results.length > 0) saveRecentSearch(q);
		} catch {
			results = [];
			total = 0;
		} finally {
			loading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		clearTimeout(debounceTimer);
		if (!query.trim() || query.length < 2) {
			results = [];
			total = 0;
			hasSearched = false;
			return;
		}
		debounceTimer = setTimeout(() => doSearch(query), 300);
	}

	function handleClear() {
		query = '';
		results = [];
		total = 0;
		hasSearched = false;
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && query) {
			e.preventDefault();
			handleClear();
		}
		if (e.key === 'Enter' && query.trim().length >= 2) {
			e.preventDefault();
			clearTimeout(debounceTimer);
			doSearch(query);
		}
	}

	function rerunSearch(q: string) {
		query = q;
		doSearch(q);
	}

	function typeIcon(type: string): string {
		const icons: Record<string, string> = {
			lesson: '📖',
			course: '📚',
			offering: '🗓️',
			exercise: '💻',
			video: '🎬',
			flashcard: '🃏',
			project: '📦',
		};
		return icons[type] || '📌';
	}

	function typeLabel(type: string): string {
		const labels: Record<string, string> = {
			lesson: ''+t('search.lessons')+'',
			course: ''+t('search.courses')+'',
			offering: ''+t('search.classes')+'',
			exercise: 'Latihan',
			video: 'Video',
			flashcard: 'Kartu',
			project: 'Proyek',
		};
		return labels[type] || type;
	}

	function typeColor(type: string): string {
		const colors: Record<string, string> = {
			lesson: 'badge-lesson',
			course: 'badge-course',
			offering: 'badge-offering',
			exercise: 'badge-exercise',
			video: 'badge-video',
			flashcard: 'badge-flashcard',
			project: 'badge-project',
		};
		return colors[type] || 'badge-content';
	}

	// Focus input on mount
	$effect(() => {
		inputEl?.focus();
	});

	// / key shortcut to focus search (from any page)
	$effect(() => {
		if (!browser) return;
		function handler(e: KeyboardEvent) {
			if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
				e.preventDefault();
				inputEl?.focus();
			}
		}
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	// Cleanup debounce on unmount
	$effect(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>{t('search.title')} — RPL AI Curriculum</title>
</svelte:head>

<div class="search-page">
	<h1 class="search-title">🔍 Cari</h1>
	<p class="search-subtitle">Temukan kursus, pelajaran, dan materi dalam kurikulum</p>

	<div class="search-input-wrapper">
		<SearchInput
			bind:value={query}
			placeholder="Cari kursus, pelajaran, materi..."
			oninput={handleInput}
		/>
	</div>

	<!-- Recent Searches -->
	{#if !hasSearched && !loading && recentSearches.length > 0}
		<div class="recent-searches" in:fade={{ duration: 150 }}>
			<div class="recent-header">
				<span class="recent-label">Pencarian terakhir</span>
				<button class="recent-clear" onclick={clearRecentSearches}>Hapus</button>
			</div>
			<div class="recent-chips">
				{#each recentSearches as q}
					<button class="recent-chip" onclick={() => rerunSearch(q)}>
						<span>🕐</span> {q}
						<span class="recent-remove" onclick={(e) => { e.stopPropagation(); removeRecentSearch(q); }}>&times;</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Filter toggles (shown when has results) -->
	{#if hasSearched && !loading}
		<div class="filter-toggles" in:fade={{ duration: 150 }}>
			<button
				class="filter-chip"
				class:active={activeFilter === 'all'}
				onclick={() => activeFilter = 'all'}
			>Semua</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'lesson'}
				onclick={() => activeFilter = 'lesson'}
			>📖 Pelajaran</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'course'}
				onclick={() => activeFilter = 'course'}
			>📚 Kursus</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'exercise'}
				onclick={() => activeFilter = 'exercise'}
			>💻 Latihan</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'video'}
				onclick={() => activeFilter = 'video'}
			>🎬 Video</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'flashcard'}
				onclick={() => activeFilter = 'flashcard'}
			>🃏 Kartu</button>
			<button
				class="filter-chip"
				class:active={activeFilter === 'project'}
				onclick={() => activeFilter = 'project'}
			>📦 Proyek</button>
		</div>
	{/if}

	<div class="search-results">
		{#if loading}
			<div class="skeleton-results" in:fade={{ duration: 150 }}>
				{#each Array(3) as _}
					<Skeleton variant="card" />
				{/each}
			</div>
		{:else if hasSearched && filteredTotal > 0}
			<p class="result-count">
				Hasil untuk "<strong>{query}</strong>"
				{#if activeFilter !== 'all'}
					— {filteredTotal} hasil ({total} total)
				{:else}
					— {total} hasil
				{/if}
			</p>

			<div class="results-list">
				{#each filteredResults as result, i (result.url + result.type + i)}
					<a href={result.url} class="result-card" style="--i: {i}">
						<div class="result-header">
							<span class="result-icon">{result.icon || typeIcon(result.type)}</span>
							<span class="result-title">{result.title}</span>
							<span class="badge {typeColor(result.type)}">{typeLabel(result.type)}</span>
						</div>
						<p class="result-snippet">{result.snippet}</p>
					</a>
				{/each}
			</div>
		{:else if hasSearched}
			<EmptyState
				icon="😕"
				title="Tidak ditemukan hasil"
				description="Coba kata kunci lain, minimal 2 karakter"
			/>
		{:else}
			<EmptyState
				icon="🔍"
				title="Cari materi pembelajaran..."
				description="Ketik minimal 2 karakter untuk mencari"
			/>
		{/if}
	</div>
</div>

<style>
	.search-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 24px 0;
	}

	.search-title {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
		color: var(--text);
	}

	.search-subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 24px;
	}

	.search-input-wrapper {
		margin-bottom: 16px;
	}

	/* Recent Searches */
	.recent-searches {
		margin-bottom: 16px;
	}

	.recent-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.recent-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.recent-clear {
		font-size: 12px;
		color: var(--accent);
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
	}
	.recent-clear:hover {
		background: var(--accent-dim);
	}

	.recent-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.recent-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		font-size: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 20px;
		color: var(--text);
		cursor: pointer;
		transition: all 0.15s;
	}
	.recent-chip:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
	}
	.recent-remove {
		margin-left: 2px;
		font-size: 14px;
		opacity: 0.5;
		line-height: 1;
	}
	.recent-remove:hover {
		opacity: 1;
	}

	/* Filter toggles */
	.filter-toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 12px;
	}

	.filter-chip {
		padding: 5px 12px;
		font-size: 12px;
		font-weight: 500;
		border: 1px solid var(--border);
		border-radius: 20px;
		background: var(--surface);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}
	.filter-chip:hover {
		border-color: var(--accent);
		color: var(--text);
	}
	.filter-chip.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	/* Skeleton */
	.skeleton-results {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px 0;
	}

	.search-results {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.result-count {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 8px;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.result-card {
		display: block;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		text-decoration: none !important;
		transition: background 0.15s ease, transform 0.15s ease;
		opacity: 0;
		animation: stagger-in 0.3s ease forwards;
		animation-delay: calc(var(--i, 0) * 50ms);
	}

	.result-card:hover {
		background: var(--hover);
		transform: translateY(-1px);
	}

	.result-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.result-icon {
		font-size: 18px;
	}

	.result-title {
		flex: 1;
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	.result-snippet {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-left: 26px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 2;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 10px;
		white-space: nowrap;
	}

	.badge-lesson {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.badge-course {
		background: #e8f5e9;
		color: #2e7d32;
	}

	:global(.dark) .badge-course {
		background: rgba(46, 125, 50, 0.2);
		color: #81c784;
	}

	.badge-offering {
		background: #fff3e0;
		color: #e65100;
	}

	:global(.dark) .badge-offering {
		background: rgba(230, 81, 0, 0.2);
		color: #ffb74d;
	}

	.badge-exercise {
		background: rgba(139, 92, 246, 0.15);
		color: #8b5cf6;
	}

	.badge-video {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.badge-flashcard {
		background: rgba(236, 72, 153, 0.15);
		color: #ec4899;
	}

	.badge-project {
		background: rgba(34, 197, 94, 0.15);
		color: #16a34a;
	}

	@keyframes stagger-in {
		to { opacity: 1; }
	}
</style>
