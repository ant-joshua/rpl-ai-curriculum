<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let offerings: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadOfferings();
	});

	async function loadOfferings() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/course-offerings');
			const json = await res.json();
			if (json.success) offerings = json.data || [];
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load offerings'; }
		finally { loading = false; }
	}
</script>

<svelte:head>
	<title>Assignment Management — RPL AI Curriculum</title>
</svelte:head>

<div class="assignments-page">
	<div class="page-header">
		<h1>📝 Penilaian Assignment</h1>
		<p class="subtitle">Pilih course offering untuk melihat submission mahasiswa.</p>
	</div>

	{#if loading}
		<div class="loading">Memuat offerings...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if offerings.length === 0}
		<div class="empty">Belum ada course offering.</div>
	{:else}
		<div class="offering-list">
			{#each offerings as o}
				<a href="/admin/assignments/{o.id}" class="offering-card">
					<div class="card-icon">📋</div>
					<div class="card-info">
						<h3>{o.name}</h3>
						<span class="card-code">{o.code || 'No code'}</span>
						<span class="card-status status--{o.status}">{o.status}</span>
					</div>
					<div class="card-meta">
						<span class="card-count">Lihat Submission →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.assignments-page {
		max-width: 800px;
	}

	.page-header {
		margin-bottom: 24px;
	}
	.page-header h1 {
		font-size: 24px;
		margin: 0 0 4px;
	}
	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin: 0;
	}

	.loading, .error, .empty {
		padding: 40px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error { color: var(--color-red, #e74c3c); }

	.offering-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.offering-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s ease;
	}
	.offering-card:hover {
		border-color: var(--accent);
		background: var(--hover);
		transform: translateX(4px);
	}
	.card-icon { font-size: 28px; }
	.card-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.card-info h3 {
		margin: 0;
		font-size: 16px;
	}
	.card-code {
		font-size: 13px;
		color: var(--text-secondary);
	}
	.card-meta { text-align: right; flex-shrink: 0; }
	.card-count {
		font-size: 13px;
		color: var(--accent);
		font-weight: 600;
	}
	.card-status {
		display: inline-block;
		align-self: flex-start;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		margin-top: 4px;
	}
	.status--active { background: #2ecc7133; color: #2ecc71; }
	.status--draft { background: var(--bg-secondary); color: var(--text-secondary); }
	.status--archived { background: #95a5a633; color: #95a5a6; }
	.status--completed { background: #3498db33; color: #3498db; }
</style>
