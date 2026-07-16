<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, Badge, Modal, Input, Select, EmptyState, Alert, Loading } from '$lib/components/ui/index.js';

	interface Batch {
		id: string;
		template_id: string;
		academic_year: string;
		semester: number;
		grade_level_id: string;
		class_ids: string;
		total_students: number;
		generated_count: number;
		failed_count: number;
		status: string;
		created_by: string;
		created_at: string;
	}

	let batches = $state<Batch[]>([]);
	let templates: any[] = $state([]);
	let classes: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state('');

	// Filter
	let filterStatus = $state('');

	// Create batch modal
	let showCreateModal = $state(false);
	let createTemplateId = $state('');
	let createAcademicYear = $state('');
	let createSemester = $state(1);
	let createGradeLevelId = $state('');
	let selectedClassIds = $state<string[]>([]);
	let submitting = $state(false);

	const statusOptions = [
		{ value: '', label: 'All Status' },
		{ value: 'pending', label: '⏳ Pending' },
		{ value: 'generating', label: '🔄 Generating' },
		{ value: 'completed', label: '✅ Completed' },
		{ value: 'failed', label: '❌ Failed' },
	];

	const semesterOptions = [
		{ value: '1', label: 'Semester 1 (Ganjil)' },
		{ value: '2', label: 'Semester 2 (Genap)' },
	];

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [batchesRes, templatesRes, classesRes] = await Promise.all([
				fetch('/api/admin/report-cards/batches'),
				fetch('/api/admin/report-cards/templates'),
				fetch('/api/admin/classes?limit=500'),
			]);
			const batchesJson = await batchesRes.json();
			const templatesJson = await templatesRes.json();
			const classesJson = await classesRes.json();
			if (batchesJson.success) batches = batchesJson.data || [];
			else error = batchesJson.error || 'Failed';
			if (templatesJson.success) templates = templatesJson.data || [];
			if (classesJson.success) classes = classesJson.data || [];
		} catch { error = 'Failed to load data'; }
		finally { loading = false; }
	}

	const templateOptions = $derived(
		templates.map((t: any) => ({ value: t.id, label: t.name }))
	);

	const classOptions = $derived(
		classes.map((c: any) => ({ value: c.id, label: `${c.name} (${c.code || ''})` }))
	);

	const filteredBatches = $derived(
		filterStatus ? batches.filter(b => b.status === filterStatus) : batches
	);

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

	function getProgressPercent(batch: Batch): number {
		if (batch.total_students === 0) return 0;
		return Math.round((batch.generated_count / batch.total_students) * 100);
	}

	function openCreate() {
		createTemplateId = templates.length > 0 ? templates[0].id : '';
		createAcademicYear = new Date().getFullYear().toString();
		createSemester = 1;
		createGradeLevelId = '';
		selectedClassIds = [];
		error = '';
		success = '';
		showCreateModal = true;
	}

	function toggleClass(classId: string) {
		if (selectedClassIds.includes(classId)) {
			selectedClassIds = selectedClassIds.filter(id => id !== classId);
		} else {
			selectedClassIds = [...selectedClassIds, classId];
		}
	}

	async function createBatch() {
		if (!createTemplateId || !createAcademicYear || selectedClassIds.length === 0) {
			error = 'Template, academic year, and at least one class required';
			return;
		}
		submitting = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/api/admin/report-cards/batches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					template_id: createTemplateId,
					academic_year: createAcademicYear,
					semester: createSemester,
					grade_level_id: createGradeLevelId,
					class_ids: selectedClassIds,
				}),
			});
			const json = await res.json();
			if (json.success) {
				batches = [json.data, ...batches];
				success = 'Batch created successfully';
				showCreateModal = false;
			} else {
				error = json.error || 'Failed';
			}
		} catch {
			error = 'Failed to connect';
		}
		submitting = false;
	}
</script>

<svelte:head>
	<title>Report Card Batches — Admin</title>
</svelte:head>

