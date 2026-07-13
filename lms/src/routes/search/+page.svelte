<script lang="ts">
	import { searchModules, type GroupedSearchResults, type SearchResult } from '$lib/stores/search.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let query = $state(data.query || '');
	let results = $state<GroupedSearchResults | null>(null);
	let loading = $state(false);
	let hasSearched = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();
	let initialLoading = $state(true);
	let activeFilter = $state<string>('all');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function doSearch(q: string) {
		if (!q.trim()) {
			results = null;
			hasSearched = false;
			return;
		}
		loading = true;
		try {
			const filterType = activeFilter === 'all' ? undefined : activeFilter;
			const res = await searchModules(q, filterType);
			results = res;
			hasSearched = true;
		} finally {
			loading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		clearTimeout(debounceTimer);
		if (!query.trim()) {
			results = null;
			hasSearched = false;
			return;
		}
		debounceTimer = setTimeout(() => doSearch(query), 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && query) {
			e.preventDefault();
			query = '';
			results = null;
			hasSearched = false;
			inputEl?.focus();
		}
		if (e.key === 'Enter' && query.trim()) {
			e.preventDefault();
			clearTimeout(debounceTimer);
			doSearch(query);
		}
	}

	function setFilter(filter: string) {
		activeFilter = filter;
		if (query.trim()) {
			doSearch(query);
		}
	}

	const filterTabs = [
		{ id: 'all', label: 'Semua' },
		{ id: 'module', label: 'Modul' },
		{ id: 'session', label: 'Sesi' },
		{ id: 'content', label: 'Konten' },
		{ id: 'exercise', label: 'Latihan' },
		{ id: 'video', label: 'Video' },
		{ id: 'project', label: 'Proyek' },
		{ id: 'flashcard', label: 'Flashcard' },
	];

	function badgeLabel(type: SearchResult['matchType']): string {
		const labels: Record<string, string> = {
			module: 'Modul',
			session: 'Sesi',
			content: 'Konten',
			exercise: 'Latihan',
			video: 'Video',
			flashcard: 'Flashcard',
			project: 'Proyek',
		};
		return labels[type] || type;
	}

	function badgeClass(type: SearchResult['matchType']): string {
		const classes: Record<string, string> = {
			module: 'badge-module',
			session: 'badge-session',
			content: 'badge-content',
			exercise: 'badge-exercise',
			video: 'badge-video',
			flashcard: 'badge-flashcard',
			project: 'badge-project',
		};
		return classes[type] || 'badge-content';
	}

	function resultLink(r: SearchResult): string {
		if (r.matchType === 'exercise') return `/exercises/${r.slug}`;
		if (r.matchType === 'video') return `/module/${r.slug}?videos=1`;
		if (r.matchType === 'module') return `/module/${r.slug}`;
		if (r.matchType === 'project') return `/projects/${r.slug}`;
		if (r.matchType === 'flashcard') return `/module/${r.slug}?flashcards=1`;
		return `/module/${r.slug}${r.sessionId ? '?session=' + r.sessionId : ''}`;
	}

	function sectionTitle(key: string): string {
		const titles: Record<string, string> = {
			modules: '📦 Modul',
			sessions: '📖 Sesi',
			contents: '📝 Konten',
			exercises: '🏋️ Latihan',
			videos: '🎬 Video',
			flashcards: '🃏 Flashcard',
			projects: '🚀 Proyek',
		};
		return titles[key] || key;
	}

	function sectionIcon(key: string): string {
		const icons: Record<string, string> = {
			modules: '📦',
			sessions: '📖',
			contents: '📝',
			exercises: '🏋️',
			videos: '🎬',
			flashcards: '🃏',
			projects: '🚀',
		};
		return icons[key] || '📌';
	}

	type SectionKey = 'modules' | 'sessions' | 'contents' | 'exercises' | 'videos' | 'flashcards' | 'projects';
	let collapsedSections = $state<Set<SectionKey>>(new Set());

	function toggleSection(key: SectionKey) {
		if (collapsedSections.has(key)) {
			collapsedSections.delete(key);
		} else {
			collapsedSections.add(key);
		}
		collapsedSections = new Set(collapsedSections);
	}

	// Focus input on mount
	$effect(() => {
		inputEl?.focus();
		const timer = setTimeout(() => { initialLoading = false; }, 200);
		return () => clearTimeout(timer);
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
	<p class="search-subtitle">Temukan modul, sesi, latihan, video dalam kurikulum</p>

	<div class="search-input-wrapper">
		<span class="search-icon-inside">🔍</span>
		<input
			bind:this={inputEl}
			type="text"
			class="search-input"
			placeholder="Cari modul, sesi, latihan, video..."
			value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			aria-label="Cari"
		/>
		{#if query}
			<button
				class="search-clear"
				onclick={() => {
					query = '';
					results = null;
					hasSearched = false;
					inputEl?.focus();
				}}
				aria-label="Hapus pencarian"
			>
				&times;
			</button>
		{/if}
	</div>

	<div class="search-results">
		{#if initialLoading}
			<div class="search-skeleton-list" in:fade={{ duration: 150 }}>
				{#each [1, 2, 3, 4] as _}
					<div class="result-card-skeleton">
						<div class="skeleton-bar" style="width: 65%; height: 18px; margin-bottom: 8px;"></div>
						<div class="skeleton-bar" style="width: 90%; height: 14px; margin-bottom: 6px;"></div>
						<div class="skeleton-bar" style="width: 30%; height: 12px;"></div>
					</div>
				{/each}
			</div>
		{:else if loading}
			<div class="search-state" in:fade={{ duration: 150 }}>
				<div class="result-card-skeleton" style="width: 100%;">
					<div class="skeleton-bar" style="width: 75%; height: 16px; margin-bottom: 10px;"></div>
					<div class="skeleton-bar" style="width: 50%; height: 13px;"></div>
				</div>
				<div class="result-card-skeleton" style="width: 100%; margin-top: 8px;">
					<div class="skeleton-bar" style="width: 60%; height: 16px; margin-bottom: 10px;"></div>
					<div class="skeleton-bar" style="width: 70%; height: 13px;"></div>
				</div>
				<div class="result-card-skeleton" style="width: 100%; margin-top: 8px;">
					<div class="skeleton-bar" style="width: 80%; height: 16px; margin-bottom: 10px;"></div>
					<div class="skeleton-bar" style="width: 45%; height: 13px;"></div>
				</div>
			</div>
		{:else if hasSearched && results && results.total > 0}
			<div class="results-header">
				<p class="result-count">Hasil pencarian untuk: "<strong>{query}</strong>" — {results.total} hasil</p>
				<div class="filter-tabs">
					{#each filterTabs as tab}
						<button
							class="filter-tab"
							class:active={activeFilter === tab.id}
							onclick={() => setFilter(tab.id)}
						>{tab.label}</button>
					{/each}
				</div>
			</div>

			{#each Object.entries(results) as [key, items]}
				{@const sectionKey = key as SectionKey}
				{#if items.length > 0}
					<div class="result-section" in:fade={{ duration: 200 }}>
						<button
							class="section-header"
							onclick={() => toggleSection(sectionKey)}
							aria-expanded={!collapsedSections.has(sectionKey)}
						>
							<span class="section-title">{sectionIcon(key)} {sectionTitle(key)}</span>
							<span class="section-count">{items.length}</span>
							<span class="section-toggle">{collapsedSections.has(sectionKey) ? '▶' : '▼'}</span>
						</button>
						{#if !collapsedSections.has(sectionKey)}
							<div class="section-items">
									{#each items as result, i (result.slug + result.matchType + (result.sessionId || result.moduleSlug || ''))}
										<a
											href={resultLink(result)}
											class="result-card"
											style="--i: {i}"
											>
											<div class="result-header">
											<span class="result-title">
												{result.matchType === 'module' ? '📦 ' : ''}
												{result.matchType === 'session' ? '📖 ' : ''}
												{result.matchType === 'exercise' ? '🏋️ ' : ''}
												{result.matchType === 'video' ? '🎬 ' : ''}
												{result.title}
											</span>
											<span class="badge {badgeClass(result.matchType)}">{badgeLabel(result.matchType)}</span>
										</div>
										<p class="result-preview">{@html result.matchPreview}</p>
										<span class="result-meta">
											{#if result.matchType === 'module'}
												Modul: {result.slug}
											{:else if result.matchType === 'session' || result.matchType === 'content'}
												Modul: {result.slug} · Sesi: {result.title}
											{:else if result.matchType === 'exercise'}
												Latihan · {result.difficulty || ''}
											{:else if result.matchType === 'video'}
												Video · {result.moduleSlug}
											{:else if result.matchType === 'project'}
												Proyek · {result.difficulty || ''}
											{:else if result.matchType === 'flashcard'}
												Flashcard · {result.moduleSlug}
											{/if}
										</span>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		{:else if hasSearched}
			<div class="search-state">
				<span class="empty-icon">😕</span>
				<p>Tidak ada hasil untuk "<strong>{query}</strong>"</p>
				<p class="empty-hint">Coba kata kunci lain yang lebih umum</p>
			</div>
		{:else}
			<div class="search-state">
				<span class="empty-icon">🔍</span>
				<p>Cari modul, sesi, latihan, atau video...</p>
			</div>
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
		position: relative;
		margin-bottom: 20px;
	}

	.search-icon-inside {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 16px;
		opacity: 0.5;
		pointer-events: none;
		z-index: 1;
	}

	.search-input {
		width: 100%;
		padding: 14px 44px 14px 44px;
		font-size: 16px;
		font-family: inherit;
		border: 2px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		color: var(--text);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.search-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}

	.search-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.search-clear {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 22px;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		line-height: 1;
	}

	.search-clear:hover {
		background: var(--hover);
		color: var(--text);
	}

	.search-results {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.results-header {
		margin-bottom: 4px;
	}

	.result-count {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}

	.filter-tabs {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.filter-tab {
		padding: 5px 12px;
		border-radius: 20px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.filter-tab:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.filter-tab.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.result-section {
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--surface);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		border: none;
		background: var(--bg-secondary);
		cursor: pointer;
		font-family: inherit;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		transition: background 0.15s ease;
	}

	.section-header:hover {
		background: var(--hover);
	}

	.section-title {
		flex: 1;
		text-align: left;
	}

	.section-count {
		font-size: 12px;
		color: var(--text-secondary);
		background: var(--border);
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
	}

	.section-toggle {
		font-size: 10px;
		color: var(--text-secondary);
	}

	.section-items {
		display: flex;
		flex-direction: column;
	}

	.result-card {
		display: block;
		padding: 12px 16px;
		border-top: 1px solid var(--border);
		text-decoration: none !important;
		transition: background 0.15s ease, opacity 0.3s ease, transform 0.3s ease;
		opacity: 0;
		animation: stagger-in 0.3s ease forwards;
		animation-delay: calc(var(--i, 0) * 50ms);
		transform-origin: top center;
	}

	.result-card:first-child {
		border-top: none;
	}

	.result-card:hover {
		background: var(--hover);
	}

	.result-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 4px;
	}

	.result-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--accent);
		flex: 1;
		line-height: 1.3;
	}

	.badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 4px;
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.badge-module {
		background: rgba(108, 92, 231, 0.15);
		color: #a78bfa;
	}

	.badge-session {
		background: rgba(0, 184, 148, 0.15);
		color: #55efc4;
	}

	.badge-content {
		background: rgba(253, 203, 110, 0.15);
		color: #fdcb6e;
	}

	.badge-exercise {
		background: rgba(255, 107, 107, 0.15);
		color: #ff6b6b;
	}

	.badge-video {
		background: rgba(72, 202, 228, 0.15);
		color: #48cae4;
	}

	.badge-flashcard {
		background: rgba(253, 121, 168, 0.15);
		color: #fd79a8;
	}

	.badge-project {
		background: rgba(46, 213, 115, 0.15);
		color: #2ed573;
	}

	.result-preview {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.result-preview :global(mark) {
		background: rgba(253, 203, 110, 0.3);
		color: var(--text);
		padding: 0 2px;
		border-radius: 2px;
	}

	.result-meta {
		font-size: 11px;
		color: var(--text-secondary);
		opacity: 0.6;
		margin-top: 2px;
		display: block;
	}

	.search-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 24px;
		text-align: center;
		color: var(--text-secondary);
		gap: 8px;
	}

	.search-skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.result-card-skeleton {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 14px 16px;
		position: relative;
		overflow: hidden;
	}

	.skeleton-bar {
		background: #1e2240;
		border-radius: 6px;
		position: relative;
		overflow: hidden;
	}

	.skeleton-bar::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#2a2f52 25%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.result-card-skeleton::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#2a2f52 25%,
			transparent 50%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		pointer-events: none;
	}

	.empty-icon {
		font-size: 40px;
		margin-bottom: 4px;
	}

	.empty-hint {
		font-size: 13px;
		opacity: 0.7;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	@keyframes stagger-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.search-page {
			padding: 16px 0;
		}
		.search-title {
			font-size: 22px;
		}
		.filter-tabs {
			gap: 4px;
		}
		.filter-tab {
			font-size: 11px;
			padding: 4px 10px;
		}
		.result-title {
			font-size: 13px;
		}
	}
</style>
