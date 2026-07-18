<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let offerings: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadGrades();
	});

	async function loadGrades() {
		loading = true;
		error = '';
		try {
			const res = await api('/api/my/grades');
			if (res.success) offerings = res.data || [];
			else error = res.error || 'Failed to load grades';
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	function gradeColor(pct: number | null): string {
		if (pct === null) return 'var(--text-secondary)';
		if (pct >= 80) return '#22c55e';
		if (pct >= 60) return '#f59e0b';
		return '#ef4444';
	}

	function statusLabel(status: string): string {
		const map: Record<string, string> = {
			draft: 'Draft',
			submitted: 'Submitted',
			graded: 'Graded',
			returned: 'Returned',
		};
		return map[status] || status;
	}

	function formatDate(d: string | null) {
		if (!d) return '-';
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
		} catch { return d; }
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function buildAssessmentColumns(): ColumnDef<any, any>[] {
		return [
			{
				header: 'Assessment',
				accessorKey: 'title',
				cell: ({ getValue }) => `<span style="font-weight:500">${esc(getValue() as string)}</span>`
			},
			{
				header: 'Type',
				accessorKey: 'type',
				cell: ({ getValue }) => {
					const type = getValue() as string;
					return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:510;background:var(--bg-secondary)">${esc(type)}</span>`;
				}
			},
			{
				header: 'Score',
				accessorKey: '__score',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return sub?.score != null ? String(sub.score) : '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: 'Max',
				accessorKey: 'passing_score',
				cell: ({ getValue }) => {
					const v = getValue();
					return v != null ? String(v) : '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: '%',
				accessorKey: '__pct',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					const a = row.original;
					if (sub?.score != null && a.passing_score) {
						const pct = Math.round(sub.score / a.passing_score * 100);
						const color = gradeColor(pct);
						return `<span style="color:${color};font-weight:600">${pct}%</span>`;
					}
					return '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: 'Status',
				accessorKey: '__status',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					const status = sub?.status || 'pending';
					const label = statusLabel(status);
					let bg = 'var(--bg-secondary)';
					let color = 'var(--text-secondary)';
					if (status === 'graded') { bg = '#22c55e33'; color = '#22c55e'; }
					else if (status === 'submitted') { bg = '#3b82f633'; color = '#3b82f6'; }
					else if (status === 'returned') { bg = '#f59e0b33'; color = '#f59e0b'; }
					return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:510;background:${bg};color:${color}">${esc(label)}</span>`;
				}
			},
			{
				header: 'Submitted',
				accessorKey: '__submitted',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return `<span style="color:var(--text-secondary);font-size:12px">${esc(formatDate(sub?.submitted_at))}</span>`;
				}
			},
			{
				header: 'Feedback',
				accessorKey: '__feedback',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return `<span style="color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">${esc(sub?.feedback) || '-'}</span>`;
				}
			}
		];
	}

	function buildAssignmentColumns(): ColumnDef<any, any>[] {
		return [
			{
				header: 'Assignment',
				accessorKey: 'title',
				cell: ({ getValue, row }) => {
					const title = esc(getValue() as string);
					const id = row.original.id;
					return `<a href="/my/assignments/${id}" style="color:var(--accent);text-decoration:none;font-weight:500">${title}</a>`;
				}
			},
			{
				header: 'Score',
				accessorKey: '__score',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return sub?.score != null ? String(sub.score) : '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: 'Max',
				accessorKey: 'max_score',
				cell: ({ getValue }) => {
					const v = getValue();
					return v != null ? String(v) : '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: '%',
				accessorKey: '__pct',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					const a = row.original;
					if (sub?.score != null && a.max_score) {
						const pct = Math.round(sub.score / a.max_score * 100);
						const color = gradeColor(pct);
						return `<span style="color:${color};font-weight:600">${pct}%</span>`;
					}
					return '<span style="color:var(--text-secondary)">-</span>';
				}
			},
			{
				header: 'Status',
				accessorKey: '__status',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					const status = sub?.status || 'pending';
					const label = statusLabel(status);
					let bg = 'var(--bg-secondary)';
					let color = 'var(--text-secondary)';
					if (status === 'graded') { bg = '#22c55e33'; color = '#22c55e'; }
					else if (status === 'submitted') { bg = '#3b82f633'; color = '#3b82f6'; }
					else if (status === 'returned') { bg = '#f59e0b33'; color = '#f59e0b'; }
					return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:510;background:${bg};color:${color}">${esc(label)}</span>`;
				}
			},
			{
				header: 'Submitted',
				accessorKey: '__submitted',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return `<span style="color:var(--text-secondary);font-size:12px">${esc(formatDate(sub?.submitted_at))}</span>`;
				}
			},
			{
				header: 'Feedback',
				accessorKey: '__feedback',
				cell: ({ row }) => {
					const sub = row.original.__sub;
					return `<span style="color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">${esc(sub?.feedback) || '-'}</span>`;
				}
			}
		];
	}

	function prepareAssessments(offering: any): any[] {
		return (offering.assessments || []).map((a: any) => ({
			...a,
			__sub: offering.assessmentSubmissions?.find((s: any) => s.assessment_id === a.id)
		}));
	}

	function prepareAssignments(offering: any): any[] {
		return (offering.assignments || []).map((a: any) => ({
			...a,
			__sub: offering.assignmentSubmissions?.find((s: any) => s.assignment_id === a.id)
		}));
	}
