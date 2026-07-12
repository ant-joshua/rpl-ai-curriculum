<script lang="ts">
	import { searchModules, type SearchResult } from '$lib/stores/search.svelte';
	import { page } from '$app/stores';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { fade } from 'svelte/transition';

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let hasSearched = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();
	let initialLoading = $state(true);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function doSearch(q: string) {
		loading = true;
		searchModules(q).then((r) => {
			results = r;
			loading = false;
			hasSearched = true;
		});
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		clearTimeout(debounceTimer);
		if (!query.trim()) {
			results = [];
			hasSearched = false;
			return;
		}
		debounceTimer = setTimeout(() => doSearch(query), 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && query) {
			e.preventDefault();
			query = '';
			results = [];
			hasSearched = false;
			inputEl?.focus();
		}
		if (e.key === 'Enter' && query.trim()) {
			e.preventDefault();
			clearTimeout(debounceTimer);
			doSearch(query);
		}
	}

	function badgeClass(type: SearchResult['matchType']): string {
		if (type === 'module') return 'badge-module';
		if (type === 'session') return 'badge-session';
		return 'badge-content';
	}

	function badgeLabel(type: SearchResult['matchType']): string {
		if (type === 'module') return 'Modul';
		if (type === 'session') return 'Sesi';
		return 'Konten';
	}

	// Focus input on mount, clear initial loading
	$effect(() => {
		inputEl?.focus();
		const timer = setTimeout(() => { initialLoading = false; }, 200);
		return () => clearTimeout(timer);
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
	<p class="search-subtitle">Temukan modul, sesi, atau topik dalam kurikulum</p>

	<div class="search-input-wrapper">
		<input
			bind:this={inputEl}
			type="text"
			class="search-input"
			placeholder="Cari modul, sesi, atau topik..."
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
					results = [];
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
						<Skeleton width="65%" height="18px" />
						<div style="margin-bottom: 8px;"></div>
						<Skeleton width="90%" height="14px" />
						<div style="margin-bottom: 6px;"></div>
						<Skeleton width="30%" height="12px" />
					</div>
				{/each}
			</div>
		{:else if loading}
			<div class="search-state" in:fade={{ duration: 150 }}>
				<Skeleton width="100%" height="60px" borderRadius="10px" />
				<div style="margin-top: 8px;"><Skeleton width="100%" height="60px" borderRadius="10px" /></div>
				<div style="margin-top: 8px;"><Skeleton width="100%" height="60px" borderRadius="10px" /></div>
			</div>
		{:else if results.length > 0}
			<p class="result-count">{results.length} hasil ditemukan</p>
			{#each results as result (result.slug + result.matchType + result.sessionId)}
				<a href="/module/{result.slug}" class="result-card">
					<div class="result-header">
						<span class="result-title">{result.title}</span>
						<span class="badge {badgeClass(result.matchType)}">{badgeLabel(result.matchType)}</span>
					</div>
					<p class="result-preview">{result.matchPreview}</p>
					<span class="result-module">Modul: {result.slug}</span>
				</a>
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
				<p>Cari modul, sesi, atau topik...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.search-page {
		max-width: 720px;
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
		margin-bottom: 24px;
	}

	.search-input {
		width: 100%;
		padding: 14px 44px 14px 18px;
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

	.result-count {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}

	.result-card {
		display: block;
		padding: 14px 16px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		text-decoration: none !important;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.result-card:hover {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.result-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 6px;
	}

	.result-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		flex: 1;
		line-height: 1.3;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
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

	.result-module {
		font-size: 11px;
		color: var(--text-secondary);
		opacity: 0.6;
		margin-top: 4px;
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
</style>
