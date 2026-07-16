<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Card, CardContent, Alert, Button } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');

	let exports: Record<string, { total: number; lastExport: string | null }> = $state({});
	let exporting = $state<string | null>(null);
	let exportError = $state('');

	const exportTypes = [
		{ id: 'attendance', label: 'Attendance Records', icon: '📅', desc: 'All attendance check-ins with session info and student names' },
		{ id: 'payments', label: 'Payments', icon: '💰', desc: 'Payment transactions with invoice and student details' },
		{ id: 'grades', label: 'Grades', icon: '🎓', desc: 'Assessment submissions with scores and feedback' },
		{ id: 'enrollments', label: 'Enrollments', icon: '📋', desc: 'Course enrollment records with student and course info' },
		{ id: 'users', label: 'Users', icon: '👥', desc: 'All registered users in the system' },
	];

	onMount(() => {
		if (!browser) return;
		loadCounts();
	});

	async function loadCounts() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/exports');
			const json = await res.json();
			if (json.success) exports = json.data || {};
			else error = json.error || 'Failed to load';
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	async function doExport(type: string) {
		exporting = type;
		exportError = '';
		try {
			const res = await fetch(`/api/admin/exports/${type}`);
			if (!res.ok) {
				const err = await res.json().catch(() => ({ error: 'Export failed' }));
				exportError = err.error || `HTTP ${res.status}`;
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${type}-export.csv`;
			a.click();
			URL.revokeObjectURL(url);
			await loadCounts();
		} catch { exportError = 'Download failed'; }
		finally { exporting = null; }
	}
</script>

<svelte:head>
	<title>📤 Data Exports — Admin</title>
</svelte:head>

<div class="exports-page">
	<div class="header-row">
		<h1>📤 Data Exports</h1>
	</div>

	{#if loading}
		<div class="loading">Loading...</div>
	{:else if error}
		<div class="error-state">
			<Alert variant="danger">{error}</Alert>
			<Button onclick={loadCounts}>Retry</Button>
		</div>
	{:else}

		{#if exportError}
			<Alert variant="danger">{exportError}</Alert>
		{/if}

		<div class="export-grid">
			{#each exportTypes as et}
				<Card class="export-card">
					<CardContent>
						<span class="export-icon">{et.icon}</span>
						<h2>{et.label}</h2>
						<p class="export-desc">{et.desc}</p>
						<div class="export-meta">
							<span class="export-count">{exports[et.id]?.total ?? 0} records</span>
						</div>
						<Button
							size="sm"
							onclick={() => doExport(et.id)}
							disabled={exporting !== null}
						>
							{exporting === et.id ? 'Downloading...' : '📥 Download CSV'}
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.exports-page { max-width: 900px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; }

	.export-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 14px;
	}
	:global(.export-card) :global(.card-content) {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
	}
	.export-icon { font-size: 28px; }
	.export-desc { font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.4; }
	.export-meta { font-size: 12px; color: var(--accent); font-weight: 600; }
	.export-count { }

	@media (max-width: 768px) {
		.export-grid { grid-template-columns: 1fr; }
	}
</style>