</script>

<svelte:head>
	<title>My Grades — RPL AI Curriculum</title>
</svelte:head>

<div class="grades-page">
	<div class="page-header">
		<a href="/my/dashboard" class="back-link">← Dashboard</a>
		<h1>My Grades</h1>
	</div>

	{#if loading}
		<div class="loading">Loading grades...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if offerings.length === 0}
		<div class="empty">No grades found. You are not enrolled in any courses.</div>
	{:else}
		{#each offerings as offering}
			<div class="offering-card">
				<div class="offering-header">
					<div class="offering-info">
						<h2>{offering.course_title || offering.offering_name}</h2>
						<span class="offering-code">{offering.offering_code || offering.offering_name}</span>
					</div>
					<div class="offering-summary">
						{#if offering.percentage !== null}
							<div class="total-pct" style="color: {gradeColor(offering.percentage)}">
								{offering.percentage}%
							</div>
							<div class="total-fraction">
								{offering.total_score?.toFixed(1) ?? '?'} / {offering.total_max_score?.toFixed(1) ?? '?'}
							</div>
						{:else}
							<div class="total-pct" style="color: var(--text-secondary)">—</div>
							<div class="total-fraction">No grades yet</div>
						{/if}
					</div>
				</div>

				{#if offering.assessments.length > 0}
					<h3 class="table-sub-header">Assessments</h3>
					<DataTable
						columns={buildAssessmentColumns()}
						data={prepareAssessments(offering)}
						pageSize={20}
						showSearch={false}
						showPagination={false}
						emptyMessage="Tidak ada assessment"
					/>
				{/if}

				{#if offering.assignments.length > 0}
					<h3 class="table-sub-header">Assignments</h3>
					<DataTable
						columns={buildAssignmentColumns()}
						data={prepareAssignments(offering)}
						pageSize={20}
						showSearch={false}
						showPagination={false}
						emptyMessage="Tidak ada assignment"
					/>
				{/if}

				{#if offering.assessments.length === 0 && offering.assignments.length === 0}
					<div class="no-items">No assessments or assignments yet.</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.grades-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	h1 {
		font-size: 24px;
		margin-bottom: 24px;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
	}

	.page-header h1 {
		margin-bottom: 0;
	}

	.back-link {
		font-size: 13px;
		font-weight: 510;
		color: var(--accent);
		text-decoration: none;
		padding: 4px 10px;
		border-radius: 6px;
		background: var(--accent-dim);
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.back-link:hover {
		background: var(--accent);
		color: #fff;
	}

	.loading, .error, .empty {
		padding: 40px 20px;
		text-align: center;
		color: var(--text-secondary);
	}

	.error { color: var(--color-red, #ef4444); }

	.offering-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.offering-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.offering-info h2 {
		font-feature-settings: 'cv01', 'ss03';
		font-size: 18px;
		margin: 0 0 4px 0;
	}

	.offering-code {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.offering-summary {
		text-align: right;
	}

	.total-pct {
		font-size: 28px;
		font-weight: 590;
	}

	.total-fraction {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.table-sub-header {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 16px 0 8px;
	}

	.no-items {
		padding: 16px;
		text-align: center;
		color: var(--text-secondary);
		font-size: 14px;
	}

	@media (max-width: 768px) {
		.grades-page { padding: 16px 12px; }
		.page-header { flex-wrap: wrap; gap: 8px; }
		h1 { font-size: 20px; }
		.offering-card { padding: 14px; }
		.offering-header { flex-direction: column; align-items: flex-start; gap: 8px; }
		.offering-summary { text-align: left; }
		.total-pct { font-size: 24px; }
	}
</style>
