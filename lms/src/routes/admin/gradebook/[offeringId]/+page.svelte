<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { data }: { data: any } = $props();

	let enrollments = $derived<any[]>(data.enrollments || []);
	let assessments = $derived<any[]>(data.assessments || []);
	let assignments = $derived<any[]>(data.assignments || []);
	let grades = $derived<any[]>(data.grades || []);
	let assessmentSubmissions = $derived<any[]>(data.assessmentSubmissions || []);
	let assignmentSubmissions = $derived<any[]>(data.assignmentSubmissions || []);

	let editCell = $state<{ userId: string; type: 'assessment' | 'assignment'; id: string; field: string } | null>(null);
	let editValue = $state('');
	let saving = $state(false);
	let saveError = $state('');

	let searchQuery = $state('');

	let filteredEnrollments = $derived(
		searchQuery
			? enrollments.filter(e =>
					(e.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
					(e.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
					(e.username || '').toLowerCase().includes(searchQuery.toLowerCase())
			  )
			: enrollments
	);

	function getGrade(userId: string, assmtId: string, isAssignment: boolean) {
		const gradeKey = isAssignment ? 'assignment_submission_id' : 'assessment_submission_id';
		return grades.find(g => g.user_id === userId && (
			isAssignment
				? g.assignment_submission_id && assignmentSubmissions.find(s => s.id === g.assignment_submission_id && s.assignment_id === assmtId)
				: g.assessment_submission_id && assessmentSubmissions.find(s => s.id === g.assessment_submission_id && s.assessment_id === assmtId)
		));
	}

	function getSubmission(userId: string, assmtId: string, isAssignment: boolean) {
		if (isAssignment) {
			return assignmentSubmissions.find(s => s.user_id === userId && s.assignment_id === assmtId);
		}
		return assessmentSubmissions.find(s => s.user_id === userId && s.assessment_id === assmtId);
	}

	function getSubmissionScore(userId: string, assmtId: string, isAssignment: boolean): number | null {
		const sub = getSubmission(userId, assmtId, isAssignment);
		if (!sub) return null;
		// Check gradebook for manual score override
		const grade = grades.find(g => g.user_id === userId && (
			isAssignment
				? g.assignment_submission_id === sub.id
				: g.assessment_submission_id === sub.id
		));
		if (grade && grade.score != null) return grade.score;
		return sub.score ?? null;
	}

	function getMaxScore(assmt: any, isAssignment: boolean): number {
		if (isAssignment) return assmt.max_score ?? 100;
		return assmt.passing_score ?? 100;
	}

	function pct(userId: string, assmt: any, isAssignment: boolean): number | null {
		const score = getSubmissionScore(userId, assmt.id, isAssignment);
		const max = getMaxScore(assmt, isAssignment);
		if (score == null || max <= 0) return null;
		return Math.round((score / max) * 100);
	}

	function gradeColor(pctVal: number | null): string {
		if (pctVal === null) return 'var(--text-secondary)';
		if (pctVal >= 80) return 'var(--color-green, #2ecc71)';
		if (pctVal >= 60) return 'var(--color-yellow, #f1c40f)';
		return 'var(--color-red, #e74c3c)';
	}

	function calcTotal(userId: string): { score: number; max: number; pct: number | null } {
		let totalScore = 0;
		let totalMax = 0;
		for (const a of assessments) {
			const s = getSubmissionScore(userId, a.id, false);
			const m = getMaxScore(a, false);
			const w = a.weight ?? 1;
			if (s != null && m > 0) {
				totalScore += s * w;
				totalMax += m * w;
			}
		}
		for (const a of assignments) {
			const s = getSubmissionScore(userId, a.id, true);
			const m = getMaxScore(a, true);
			const w = a.weight ?? 1;
			if (s != null && m > 0) {
				totalScore += s * w;
				totalMax += m * w;
			}
		}
		const pctVal = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
		return { score: totalScore, max: totalMax, pct: pctVal };
	}

	function startEdit(userId: string, type: 'assessment' | 'assignment', id: string, field: string, currentValue: any) {
		editCell = { userId, type, id, field };
		editValue = currentValue != null ? String(currentValue) : '';
		saveError = '';
	}

	function cancelEdit() {
		editCell = null;
		editValue = '';
	}

	async function saveEdit() {
		if (!editCell) return;
		saving = true;
		saveError = '';
		try {
			const { userId, type, id, field } = editCell;
			const isAssignment = type === 'assignment';
			let sub = getSubmission(userId, id, isAssignment);
			const assmt = isAssignment ? assignments.find(a => a.id === id) : assessments.find(a => a.id === id);
			const maxScore = getMaxScore(assmt, isAssignment);

			// Upsert submission if needed
			if (!sub) {
				const res = await fetch(`/api/admin/${isAssignment ? 'assignment-submissions' : 'assessment-submissions'}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						[isAssignment ? 'assignment_id' : 'assessment_id']: id,
						user_id: userId,
						status: 'graded',
						score: field === 'score' ? parseFloat(editValue) : null,
						max_score: maxScore,
					}),
				});
				const json = await res.json();
				if (!json.success) { saveError = json.error || 'Failed to save'; return; }
				// Reload page
				window.location.reload();
				return;
			}

			// Update submission score
			const updateBody: any = {};
			if (field === 'score') updateBody.score = parseFloat(editValue);
			const res = await fetch(`/api/admin/${isAssignment ? 'assignment-submissions' : 'assessment-submissions'}/${sub.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateBody),
			});
			const json = await res.json();
			if (!json.success) { saveError = json.error || 'Failed to save'; return; }

			cancelEdit();
			// Reload to refresh data
			window.location.reload();
		} catch {
			saveError = 'Network error';
		} finally {
			saving = false;
		}
	}

	function exportCSV() {
		let csv = 'Student';
		for (const a of assessments) csv += `,${a.title} (%)`;
		for (const a of assignments) csv += `,${a.title} (%)`;
		csv += ',Total (%)';

		csv += '\n';
		for (const e of filteredEnrollments) {
			csv += `"${e.display_name || e.username || e.email}"`;
			for (const a of assessments) {
				const p = pct(e.user_id, a, false);
				csv += `,${p != null ? p : ''}`;
			}
			for (const a of assignments) {
				const p = pct(e.user_id, a, true);
				csv += `,${p != null ? p : ''}`;
			}
			const total = calcTotal(e.user_id);
			csv += `,${total.pct != null ? total.pct : ''}`;
			csv += '\n';
		}

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `gradebook-${data.offering?.code || 'export'}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Gradebook — {data.offering?.name || 'Gradebook'} — RPL AI Curriculum</title>
</svelte:head>

<div class="gradebook-page">
	<div class="header">
		<div>
			<h1>Gradebook</h1>
			<p class="offering-name">{data.offering?.name} ({data.offering?.code})</p>
		</div>
		<div class="header-actions">
			<input
				type="text"
				class="search-input"
				placeholder="Search student..."
				bind:value={searchQuery}
			/>
			<button class="btn btn--export" onclick={exportCSV}>Export CSV</button>
			<a href="/admin" class="btn btn--back">← Back</a>
		</div>
	</div>

	{#if filteredEnrollments.length === 0}
		<div class="empty">No students enrolled in this offering.</div>
	{:else}
		<div class="table-wrapper">
			<table class="gradebook-table">
				<thead>
					<tr>
						<th class="sticky">Student</th>
						{#each assessments as a}
							<th class="rotate" title="{a.title}">{a.title}</th>
						{/each}
						{#each assignments as a}
							<th class="rotate" title="{a.title}">{a.title}</th>
						{/each}
						<th class="rotate total-header">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredEnrollments as e}
						<tr>
							<td class="sticky student-cell">
								<span class="student-name">{e.display_name || e.username || e.email}</span>
								<span class="student-email">{e.email}</span>
							</td>
							{#each assessments as a}
								{@const p = pct(e.user_id, a, false)}
								{@const score = getSubmissionScore(e.user_id, a.id, false)}
								<td
									class="score-cell"
									style="color: {gradeColor(p)}"
									onclick={() => startEdit(e.user_id, 'assessment', a.id, 'score', score)}
									role="button"
									tabindex="0"
									onkeydown={(ev) => ev.key === 'Enter' && startEdit(e.user_id, 'assessment', a.id, 'score', score)}
								>
									{#if editCell && editCell.userId === e.user_id && editCell.type === 'assessment' && editCell.id === a.id}
										<div class="inline-edit">
											<input
												type="number"
												step="0.5"
												bind:value={editValue}
												onclick={(ev) => ev.stopPropagation()}
												onkeydown={(ev) => { if (ev.key === 'Enter') saveEdit(); if (ev.key === 'Escape') cancelEdit(); }}
												autofocus
											/>
											<div class="inline-edit-actions">
												<button class="btn btn--sm btn--save" onclick={(ev) => { ev.stopPropagation(); saveEdit(); }} disabled={saving}>✓</button>
												<button class="btn btn--sm btn--cancel" onclick={(ev) => { ev.stopPropagation(); cancelEdit(); }}>✕</button>
											</div>
											{#if saveError}<span class="save-error">{saveError}</span>{/if}
										</div>
									{:else}
										{p !== null ? p + '%' : '-'}
									{/if}
								</td>
							{/each}
							{#each assignments as a}
								{@const p = pct(e.user_id, a, true)}
								{@const score = getSubmissionScore(e.user_id, a.id, true)}
								<td
									class="score-cell"
									style="color: {gradeColor(p)}"
									onclick={() => startEdit(e.user_id, 'assignment', a.id, 'score', score)}
									role="button"
									tabindex="0"
									onkeydown={(ev) => ev.key === 'Enter' && startEdit(e.user_id, 'assignment', a.id, 'score', score)}
								>
									{#if editCell && editCell.userId === e.user_id && editCell.type === 'assignment' && editCell.id === a.id}
										<div class="inline-edit">
											<input
												type="number"
												step="0.5"
												bind:value={editValue}
												onclick={(ev) => ev.stopPropagation()}
												onkeydown={(ev) => { if (ev.key === 'Enter') saveEdit(); if (ev.key === 'Escape') cancelEdit(); }}
												autofocus
											/>
											<div class="inline-edit-actions">
												<button class="btn btn--sm btn--save" onclick={(ev) => { ev.stopPropagation(); saveEdit(); }} disabled={saving}>✓</button>
												<button class="btn btn--sm btn--cancel" onclick={(ev) => { ev.stopPropagation(); cancelEdit(); }}>✕</button>
											</div>
											{#if saveError}<span class="save-error">{saveError}</span>{/if}
										</div>
									{:else}
										{p !== null ? p + '%' : '-'}
									{/if}
								</td>
							{/each}
							<td class="total-cell" style="color: {gradeColor(calcTotal(e.user_id).pct)}">
								{calcTotal(e.user_id).pct !== null ? calcTotal(e.user_id).pct + '%' : '-'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if saveError}
		<div class="error-toast">{saveError}</div>
	{/if}
</div>

<style>
	.gradebook-page {
		padding: 0;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 12px;
	}

	.header h1 {
		font-size: 24px;
		margin: 0 0 4px 0;
	}

	.offering-name {
		margin: 0;
		color: var(--text-secondary);
		font-size: 14px;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.search-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		width: 200px;
	}

	.btn {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		background: var(--surface);
		color: var(--text);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.btn:hover { background: var(--hover); }
	.btn--export { background: var(--accent); color: white; border-color: var(--accent); }
	.btn--sm { padding: 4px 8px; font-size: 12px; min-width: 24px; justify-content: center; }
	.btn--save { background: #2ecc71; color: white; border-color: #2ecc71; }
	.btn--cancel { background: #e74c3c; color: white; border-color: #e74c3c; }
	.btn--back { color: var(--text-secondary); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
	}

	.gradebook-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		min-width: 600px;
	}

	.gradebook-table th {
		padding: 10px 12px;
		border-bottom: 2px solid var(--border);
		background: var(--surface);
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-secondary);
		white-space: nowrap;
		text-align: center;
	}

	.gradebook-table th.rotate {
		writing-mode: vertical-lr;
		transform: rotate(180deg);
		height: 80px;
		vertical-align: bottom;
		padding: 12px 6px;
	}

	.gradebook-table th.total-header {
		color: var(--accent);
	}

	.gradebook-table td {
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
		text-align: center;
	}

	.sticky {
		position: sticky;
		left: 0;
		z-index: 1;
		background: var(--surface);
		text-align: left;
		min-width: 150px;
	}

	.student-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.student-name {
		font-weight: 600;
		font-size: 13px;
	}

	.student-email {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.score-cell {
		cursor: pointer;
		font-weight: 600;
		transition: background 0.1s;
		min-width: 60px;
	}

	.score-cell:hover {
		background: var(--hover);
	}

	.total-cell {
		font-weight: 700;
		font-size: 15px;
	}

	.inline-edit {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.inline-edit input {
		width: 60px;
		padding: 4px 6px;
		border: 2px solid var(--accent);
		border-radius: 4px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		text-align: center;
	}

	.inline-edit-actions {
		display: flex;
		gap: 2px;
	}

	.save-error {
		font-size: 11px;
		color: #e74c3c;
		margin-left: 4px;
	}

	.empty {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}

	.error-toast {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: #e74c3c;
		color: white;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0,0,0,0.2);
	}
</style>
