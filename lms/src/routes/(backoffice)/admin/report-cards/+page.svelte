<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, CardTitle, Badge, Loading, EmptyState, Alert, StatCard, PageHeader } from '$lib/components/ui/index.js';

	let recentBatches: any[] = $state([]);
	let templates: any[] = $state([]);
	let loading = $state(true);
	let generating = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [batchesRes, templatesRes] = await Promise.all([
				fetch('/api/admin/report-cards/batches'),
				fetch('/api/admin/report-cards/templates'),
			]);
			const batchesJson = await batchesRes.json();
			const templatesJson = await templatesRes.json();
			if (batchesJson.success) recentBatches = (batchesJson.data || []).slice(0, 10);
			else error = batchesJson.error || 'Failed to load batches';
			if (templatesJson.success) templates = templatesJson.data || [];
		} catch { error = 'Failed to load data'; }
		finally { loading = false; }
	}

	function statusBadgeVariant(status: string): string {
		const map: Record<string, string> = {
			pending: 'default',
			generating: 'info',
			completed: 'success',
			failed: 'danger',
		};
		return map[status] || 'default';
	}

	function statusLabel(status: string): string {
		const map: Record<string, string> = {
			pending: '⏳ Pending',
			generating: '🔄 Generating',
			completed: '✅ Completed',
			failed: '❌ Failed',
		};
		return map[status] || status;
	}

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});
		} catch { return d; }
	}

	function getProgressPercent(batch: any): number {
		if (batch.total_students === 0) return 0;
		return Math.round((batch.generated_count / batch.total_students) * 100);
	}

	async function quickGenerate() {
		const defaultTemplate = templates.find((t: any) => t.is_default) || templates[0];
		if (!defaultTemplate) {
			error = 'No template available. Create one first.';
			return;
		}
		generating = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/api/admin/report-cards/batches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					template_id: defaultTemplate.id,
					academic_year: new Date().getFullYear().toString(),
					semester: 1,
					grade_level_id: '',
					class_ids: [],
				}),
			});
			const json = await res.json();
			if (json.success) {
				success = 'Batch created successfully. Go to Batches to start generation.';
				recentBatches = [json.data, ...recentBatches];
			} else {
				error = json.error || 'Failed to create batch';
			}
		} catch {
			error = 'Failed to connect to server';
		}
		generating = false;
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="report-cards-dashboard">
	<PageHeader title="📄 Report Cards" subtitle="Generate and manage student report cards">
		<svelte:fragment slot="action">
			<div class="header-actions">
				<Button href="/admin/report-cards/templates" variant="secondary">📝 Templates</Button>
				<Button href="/admin/report-cards/batches" variant="secondary">📦 Batches</Button>
				<Button href="/admin/report-cards/teacher-comments" variant="secondary">💬 Comments</Button>
				<Button onclick={quickGenerate} disabled={generating || templates.length === 0}>
					{generating ? 'Creating...' : '⚡ Quick Generate'}
				</Button>
			</div>
		</svelte:fragment>
	</PageHeader>

	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}
	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<div class="dashboard-grid">
		<!-- Stats Cards -->
		<StatCard icon="📝" value={templates.length} label="Templates" />
		<StatCard icon="✅" value={recentBatches.filter((b: any) => b.status === 'completed').length} label="Batch Selesai" />
		<StatCard icon="⏳" value={recentBatches.filter((b: any) => b.status === 'pending' || b.status === 'generating').length} label="Batch Aktif" />
	</div>

	<!-- Recent Batches -->
	<div class="section">
		<h2>Recent Batches</h2>
		{#if loading}
			<Loading message="Loading batches..." />
		{:else if recentBatches.length === 0}
			<EmptyState icon="📦" title="No Batches Yet" description="Create a batch to start generating report cards." />
		{:else}
			<div class="batch-list">
				{#each recentBatches as batch (batch.id)}
					<div class="batch-card">
						<div class="batch-info">
							<div class="batch-header">
								<strong>Batch #{batch.id.slice(0, 8)}</strong>
								<Badge variant={statusBadgeVariant(batch.status) as any}>{statusLabel(batch.status)}</Badge>
							</div>
							<div class="batch-meta">
								<span>Templates ID: {batch.template_id.slice(0, 8)}</span>
								<span>{batch.academic_year} - Semester {batch.semester}</span>
								<span>{formatDate(batch.created_at)}</span>
							</div>
							<div class="batch-progress">
								<div class="progress-bar-bg">
									<div class="progress-bar-fill" style="width: {getProgressPercent(batch)}%"></div>
								</div>
								<span class="progress-text">{batch.generated_count}/{batch.total_students} generated</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.report-cards-dashboard { max-width: 1000px; }

	.header-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 32px;
	}

	.section { margin-top: 24px; }
	.section h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }

	.batch-list { display: flex; flex-direction: column; gap: 12px; }
	.batch-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.batch-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.batch-meta {
		display: flex;
		gap: 16px;
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	.batch-progress {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.progress-bar-bg {
		flex: 1;
		height: 6px;
		background: rgba(255,255,255,0.06);
		border-radius: 3px;
		overflow: hidden;
	}
	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #5e6ad2, #7170ff);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	.progress-text { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }
</style>