<div class="batches-page">
	<div class="page-header">
		<div>
			<h1>📦 Report Card Batches</h1>
			<p class="page-desc">Create and manage batch generation of report cards</p>
		</div>
		<Button onclick={openCreate} disabled={templates.length === 0}>➕ New Batch</Button>
	</div>

	{#if success}
		<Alert variant="success">{success}</Alert>
	{/if}
	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- Filter -->
	<div class="filter-bar">
		<Select options={statusOptions} bind:value={filterStatus} placeholder="Filter by status" />
		<span class="filter-count">{filteredBatches.length} batches</span>
	</div>

	{#if loading}
		<Loading message="Loading batches..." />
	{:else if filteredBatches.length === 0}
		<EmptyState icon="📦" title="No Batches" description="Create a batch to start generating report cards." />
	{:else}
		<div class="batch-list">
			{#each filteredBatches as batch (batch.id)}
				<div class="batch-card">
					<div class="batch-header-row">
						<div class="batch-info">
							<div class="batch-title-row">
								<h3>Batch #{batch.id.slice(0, 8)}</h3>
								<Badge variant={statusBadgeVariant(batch.status) as any}>{statusLabel(batch.status)}</Badge>
							</div>
							<div class="batch-details">
								<span>📅 {batch.academic_year} - Semester {batch.semester}</span>
								<span>📋 Template: {batch.template_id.slice(0, 8)}</span>
								{(() => {
									const ids = JSON.parse(batch.class_ids || '[]');
									return ids.map((id: string) => id.slice(0, 8)).join(', ');
								})()}
								<span>🕐 {formatDate(batch.created_at)}</span>
							</div>
						</div>
					</div>
					<div class="batch-progress-section">
						<div class="batch-stats">
							<div class="stat"><span class="stat-num">{batch.total_students}</span> students</div>
							<div class="stat"><span class="stat-num">{batch.generated_count}</span> generated</div>
							<div class="stat failed"><span class="stat-num">{batch.failed_count}</span> failed</div>
						</div>
						<div class="batch-progress-bar">
							<div class="progress-bg">
								<div class="progress-fill" style="width: {getProgressPercent(batch)}%"></div>
							</div>
							<span class="progress-pct">{getProgressPercent(batch)}%</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Batch Modal -->
{#if showCreateModal}
	<Modal open={showCreateModal} title="Create New Batch" onclose={() => showCreateModal = false}>
		<Select label="Template" options={templateOptions} bind:value={createTemplateId} />
		<Input label="Academic Year" bind:value={createAcademicYear} placeholder="e.g. 2025/2026" />
		<Select label="Semester" options={semesterOptions} bind:value={createSemester as any} />

		<div class="field-group" role="group" aria-labelledby="class-selection-label">
			<span class="field-label" id="class-selection-label">Select Classes</span>
			<div class="class-list">
				{#each classes as cls}
					<label class="class-checkbox">
						<input
							type="checkbox"
							checked={selectedClassIds.includes(cls.id)}
							onchange={() => toggleClass(cls.id)}
						/>
						<span>{cls.name} {cls.code ? `(${cls.code})` : ''}</span>
					</label>
				{/each}
				{#if classes.length === 0}
					<p class="no-classes">No classes available</p>
				{/if}
			</div>
		</div>

		{#snippet footer()}
			<Button variant="secondary" onclick={() => showCreateModal = false} disabled={submitting}>Cancel</Button>
			<Button onclick={createBatch} disabled={submitting || selectedClassIds.length === 0}>
				{submitting ? 'Creating...' : '📦 Create Batch'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.batches-page { max-width: 900px; }

	h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.filter-bar {
		display: flex;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 20px;
	}
	.filter-count { font-size: 13px; color: var(--text-secondary); }

	.batch-list { display: flex; flex-direction: column; gap: 12px; }
	.batch-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.batch-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}
	.batch-title-row h3 { margin: 0; font-size: 16px; font-weight: 600; }
	.batch-details {
		display: flex;
		gap: 16px;
		font-size: 13px;
		color: var(--text-secondary);
		flex-wrap: wrap;
	}
	.batch-progress-section { margin-top: 12px; }
	.batch-stats {
		display: flex;
		gap: 16px;
		margin-bottom: 8px;
	}
	.stat { font-size: 13px; color: var(--text-secondary); }
	.stat .stat-num { font-weight: 600; color: var(--text); }
	.stat.failed .stat-num { color: #ef4444; }

	.batch-progress-bar {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.progress-bg {
		flex: 1;
		height: 8px;
		background: rgba(255,255,255,0.06);
		border-radius: 4px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #5e6ad2, #7170ff);
		border-radius: 4px;
		transition: width 0.3s ease;
	}
	.progress-pct { font-size: 12px; color: var(--text-secondary); min-width: 36px; }

	.field-group { display: flex; flex-direction: column; gap: 6px; }
	.field-label {
		font-size: 12px;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}
	.class-list {
		max-height: 200px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px;
		background: rgba(0,0,0,0.15);
		border: 1px solid rgba(255,255,255,0.05);
		border-radius: 6px;
	}
	.class-checkbox {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		padding: 4px 0;
		cursor: pointer;
	}
	.class-checkbox input { accent-color: #5e6ad2; }
	.no-classes { font-size: 13px; color: #62666d; text-align: center; padding: 16px; }
</style>
