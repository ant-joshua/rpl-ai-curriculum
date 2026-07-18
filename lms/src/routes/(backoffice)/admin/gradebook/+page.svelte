<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, Badge, Loading, EmptyState } from '$lib/components/ui/index.js';

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
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>Gradebook — RPL AI Curriculum</title>
</svelte:head>

<div class="gradebook-page">
	<div class="page-header">
		<h1>📋 Gradebook</h1>
		<p class="subtitle">{t('admin.gradebook_desc')}</p>
	</div>

	{#if loading}
		<Loading message="Memuat offerings..." />
	{:else if error}
		<div class="error">{error}</div>
	{:else if offerings.length === 0}
		<EmptyState icon="📋" message="Belum ada course offering." />
	{:else}
		<div class="offering-list">
			{#each offerings as o}
				<a href="/admin/gradebook/{o.id}" class="offering-card">
					<div class="card-icon">📋</div>
					<div class="card-info">
						<h3>{o.name}</h3>
						<span class="card-code">{o.code || 'No code'}</span>
						<Badge variant={o.status === 'active' ? 'success' : o.status === 'draft' ? 'warning' : o.status === 'completed' ? 'primary' : 'default'}>
							{o.status}
						</Badge>
					</div>
					<div class="card-meta">
						<span class="card-count">{t('admin.lihat_gradebook')}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gradebook-page {
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

	.error {
		padding: 40px 20px;
		text-align: center;
		color: var(--color-red, #ef4444);
	}

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
		gap: 4px;
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
</style>
