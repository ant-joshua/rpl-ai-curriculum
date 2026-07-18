<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { modules } from '$lib/stores/modules';

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
	<title>{t('resources.title')} — RPL AI</title>
</svelte:head>

<div class="resources-page">
	<h1>{t('resources.title')}</h1>
	<p class="subtitle">{t('resources.subtitle')}</p>

	<div class="search-bar">
		<span class="search-icon">🔍</span>
		<input
			type="text"
			placeholder="{t('resources.search')}"
			bind:value={searchQuery}
		/>
	</div>

	{#if !loaded}
		<div class="loading">{t('resources.loading')}</div>
	{:else if filtered.length === 0}
		<div class="empty">{t('resources.empty')}</div>
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
						href="/api/pdfs/{file.filename}"
						class="pdf-dl-btn"
						download
					>
						{t('resources.download')}
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
		font-weight: 590;
		letter-spacing: -0.288px;
		color: #f7f8f8;
		margin-bottom: 6px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.subtitle {
		font-size: 14px;
		color: #8a8f98;
		margin-bottom: 24px;
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
	}

	.search-bar input {
		width: 100%;
		padding: 8px 12px 8px 34px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		color: #f7f8f8;
		font-size: 13px;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		outline: none;
		transition: border-color 0.15s;
	}

	.search-bar input:focus {
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}

	.search-bar input::placeholder {
		color: #8a8f98;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: #8a8f98;
	}

	.empty {
		text-align: center;
		padding: 60px 20px;
		color: #8a8f98;
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
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		transition: all 0.15s;
	}

	.pdf-item:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(94, 106, 210, 0.3);
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
		font-weight: 510;
		color: #f7f8f8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-feature-settings: 'cv01', 'ss03';
	}

	.pdf-subtitle {
		font-size: 12px;
		color: #8a8f98;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-badge {
		font-size: 10px;
		font-weight: 510;
		padding: 2px 8px;
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

	.pdf-dl-btn {
		flex-shrink: 0;
		padding: 6px 14px;
		border: 1px solid rgba(94, 106, 210, 0.3);
		border-radius: 6px;
		background: rgba(94, 106, 210, 0.08);
		color: #7170ff;
		font-size: 13px;
		font-weight: 510;
		text-decoration: none !important;
		transition: all 0.15s;
		font-family: inherit;
	}

	.pdf-dl-btn:hover {
		background: #5e6ad2;
		border-color: #5e6ad2;
		color: #f7f8f8;
	}
</style>
