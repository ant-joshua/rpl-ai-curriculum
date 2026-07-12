<script lang="ts">
	import { modules } from '$lib/stores/modules';
	import { onMount } from 'svelte';

	let pdfFiles = $state<
		{ filename: string; dirName: string; title: string }[]
	>([]);
	let searchQuery = $state('');
	let loaded = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('/pdfs/index.json');
			if (res.ok) {
				const idx = await res.json();
				pdfFiles = idx.files;
			}
		} catch { /* ignore */ }
		loaded = true;
	});

	// Enrich PDF files with module info where available
	let enriched = $derived(
		pdfFiles.map((f) => {
			const mod = modules.find((m) => m.dirName === f.dirName);
			return {
				...f,
				level: mod?.level ?? null,
				modSlug: mod?.slug ?? null,
				modTitle: mod?.title ?? f.title,
			};
		})
	);

	let filtered = $derived(
		searchQuery
			? enriched.filter(
					(f) =>
						f.modTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
						f.dirName.toLowerCase().includes(searchQuery.toLowerCase())
			  )
			: enriched
	);
</script>

<svelte:head>
	<title>PDF Resources — RPL AI</title>
</svelte:head>

<div class="resources-page">
	<h1>📥 PDF Resources</h1>
	<p class="subtitle">Download all 57 module exports as PDF — offline-friendly, printable, shareable.</p>

	<div class="search-bar">
		<input
			type="text"
			placeholder="Cari modul..."
			bind:value={searchQuery}
		/>
	</div>

	{#if !loaded}
		<div class="loading">Memuat...</div>
	{:else if filtered.length === 0}
		<div class="empty">Tidak ada PDF yang cocok dengan pencarian.</div>
	{:else}
		<div class="pdf-list">
			{#each filtered as file (file.dirName)}
				<div class="pdf-item">
					<div class="pdf-info">
						<span class="pdf-icon">📄</span>
						<div class="pdf-meta">
							<span class="pdf-title">{file.modTitle}</span>
							<span class="pdf-subtitle">
								{file.dirName}
								{#if file.level}
									<span class="level-badge level-{file.level.toLowerCase()}">{file.level}</span>
								{/if}
							</span>
						</div>
					</div>
					<a
						href="/pdfs/{file.filename}"
						class="pdf-dl-btn"
						download
					>
						⬇ Download
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.resources-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 24px;
	}

	.search-bar {
		margin-bottom: 20px;
	}

	.search-bar input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.search-bar input:focus {
		border-color: var(--accent);
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.empty {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.pdf-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.pdf-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: border-color 0.15s ease;
	}

	.pdf-item:hover {
		border-color: var(--accent);
	}

	.pdf-info {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.pdf-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.pdf-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.pdf-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pdf-subtitle {
		font-size: 12px;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.level-beginner {
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}

	.level-intermediate {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;
	}

	.level-advanced {
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;
	}

	.pdf-dl-btn {
		flex-shrink: 0;
		padding: 8px 16px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s ease;
	}

	.pdf-dl-btn:hover {
		background: var(--accent);
		color: #fff;
	}
</style>
