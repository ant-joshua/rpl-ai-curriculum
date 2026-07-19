<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { parseMarkdown } from '$lib/utils/markdown';
	import { Skeleton, EmptyState } from '$lib/components/ui/index.js';

	let items = $state<{ title: string; content: string; slug: string }[]>([]);
	let activeSlug = $state<string | null>(null);
	let loading = $state(true);
	let errorMsg = $state('');
	let searchQuery = $state('');

	let filteredItems = $derived(
		searchQuery
			? items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: items
	);

	onMount(async () => {
		try {
			const res = await fetch('/content/references/mini-projects.json');
			if (!res.ok) throw new Error('Gagal memuat mini-projects');
			const json = await res.json();
			items = json.items || [];
		} catch (e) {
			errorMsg = 'Gagal memuat data mini-projects';
		} finally {
			loading = false;
		}
	});

	function toggleItem(slug: string) {
		activeSlug = activeSlug === slug ? null : slug;
	}
</script>

<div class="reference-page">
	<header class="page-header">
		<h1>🔨 Mini Projects</h1>
		<p class="page-desc">Proyek-proyek kecil untuk mempraktikkan keterampilan web development — dari kalkulator hingga AI chat UI.</p>
	</header>

	<div class="layout">
		<aside class="sidebar-nav">
			<div class="search-box">
				<input
					type="text"
					placeholder="Cari proyek..."
					bind:value={searchQuery}
				/>
			</div>
			<ul class="item-list">
				{#each filteredItems as item}
					<li>
						<button
							class="item-link"
							class:active={activeSlug === item.slug}
							onclick={() => toggleItem(item.slug)}
						>
							{item.title.replace(/^#\s*/, '')}
						</button>
					</li>
				{/each}
			</ul>
			{#if filteredItems.length === 0 && !loading}
				<EmptyState icon="🔍" title="Tidak ada hasil" description="Coba ubah kata kunci pencarian." />
			{/if}
		</aside>

		<main class="content-area">
			{#if loading}
				<div class="skeleton-wrapper">
					<Skeleton variant="title" count={1} />
					<div style="height:16px"></div>
					<Skeleton variant="text" count={6} />
				</div>
			{:else if errorMsg}
				<div class="error"><p>{errorMsg}</p></div>
			{:else if activeSlug}
				{@const item = items.find(i => i.slug === activeSlug)}
				{#if item}
					<div class="markdown-content">
						{@html parseMarkdown(item.content)}
					</div>
				{/if}
			{:else}
				<div class="placeholder">
					<p>Pilih proyek dari daftar di samping untuk melihat spesifikasi.</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.reference-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.page-desc {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.layout {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	.sidebar-nav {
		width: 260px;
		min-width: 260px;
		position: sticky;
		top: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		max-height: calc(100vh - 120px);
		overflow-y: auto;
	}

	.search-box {
		margin-bottom: 12px;
	}

	.search-box input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.search-box input:focus {
		border-color: var(--accent);
	}

	.item-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.item-link {
		display: block;
		width: 100%;
		text-align: left;
		padding: 8px 10px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		line-height: 1.3;
	}

	.item-link:hover {
		background: var(--hover);
		color: var(--text);
	}

	.item-link.active {
		background: var(--accent-dim);
		color: var(--accent);
		font-weight: 600;
	}

	.empty {
		font-size: 13px;
		color: var(--text-secondary);
		text-align: center;
		padding: 20px 0;
	}

	.content-area {
		flex: 1;
		min-width: 0;
	}

	.loading, .error {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.placeholder {
		text-align: center;
		padding: 80px 20px;
		color: var(--text-secondary);
		font-size: 15px;
	}

	.skeleton-wrapper {
		padding: 40px 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.markdown-content {
		line-height: 1.7;
		font-size: 15px;
	}

	.markdown-content :global(h1) { font-size: 22px; margin: 0 0 12px; font-weight: 700; }
	.markdown-content :global(h2) { font-size: 18px; margin: 24px 0 10px; font-weight: 600; }
	.markdown-content :global(h3) { font-size: 16px; margin: 20px 0 8px; font-weight: 600; }
	.markdown-content :global(p) { margin: 0 0 12px; }
	.markdown-content :global(ul), .markdown-content :global(ol) { margin: 0 0 12px; padding-left: 20px; }
	.markdown-content :global(li) { margin-bottom: 4px; }
	.markdown-content :global(code) {
		background: var(--bg-secondary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 13px;
	}
	.markdown-content :global(pre) {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		margin: 0 0 16px;
	}
	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
		font-size: 13px;
	}
	.markdown-content :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding: 8px 16px;
		margin: 0 0 16px;
		background: var(--bg-secondary);
		border-radius: 0 8px 8px 0;
		color: var(--text-secondary);
	}
	.markdown-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0 0 16px;
		font-size: 14px;
	}
	.markdown-content :global(th), .markdown-content :global(td) {
		border: 1px solid var(--border);
		padding: 8px 12px;
		text-align: left;
	}
	.markdown-content :global(th) {
		background: var(--bg-secondary);
		font-weight: 600;
	}
	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 16px 0;
	}

	@media (max-width: 768px) {
		.layout {
			flex-direction: column;
		}
		.sidebar-nav {
			width: 100%;
			min-width: 100%;
			position: static;
			max-height: none;
		}
	}
</style>
