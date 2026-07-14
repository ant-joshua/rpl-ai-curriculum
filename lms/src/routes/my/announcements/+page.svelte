<script lang="ts">
	import { page } from '$app/stores';

	interface Announcement {
		id: string;
		title: string;
		body: string;
		priority: string;
		creatorName: string;
		offeringName: string;
		offeringId: string;
		createdAt: string;
		isNew: boolean;
	}

	interface Offering {
		id: string;
		name: string;
	}

	let { data }: { data: { announcements: Announcement[]; offerings: Offering[] } } = $props();

	let selectedOfferingId = $state('');
	let expandedId = $state<string | null>(null);

	let filteredAnnouncements = $derived(
		selectedOfferingId
			? data.announcements.filter(a => a.offeringId === selectedOfferingId)
			: data.announcements
	);

	function priorityConfig(p: string) {
		if (p === 'urgent') return { cls: 'badge-urgent', label: '🔴 Urgent' };
		if (p === 'high') return { cls: 'badge-high', label: '🔥 Penting' };
		if (p === 'low') return { cls: 'badge-low', label: 'ℹ️ Info' };
		return { cls: 'badge-normal', label: '📌 Normal' };
	}

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});
		} catch { return d; }
	}

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<svelte:head>
	<title>Pengumuman — RPL AI Curriculum</title>
</svelte:head>

<div class="announcements-page">
	<div class="page-header">
		<h1>📢 Pengumuman</h1>
	</div>

	{#if data.offerings.length > 1}
		<div class="filter-bar">
			<select bind:value={selectedOfferingId}>
				<option value="">Semua Kelas</option>
				{#each data.offerings as offering (offering.id)}
					<option value={offering.id}>{offering.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="announcements-list">
		{#if filteredAnnouncements.length === 0}
			<div class="empty">Belum ada pengumuman</div>
		{:else}
			{#each filteredAnnouncements as ann (ann.id)}
				<button
					class="announcement-card"
					class:expanded={expandedId === ann.id}
					class:is-new={ann.isNew}
					onclick={() => toggleExpand(ann.id)}
				>
					<div class="ann-header">
						<div class="ann-title-row">
							<h2>{ann.title}</h2>
							<span class="priority-badge {priorityConfig(ann.priority).cls}">{priorityConfig(ann.priority).label}</span>
							{#if ann.isNew}
								<span class="new-badge">Baru</span>
							{/if}
						</div>
						<div class="expand-icon">{expandedId === ann.id ? '▾' : '▸'}</div>
					</div>
					{#if expandedId === ann.id}
						<div class="ann-body">
							{ann.body}
						</div>
					{/if}
					<div class="ann-meta">
						{#if ann.offeringName}
							<span class="ann-offering">📖 {ann.offeringName}</span>
						{/if}
						<span>✍️ {ann.creatorName}</span>
						<span>🕐 {formatDate(ann.createdAt)}</span>
					</div>
				</button>
			{/each}
		{/if}
	</div>
</div>

<style>
	.announcements-page {
		max-width: 720px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.4rem;
	}

	.filter-bar {
		margin-bottom: 1.5rem;
	}

	.filter-bar select {
		width: 100%;
		max-width: 400px;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 0.85rem;
	}

	.announcements-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.announcement-card {
		display: block;
		width: 100%;
		text-align: left;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		color: var(--text);
		font-family: inherit;
		font-size: inherit;
	}

	.announcement-card:hover {
		border-color: var(--accent);
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	}

	.announcement-card.is-new {
		border-left: 3px solid var(--accent);
	}

	.announcement-card.expanded {
		border-color: var(--accent);
	}

	.ann-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.ann-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		flex: 1;
	}

	.ann-title-row h2 {
		font-size: 1rem;
		margin: 0;
		font-weight: 600;
	}

	.priority-badge {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
		white-space: nowrap;
	}

	.badge-urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
	.badge-high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
	.badge-normal { background: var(--accent-dim); color: var(--accent); }
	.badge-low { background: var(--surface-hover); color: var(--text-secondary); }

	.new-badge {
		font-size: 0.6rem;
		font-weight: 700;
		padding: 0.1rem 0.35rem;
		border-radius: 6px;
		background: var(--accent);
		color: #fff;
		text-transform: uppercase;
	}

	.expand-icon {
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin-left: 0.5rem;
		flex-shrink: 0;
	}

	.ann-body {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: var(--bg);
		border-radius: 8px;
		font-size: 0.9rem;
		color: var(--text);
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.ann-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: 0.75rem;
	}

	.ann-offering {
		font-weight: 500;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
	}

	@media (max-width: 640px) {
		.announcements-page { padding: 16px 12px 48px; }
		.announcement-card { padding: 1rem; }
		.ann-title-row h2 { font-size: 0.9rem; }
		.ann-meta { gap: 0.5rem; flex-direction: column; }
	}
</style>
