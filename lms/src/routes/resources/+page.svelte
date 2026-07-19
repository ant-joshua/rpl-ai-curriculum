<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { modules } from '$lib/stores/modules';
	import { EmptyState, Skeleton } from '$lib/components/ui';
	import { fade } from 'svelte/transition';

	let pdfFiles = $state<
		{ filename: string; dirName: string; title: string }[]
	>([]);
	let searchQuery = $state('');
	let loaded = $state(false);

	$effect(() => {
		(async () => {
			try {
				const res = await fetch('/pdfs/index.json');
				if (res.ok) {
					const idx = await res.json();
					pdfFiles = idx.files;
				}
			} catch { /* ignore */ }
			loaded = true;
		})();
	});

	interface EnrichedFile {
		filename: string;
		dirName: string;
		title: string;
		level: string | null;
		modSlug: string | null;
		modTitle: string;
	}

	let enriched = $derived(
		pdfFiles.map((f) => {
			const mod = modules.find((m) => m.dirName === f.dirName);
			return {
				...f,
				level: mod?.level ?? null,
				modSlug: mod?.slug ?? null,
				modTitle: mod?.title ?? f.title,
			} as EnrichedFile;
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

	// Group by category (level)
	type CategoryGroup = { label: string; files: EnrichedFile[] };
	let groupedFiles = $derived.by(() => {
		const groups: CategoryGroup[] = [];
		let uncategorized: EnrichedFile[] = [];

		for (const f of filtered) {
			if (f.level) {
				const label = f.level;
				let group = groups.find(g => g.label === label);
				if (!group) {
					group = { label, files: [] };
					groups.push(group);
				}
				group.files.push(f);
			} else {
				uncategorized.push(f);
			}
		}

		// Sort groups: Beginner first, then Intermediate, then Advanced, then rest alphabetically
		const order = ['Beginner', 'Intermediate', 'Advanced'];
		groups.sort((a, b) => {
			const ai = order.indexOf(a.label);
			const bi = order.indexOf(b.label);
			if (ai !== -1 && bi !== -1) return ai - bi;
			if (ai !== -1) return -1;
			if (bi !== -1) return 1;
			return a.label.localeCompare(b.label);
		});

		if (uncategorized.length > 0) {
			groups.push({ label: 'Umum', files: uncategorized });
		}

		return groups;
	});

	let totalFiles = $derived(filtered.length);

	function levelColor(level: string): string {
		const map: Record<string, string> = {
			'Beginner': '#22c55e',
			'Intermediate': '#f59e0b',
			'Advanced': '#ef4444',
		};
		return map[level] || 'var(--text-secondary)';
	}

	function levelBg(level: string): string {
		const map: Record<string, string> = {
			'Beginner': 'rgba(34,197,94,0.08)',
			'Intermediate': 'rgba(245,158,11,0.08)',
			'Advanced': 'rgba(239,68,68,0.08)',
		};
		return map[level] || 'var(--bg-secondary)';
	}
</script>

<svelte:head>
	<title>{t('resources.title')} — RPL AI</title>
</svelte:head>

<div class="resources-page">
	<header class="page-header">
		<h1>📄 {t('resources.title')}</h1>
		<p class="subtitle">{t('resources.subtitle')}</p>
	</header>

	<div class="search-bar">
		<span class="search-icon">🔍</span>
		<input
			type="text"
			placeholder="Cari modul..."
			bind:value={searchQuery}
		/>
		{#if searchQuery}
			<button class="search-clear" onclick={() => searchQuery = ''}>&times;</button>
		{/if}
	</div>

	{#if !loaded}
		<div class="skeleton-list" in:fade={{ duration: 150 }}>
			{#each Array(4) as _}
				<Skeleton variant="card" />
			{/each}
		</div>
	{:else if totalFiles === 0}
		<EmptyState
			icon="📄"
			title="Tidak ada resource"
			description={searchQuery ? 'Coba ubah pencarian' : 'Belum ada PDF yang tersedia'}
		/>
	{:else}
		<p class="result-count">{totalFiles} resource ditemukan</p>
		{#each groupedFiles as group (group.label)}
			<div class="category-group" in:fade={{ duration: 200 }}>
				<div class="group-header" style="background: {levelBg(group.label)}">
					<div class="group-indicator" style="background: {levelColor(group.label)}"></div>
					<h3 class="group-title" style="color: {levelColor(group.label)};
						{group.label === 'Beginner' ? '' : group.label === 'Intermediate' ? '' : ''}">
						{group.label === 'Beginner' ? '🌱 Pemula' :
						 group.label === 'Intermediate' ? '🌿 Menengah' :
						 group.label === 'Advanced' ? '🔥 Mahir' : group.label}
					</h3>
					<span class="group-count">{group.files.length}</span>
				</div>

				<div class="pdf-list">
					{#each group.files as file (file.filename)}
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
								href="/api/pdfs/{file.filename}"
								class="pdf-dl-btn"
								download
							>
								<span class="dl-icon">⬇</span>
								Download
							</a>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.resources-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px 0;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 0;
	}

	.search-bar {
		position: relative;
		margin-bottom: 20px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 14px;
		opacity: 0.5;
		pointer-events: none;
	}

	.search-clear {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 18px;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 2px 6px;
		line-height: 1;
	}

	.search-bar input {
		width: 100%;
		padding: 10px 32px 10px 36px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
		outline: none;
		transition: border-color 0.15s;
		box-sizing: border-box;
	}

	.search-bar input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.search-bar input::placeholder {
		color: var(--text-secondary);
	}

	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.result-count {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 16px;
	}

	/* Category groups */
	.category-group {
		margin-bottom: 20px;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 10px 10px 0 0;
		margin-bottom: 2px;
	}

	.group-indicator {
		width: 4px;
		height: 20px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.group-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0;
		flex: 1;
	}

	.group-count {
		font-size: 11px;
		background: var(--bg-secondary);
		padding: 2px 8px;
		border-radius: 10px;
		color: var(--text-secondary);
	}

	/* PDF list */
	.pdf-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.pdf-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0;
		transition: all 0.15s;
	}

	.pdf-item:first-child {
		border-radius: 0 0 0 0;
	}

	.pdf-item:last-child {
		border-radius: 0 0 10px 10px;
	}

	.pdf-item:hover {
		background: var(--hover);
		border-color: var(--accent);
		z-index: 1;
		position: relative;
	}

	.pdf-info {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
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
		padding: 1px 8px;
		border-radius: 9999px;
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

	/* Download button */
	.pdf-dl-btn {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s;
		cursor: pointer;
	}

	.pdf-dl-btn:hover {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	.dl-icon {
		font-size: 14px;
	}

	/* Clear button */
	.empty {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	@media (max-width: 600px) {
		.pdf-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
		.pdf-dl-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
