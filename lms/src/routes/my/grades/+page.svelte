<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';

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
		if (pct >= 80) return 'var(--color-green, #2ecc71)';
		if (pct >= 60) return 'var(--color-yellow, #f1c40f)';
		return 'var(--color-red, #e74c3c)';
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
					<div class="table-wrap">
					<table class="grade-table">
						<thead>
							<tr>
								<th>Assessment</th>
								<th>Type</th>
								<th>Score</th>
								<th>Max</th>
								<th>%</th>
								<th>Status</th>
								<th>Submitted</th>
								<th>Feedback</th>
							</tr>
						</thead>
						<tbody>
							{#each offering.assessments as a}
								{@const sub = offering.assessmentSubmissions?.find((s: any) => s.assessment_id === a.id)}
								<tr>
									<td>{a.title}</td>
									<td><span class="badge badge--{a.type}">{a.type}</span></td>
									<td>{sub?.score ?? '-'}</td>
									<td>{a.passing_score ?? '-'}</td>
									<td style="color: {gradeColor(sub?.score != null && a.passing_score ? (sub.score / a.passing_score * 100) : null)}">
										{sub?.score != null && a.passing_score ? Math.round(sub.score / a.passing_score * 100) + '%' : '-'}
									</td>
									<td><span class="status status--{sub?.status || 'pending'}">{statusLabel(sub?.status) || 'Pending'}</span></td>
									<td>{formatDate(sub?.submitted_at)}</td>
									<td class="feedback-cell">{sub?.feedback || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					</div>
				{/if}

				{#if offering.assignments.length > 0}
					<div class="table-wrap">
					<table class="grade-table">
						<thead>
							<tr>
								<th>Assignment</th>
								<th>Score</th>
								<th>Max</th>
								<th>%</th>
								<th>Status</th>
								<th>Submitted</th>
								<th>Feedback</th>
							</tr>
						</thead>
						<tbody>
							{#each offering.assignments as a}
								{@const sub = offering.assignmentSubmissions?.find((s: any) => s.assignment_id === a.id)}
								<tr>
									<td><a href="/my/assignments/{a.id}" class="assign-link">{a.title}</a></td>
									<td>{sub?.score ?? '-'}</td>
									<td>{a.max_score ?? '-'}</td>
									<td style="color: {gradeColor(sub?.score != null && a.max_score ? (sub.score / a.max_score * 100) : null)}">
										{sub?.score != null && a.max_score ? Math.round(sub.score / a.max_score * 100) + '%' : '-'}
									</td>
									<td><span class="status status--{sub?.status || 'pending'}">{statusLabel(sub?.status) || 'Pending'}</span></td>
									<td>{formatDate(sub?.submitted_at)}</td>
									<td class="feedback-cell">{sub?.feedback || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					</div>
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
		font-weight: 600;
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

	.error { color: var(--color-red, #e74c3c); }

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
		font-weight: 700;
	}

	.total-fraction {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.grade-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 8px;
		font-size: 14px;
	}

	.grade-table th {
		text-align: left;
		padding: 8px 10px;
		border-bottom: 2px solid var(--border);
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.grade-table td {
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		background: var(--bg-secondary);
	}

	.status {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
	}

	.status--graded { background: #2ecc7133; color: #2ecc71; }
	.status--submitted { background: #3498db33; color: #3498db; }
	.status--returned { background: #f39c1233; color: #f39c12; }
	.status--draft, .status--pending { background: var(--bg-secondary); color: var(--text-secondary); }

	.feedback-cell {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-secondary);
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
		.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -4px; }
		.grade-table { font-size: 12px; min-width: 560px; }
		.grade-table th, .grade-table td { padding: 6px 6px; }
		.feedback-cell { max-width: 100px; }
	}

	.assign-link {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
	.assign-link:hover {
		text-decoration: underline;
	}
</style>
