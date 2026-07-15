<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import { Card, EmptyState, SearchInput } from '$lib/components/ui';

	interface SearchResultItem {
		type: 'lesson' | 'course' | 'offering';
		title: string;
		url: string;
		snippet: string;
		icon: string;
	}

	// svelte-ignore state_referenced_locally
	let { data: pageData } = $props() as { data: { query: string; results: SearchResultItem[]; total: number } };
	const { query: initialQuery, results: initialResults, total: initialTotal } = pageData;

	let query = $state(initialQuery || '');
	let results = $state<SearchResultItem[]>(initialResults || []);
	let total = $state(initialTotal || 0);
	let loading = $state(false);
	let hasSearched = $state(initialQuery.length >= 2);
	let inputEl: HTMLInputElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

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

	function typeIcon(type: string): string {
		const icons: Record<string, string> = {
			lesson: '📖',
			course: '📚',
			offering: '🗓️',
		};
		return icons[type] || '📌';
	}

	function typeLabel(type: string): string {
		const labels: Record<string, string> = {
			lesson: 'Pelajaran',
			course: 'Kursus',
			offering: 'Kelas',
		};
		return labels[type] || type;
	}

	function typeColor(type: string): string {
		const colors: Record<string, string> = {
			lesson: 'badge-lesson',
			course: 'badge-course',
			offering: 'badge-offering',
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
	<title>Cari — RPL AI Curriculum</title>
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

	<div class="search-results">
		{#if loading}
			<div class="search-state" in:fade={{ duration: 150 }}>
				<div class="spinner"></div>
				<p>Mencari...</p>
			</div>
		{:else if hasSearched && total > 0}
			<p class="result-count">Hasil untuk "<strong>{query}</strong>" — {total} hasil</p>

			<div class="results-list">
				{#each results as result, i (result.url + result.type + i)}
					<a href={result.url} class="result-card" style="--i: {i}">
						<div class="result-header">
							<span class="result-icon">{result.icon}</span>
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
		margin-bottom: 20px;
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

	.search-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
		gap: 8px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		margin-bottom: 12px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
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

	@keyframes stagger-in {
		to { opacity: 1; }
	}
</style>
