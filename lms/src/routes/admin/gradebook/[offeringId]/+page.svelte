<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let offeringId = $state('');
	let offering: any = $state(null);
	let enrollments: any[] = $state([]);
	let assessments: any[] = $state([]);
	let assignments: any[] = $state([]);
	let assessmentSubmissions: any[] = $state([]);
	let assignmentSubmissions: any[] = $state([]);
	let studentGrades: Record<string, any> = $state({});
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');

	// Inline grade editing
	let editingCell: { userId: string; itemId: string; type: 'assessment' | 'assignment' } | null = $state(null);
	let editValue = $state('');
	let savingGrade = $state(false);
	let gradeError = $state('');

	// Weight config
	let weightConfig: Record<string, number> = $state({});
	let weightConfigStr = $state('');
	let recalculating = $state(false);
	let recalculateResult: any = $state(null);

	// Expanded student rows
	let expandedStudents: Set<string> = $state(new Set());

	// Assessment types detected
	let assessmentTypes: string[] = $state([]);
	let hasAssignments = $state(false);

	$effect(() => {
		if (browser) {
			offeringId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		if (!offeringId) { setTimeout(() => loadData(), 100); return; }
		loading = true;
		error = '';
		recalculateResult = null;
		try {
			const res = await fetch(`/api/admin/gradebook/${offeringId}`);
			const json = await res.json();
			if (!json.success) { error = json.error || 'Failed'; return; }
			const d = json.data;
			offering = d.offering;
			enrollments = d.enrollments || [];
			assessments = d.assessments || [];
			assignments = d.assignments || [];
			assessmentSubmissions = d.assessmentSubmissions || [];
			assignmentSubmissions = d.assignmentSubmissions || [];
			studentGrades = d.studentGrades || {};

			// Init weight config from offering
			assessmentTypes = (d.assessments || []).reduce((acc: string[], a: any) => {
				if (!acc.includes(a.type)) acc.push(a.type);
				return acc;
			}, [] as string[]);
			hasAssignments = (d.assignments || []).length > 0;

			if (d.offering?.grade_weight_config) {
				try {
					const parsed = JSON.parse(d.offering.grade_weight_config);
					weightConfig = parsed;
					weightConfigStr = JSON.stringify(parsed, null, 2);
				} catch {
					weightConfig = {};
					weightConfigStr = '{}';
				}
			} else {
				// Default equal weights
				const cats: string[] = [...assessmentTypes];
				if (hasAssignments) cats.push('assignment');
				if (cats.length > 0) {
					const eq = Math.round(100 / cats.length);
					const cfg: Record<string, number> = {};
					for (const c of cats) cfg[c] = eq;
					const total = Object.values(cfg).reduce((s, v) => s + v, 0);
					if (total < 100 && cats.length > 0) cfg[cats[0]] += 100 - total;
					weightConfig = cfg;
					weightConfigStr = JSON.stringify(cfg, null, 2);
				} else {
					weightConfig = {};
					weightConfigStr = '{}';
				}
			}
		} catch { error = 'Network error'; }
		finally { loading = false; }
	}

	function weightCategories(): string[] {
		return Object.keys(weightConfig);
	}

	function totalWeight(): number {
		return Object.values(weightConfig).reduce((s, v) => s + v, 0);
	}

	function weightColor(pct: number): string {
		if (pct >= 80) return '#2ecc71';
		if (pct >= 60) return '#f1c40f';
		return '#e74c3c';
	}

	async function saveWeightConfig() {
		try {
			const parsed = JSON.parse(weightConfigStr);
			weightConfig = parsed;
			const res = await fetch(`/api/admin/gradebook/${offeringId}/weight-config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ grade_weight_config: JSON.stringify(parsed) }),
			});
			const json = await res.json();
			if (!json.success) {
				gradeError = json.error || 'Failed to save weight config';
			}
			recalculateResult = null;
		} catch {
			gradeError = 'Invalid JSON in weight config';
		}
	}

	async function recalculateGrades() {
		recalculating = true;
		recalculateResult = null;
		gradeError = '';
		try {
			// Save weight config first
			await saveWeightConfig();
			const res = await fetch(`/api/admin/gradebook/${offeringId}/recalculate`, { method: 'POST' });
			const json = await res.json();
			if (json.success) {
				recalculateResult = json.data;
				await loadData(); // refresh
			} else {
				gradeError = json.error || 'Recalculation failed';
			}
		} catch {
			gradeError = 'Network error during recalculation';
		}
		finally { recalculating = false; }
	}

	/** All graded items (assessments + assignments) as a single array */
	function getGradedItems(): { id: string; title: string; type: 'assessment' | 'assignment'; maxScore: number }[] {
		const items: { id: string; title: string; type: 'assessment' | 'assignment'; maxScore: number }[] = [];
		for (const a of assessments) items.push({ id: a.id, title: a.title, type: 'assessment' as const, maxScore: a.max_score ?? 100 });
		for (const a of assignments) items.push({ id: a.id, title: a.title, type: 'assignment' as const, maxScore: a.max_score ?? 100 });
		return items;
	}

	/** Get submission for a student + item combo */
	function getSubmission(userId: string, itemId: string, type: 'assessment' | 'assignment'): any | null {
		if (type === 'assessment') {
			return assessmentSubmissions.find(s => s.user_id === userId && s.assessment_id === itemId) || null;
		}
		return assignmentSubmissions.find(s => s.user_id === userId && s.assignment_id === itemId) || null;
	}

	/** Get the display score for a cell */
	function getScore(userId: string, itemId: string, type: 'assessment' | 'assignment'): { score: number | null; max: number } {
		const sub = getSubmission(userId, itemId, type);
		if (sub && sub.score != null) return { score: sub.score, max: sub.max_score ?? (type === 'assessment' ? 100 : 100) };
		return { score: null, max: type === 'assessment' ? 100 : 100 };
	}

	function getStudentGrade(userId: string): any {
		return studentGrades[userId] || null;
	}

	function gradeColor(pct: number | null): string {
		if (pct === null) return 'var(--text-secondary)';
		if (pct >= 85) return '#2ecc71';
		if (pct >= 70) return '#27ae60';
		if (pct >= 55) return '#f1c40f';
		if (pct >= 45) return '#e67e22';
		return '#e74c3c';
	}

	function letterGradeColor(letter: string | null): string {
		if (!letter) return 'var(--text-secondary)';
		if (letter === 'A' || letter === 'AB') return '#2ecc71';
		if (letter === 'B' || letter === 'BC') return '#27ae60';
		if (letter === 'C') return '#f1c40f';
		if (letter === 'D') return '#e67e22';
		return '#e74c3c';
	}

	function filteredEnrollments(): any[] {
		if (!searchQuery) return enrollments;
		const q = searchQuery.toLowerCase();
		return enrollments.filter(e =>
			(e.display_name || '').toLowerCase().includes(q) ||
			(e.email || '').toLowerCase().includes(q) ||
			(e.username || '').toLowerCase().includes(q)
		);
	}

	function formatDate(d: string | null): string {
		if (!d) return '-';
		try { return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d; }
	}

	function displayName(e: any): string {
		return e.display_name || e.username || e.email || 'Unknown';
	}

	// ── Inline grading ──

	function startEdit(userId: string, itemId: string, type: 'assessment' | 'assignment') {
		const sub = getSubmission(userId, itemId, type);
		editValue = sub?.score != null ? String(sub.score) : '';
		editingCell = { userId, itemId, type };
		gradeError = '';
	}

	function cancelEdit() {
		editingCell = null;
		editValue = '';
		gradeError = '';
	}

	async function saveInlineGrade() {
		if (!editingCell) return;
		savingGrade = true;
		gradeError = '';
		const score = parseFloat(editValue);
		if (isNaN(score) || score < 0) {
			gradeError = 'Nilai tidak valid';
			savingGrade = false;
			return;
		}

		const sub = getSubmission(editingCell.userId, editingCell.itemId, editingCell.type);
		const endpoint = editingCell.type === 'assessment'
			? `/api/admin/assessment-submissions/${sub?.id || '__new__'}`
			: `/api/admin/assignment-submissions/${sub?.id || '__new__'}`;

		try {
			const method = sub?.id ? 'PUT' : 'POST';
			const body: any = {
				score,
				status: 'graded',
				graded_by: localStorage.getItem('lms-user-id') || null,
				graded_at: new Date().toISOString(),
			};
			if (editingCell.type === 'assessment') {
				body.assessment_id = editingCell.itemId;
				body.user_id = editingCell.userId;
			} else {
				body.assignment_id = editingCell.itemId;
				body.user_id = editingCell.userId;
			}

			const res = await fetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				await loadData(); // refresh
				cancelEdit();
			} else {
				gradeError = json.error || 'Gagal menyimpan';
			}
		} catch { gradeError = 'Network error'; }
		finally { savingGrade = false; }
	}

	// ── Expandable rows ──

	function toggleExpand(userId: string) {
		if (expandedStudents.has(userId)) {
			expandedStudents.delete(userId);
		} else {
			expandedStudents.add(userId);
		}
		expandedStudents = new Set(expandedStudents); // trigger reactivity
	}

	function getCategoryScores(userId: string): { category: string; avg: number; weight: number; weighted: number }[] {
		const result: { category: string; avg: number; weight: number; weighted: number }[] = [];
		const userAssessSubs = assessmentSubmissions.filter((s: any) => s.user_id === userId && s.score != null);
		const userAssignSubs = assignmentSubmissions.filter((s: any) => s.user_id === userId && s.score != null);

		for (const [category, weightPct] of Object.entries(weightConfig)) {
			const weight = weightPct as number;

			if (category === 'assignment') {
				const valid = userAssignSubs.filter((s: any) => s.max_score != null && s.max_score > 0);
				if (valid.length > 0) {
					const avgPct = valid.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / valid.length;
					result.push({
						category,
						avg: Math.round(avgPct * 1000) / 10,
						weight,
						weighted: Math.round(avgPct * weight * 10) / 10,
					});
				}
			} else {
				const valid = userAssessSubs.filter((s: any) => {
					// Match assessment type - find the assessment
					const a = assessments.find((a: any) => a.id === s.assessment_id);
					return a && a.type === category && s.max_score != null && s.max_score > 0;
				});
				if (valid.length > 0) {
					const avgPct = valid.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / valid.length;
					result.push({
						category,
						avg: Math.round(avgPct * 1000) / 10,
						weight,
						weighted: Math.round(avgPct * weight * 10) / 10,
					});
				}
			}
		}
		return result;
	}

	// ── CSV Export ──

	function exportCSV() {
		const items = getGradedItems();
		if (items.length === 0) return;

		let csv = 'Nama,Email,Username';
		for (const item of items) {
			csv += `,"${item.title} (${item.maxScore})"`;
		}
		csv += ',Total Score,Total Max,Percentage,Letter Grade\n';

		for (const e of enrollments) {
			const row: string[] = [
				`"${displayName(e)}"`,
				`"${e.email || ''}"`,
				`"${e.username || ''}"`,
			];
			let studentTotal = 0;
			let studentMax = 0;
			for (const item of items) {
				const sc = getScore(e.user_id, item.id, item.type);
				row.push(sc.score != null ? String(sc.score) : '');
				if (sc.score != null) { studentTotal += sc.score; studentMax += sc.max; }
				else studentMax += sc.max;
			}
			const pct = studentMax > 0 ? Math.round((studentTotal / studentMax) * 100) : 0;
			const grade = getStudentGrade(e.user_id);
			row.push(String(studentTotal), String(studentMax), `${pct}%`, grade?.letter_grade || '');
			csv += row.join(',') + '\n';
		}

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `gradebook-${offering?.code || offeringId}-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Gradebook — {offering?.name || 'Loading'} — RPL AI Curriculum</title>
</svelte:head>

<div class="gradebook-detail">
	{#if loading}
		<div class="loading">Memuat gradebook...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<!-- Header -->
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/admin/gradebook">← Gradebook</a>
				</div>
				<h1>{offering?.name}</h1>
				<p class="offering-meta">
					{#if offering?.code}<span>{offering.code}</span>{/if}
					<span>{enrollments.length} mahasiswa</span>
					<span>{assessments.length} assessment, {assignments.length} assignment</span>
					<span class="status-badge status--{offering?.status}">{offering?.status}</span>
				</p>
			</div>
			<div class="header-actions">
				<input
					type="text"
					class="search-input"
					placeholder="Cari mahasiswa..."
					bind:value={searchQuery}
				/>
				<button class="btn btn--csv" onclick={exportCSV} disabled={getGradedItems().length === 0}>
					⬇ CSV
				</button>
			</div>
		</div>

		<!-- Weight Config Section -->
		<div class="weight-config-section">
			<div class="weight-config-header">
				<h3>⚖️ Grade Weight Configuration</h3>
				<div class="weight-actions">
					<button
						class="btn btn--recalc"
						onclick={recalculateGrades}
						disabled={recalculating || weightCategories().length === 0}
					>
						{recalculating ? '⏳ Recalculating...' : '🔄 Recalculate All Grades'}
					</button>
				</div>
			</div>

			<div class="weight-config-body">
				<div class="weight-categories">
					{#each weightCategories() as cat}
						<div class="weight-category">
							<span class="cat-label">{cat}</span>
							<input
								type="number"
								class="weight-input"
								bind:value={weightConfig[cat]}
								min="0"
								max="100"
								onchange={() => saveWeightConfig()}
							/>
							<span class="cat-pct">%</span>
							<div class="weight-bar-container">
								<div
									class="weight-bar"
									style="width: {weightConfig[cat]}%; background: {weightColor(weightConfig[cat])}"
								></div>
							</div>
						</div>
					{/each}
				</div>
				<div class="weight-total">
					<span>Total: <strong>{totalWeight()}%</strong></span>
					{#if totalWeight() !== 100}
						<span class="weight-warning">⚠️ Should total 100%</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Recalculate Result Banner -->
		{#if recalculateResult}
			<div class="recalc-result">
				✅ Recalculated {recalculateResult.studentsRecalculated} students
				— Average: <strong>{recalculateResult.averageScore}%</strong>
				— Pass Rate: <strong>{recalculateResult.passRate}%</strong>
			</div>
		{/if}

		{@const items = getGradedItems()}
		{@const students = filteredEnrollments()}

		{#if items.length === 0}
			<div class="empty-state">Belum ada assessment atau assignment di offering ini.</div>
		{:else if students.length === 0}
			<div class="empty-state">Tidak ada mahasiswa yang cocok.</div>
		{:else}
			<div class="table-wrapper">
				<table class="gradebook-table">
					<thead>
						<tr>
							<th class="sticky-col name-col">Mahasiswa</th>
							{#each items as item}
								<th class="item-col" title="{item.title} (max: {item.maxScore})">
									<div class="item-header">
										<span class="item-type">{item.type === 'assessment' ? '📝' : '📋'}</span>
										<span class="item-title">{item.title}</span>
										<span class="item-max">/{item.maxScore}</span>
									</div>
								</th>
							{/each}
							<th class="total-col">Total</th>
							<th class="pct-col">%</th>
							<th class="grade-col">Grade</th>
						</tr>
					</thead>
					<tbody>
						{#each students as e}
							{@const grade = getStudentGrade(e.user_id)}
							{@const isExpanded = expandedStudents.has(e.user_id)}
							<tr class="student-row" class:row--expanded={isExpanded}>
								<td class="sticky-col name-col">
									<div class="student-info">
										<button
											class="expand-btn"
											onclick={() => toggleExpand(e.user_id)}
											title={isExpanded ? 'Sembunyikan rincian' : 'Lihat rincian nilai'}
										>
											{isExpanded ? '▼' : '▶'}
										</button>
										<span class="student-name">{displayName(e)}</span>
										<span class="student-email">{e.email || ''}</span>
									</div>
								</td>
								{#each items as item}
									{@const sc = getScore(e.user_id, item.id, item.type)}
									{@const isEditing = editingCell?.userId === e.user_id && editingCell?.itemId === item.id && editingCell?.type === item.type}
									<td
										class="score-cell"
										style="color: {sc.score != null ? gradeColor((sc.score / sc.max) * 100) : 'var(--text-secondary)'}"
										class:cell--editing={isEditing}
										class:cell--empty={sc.score === null}
										class:cell--scored={sc.score !== null}
									>
										{#if isEditing}
											<!-- svelte-ignore a11y_autofocus -->
											<input
												type="number"
												step="0.5"
												min="0"
												bind:value={editValue}
												class="inline-score-input"
												autofocus
												onkeydown={(ev) => {
													if (ev.key === 'Enter') saveInlineGrade();
													if (ev.key === 'Escape') cancelEdit();
												}}
												onblur={() => { if (!savingGrade) cancelEdit(); }}
											/>
										{:else}
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="score-value"
												onclick={() => startEdit(e.user_id, item.id, item.type)}
												title="Klik untuk edit nilai"
												role="button"
												tabindex="-1"
											>
												{sc.score != null ? sc.score : '-'}
											</span>
										{/if}
									</td>
								{/each}
								<td class="total-col">
									{#if grade && (grade.total_score > 0 || grade.total_max > 0)}
										<span class="total-score">{grade.total_score.toFixed(1)}</span>
										<span class="total-sep">/</span>
										<span class="total-max">{grade.total_max.toFixed(1)}</span>
									{:else}
										<span class="total-na">-</span>
									{/if}
								</td>
								<td class="pct-col" style="color: {grade?.percentage != null ? gradeColor(grade.percentage) : 'var(--text-secondary)'}">
									{#if grade?.percentage != null}
										{Math.round(grade.percentage)}%
									{:else if grade && grade.total_max > 0}
										{Math.round((grade.total_score / grade.total_max) * 100)}%
									{:else}
										-
									{/if}
								</td>
								<td class="grade-col" style="color: {letterGradeColor(grade?.letter_grade)}">
									{#if grade?.letter_grade}
										<span class="letter-grade-badge">{grade.letter_grade}</span>
									{:else}
										<span class="grade-na">-</span>
									{/if}
								</td>
							</tr>

							<!-- Expandable breakdown row -->
							{#if isExpanded}
								{@const breakdown = getCategoryScores(e.user_id)}
								<tr class="breakdown-row">
									<td colspan={items.length + 4}>
										<div class="breakdown-content">
											<div class="breakdown-title">Weighted Score Breakdown</div>
											{#if breakdown.length === 0}
												<div class="breakdown-empty">No graded items yet.</div>
											{:else}
												<div class="breakdown-grid">
													{#each breakdown as b}
														<div class="breakdown-item">
															<span class="bd-category">{b.category}</span>
															<div class="bd-bar-container">
																<div class="bd-bar" style="width: {Math.min(b.avg, 100)}%"></div>
															</div>
															<span class="bd-avg">{b.avg.toFixed(1)}% avg</span>
															<span class="bd-weight">× {b.weight}%</span>
															<span class="bd-result" style="color: {gradeColor(b.weighted)}">
																= {b.weighted.toFixed(1)}%
															</span>
														</div>
													{/each}
													<div class="breakdown-total">
														<span>Final:</span>
														<span class="bd-final" style="color: {gradeColor(grade?.percentage)}">
															{grade?.percentage != null ? Math.round(grade.percentage) : '-'}%
														</span>
														<span class="bd-final-grade" style="color: {letterGradeColor(grade?.letter_grade)}">
															{grade?.letter_grade || '-'}
														</span>
													</div>
												</div>
											{/if}
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Grade error toast -->
			{#if gradeError}
				<div class="grade-error-toast">{gradeError}</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.gradebook-detail {
		max-width: 1200px;
	}

	.loading, .error {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error { color: #e74c3c; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.breadcrumb {
		font-size: 13px;
		margin-bottom: 8px;
	}
	.breadcrumb a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 {
		margin: 0 0 4px;
		font-size: 24px;
	}
	.offering-meta {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0;
		display: flex;
		gap: 10px;
		align-items: center;
		flex-wrap: wrap;
	}
	.status--active { background: #2ecc7133; color: #2ecc71; }
	.status--draft { background: var(--bg-secondary); color: var(--text-secondary); }
	.status--archived { background: #95a5a633; color: #95a5a6; }
	.status--completed { background: #3498db33; color: #3498db; }
	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
	}

	.header-actions {
		flex-shrink: 0;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.search-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		width: 220px;
		font-family: inherit;
	}
	.search-input:focus {
		border-color: var(--accent);
		outline: none;
	}
	.btn {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}
	.btn:hover:not(:disabled) {
		border-color: var(--accent);
		background: var(--accent-dim);
		color: var(--accent);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Weight Config ── */
	.weight-config-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		margin-bottom: 20px;
	}
	.weight-config-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.weight-config-header h3 {
		margin: 0;
		font-size: 16px;
	}
	.weight-actions {
		display: flex;
		gap: 8px;
	}
	.btn--recalc {
		background: #2ecc7133;
		border-color: #2ecc71;
		color: #2ecc71;
	}
	.btn--recalc:hover:not(:disabled) {
		background: #2ecc7144;
	}
	.weight-config-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.weight-categories {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.weight-category {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--bg);
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--border);
		min-width: 200px;
		flex: 1;
	}
	.cat-label {
		font-weight: 600;
		font-size: 13px;
		min-width: 70px;
		text-transform: capitalize;
	}
	.weight-input {
		width: 60px;
		padding: 4px 6px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		font-family: inherit;
	}
	.weight-input:focus {
		border-color: var(--accent);
		outline: none;
	}
	.cat-pct {
		font-size: 13px;
		color: var(--text-secondary);
	}
	.weight-bar-container {
		flex: 1;
		height: 8px;
		background: var(--bg-secondary);
		border-radius: 4px;
		overflow: hidden;
		min-width: 60px;
	}
	.weight-bar {
		height: 100%;
		border-radius: 4px;
		transition: width 0.2s ease;
	}
	.weight-total {
		font-size: 13px;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.weight-warning {
		color: #e67e22;
		font-size: 12px;
	}

	/* ── Recalculate Result ── */
	.recalc-result {
		background: #2ecc7133;
		border: 1px solid #2ecc71;
		color: #2ecc71;
		padding: 10px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
		font-weight: 500;
	}

	.empty-state {
		padding: 40px 20px;
		text-align: center;
		color: var(--text-secondary);
		font-size: 14px;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		-webkit-overflow-scrolling: touch;
	}

	.gradebook-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		min-width: 600px;
	}

	.gradebook-table th {
		text-align: left;
		padding: 10px 8px;
		border-bottom: 2px solid var(--border);
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		background: var(--surface);
	}
	.gradebook-table th.item-col {
		min-width: 100px;
		max-width: 160px;
	}
	.item-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.item-type { font-size: 14px; }
	.item-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 120px;
	}
	.item-max {
		font-size: 10px;
		font-weight: 400;
		color: var(--text-secondary);
	}

	.gradebook-table td {
		padding: 8px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	.sticky-col {
		position: sticky;
		left: 0;
		background: var(--surface);
		z-index: 2;
	}
	.name-col {
		min-width: 180px;
		max-width: 220px;
	}
	.student-info {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.expand-btn {
		background: none;
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
		font-size: 10px;
		padding: 2px 4px;
		color: var(--text-secondary);
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.1s;
	}
	.expand-btn:hover {
		background: var(--hover);
		border-color: var(--accent);
	}
	.student-name {
		font-weight: 600;
		font-size: 13px;
	}
	.student-email {
		font-size: 11px;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.score-cell {
		text-align: center;
		font-weight: 600;
		font-size: 13px;
		position: relative;
		cursor: pointer;
		transition: background 0.1s ease;
		min-width: 64px;
	}
	.score-cell:hover:not(.cell--editing) {
		background: var(--hover);
	}
	.cell--empty {
		color: var(--text-secondary) !important;
		opacity: 0.5;
	}
	.cell--empty:hover {
		opacity: 1;
	}
	.score-value {
		display: inline-block;
		min-width: 32px;
		padding: 4px 6px;
		border-radius: 4px;
		cursor: pointer;
	}
	.score-value:hover {
		background: var(--bg-secondary);
	}

	.inline-score-input {
		width: 56px;
		padding: 4px 6px;
		border: 2px solid var(--accent);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
		text-align: center;
		font-family: inherit;
		outline: none;
	}

	.total-col {
		text-align: center;
		font-size: 12px;
		padding: 8px 10px;
		white-space: nowrap;
	}
	.total-score { font-weight: 700; }
	.total-sep { color: var(--text-secondary); margin: 0 2px; }
	.total-max { color: var(--text-secondary); }
	.total-na { color: var(--text-secondary); }

	.pct-col {
		text-align: center;
		font-weight: 700;
		font-size: 14px;
		padding: 8px 10px;
		min-width: 50px;
	}

	.grade-col {
		text-align: center;
		font-weight: 700;
		font-size: 14px;
		padding: 8px 10px;
		min-width: 48px;
	}
	.letter-grade-badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 700;
		background: var(--bg-secondary);
		border: 1px solid currentColor;
	}
	.grade-na {
		color: var(--text-secondary);
	}

	/* ── Expandable breakdown row ── */
	.student-row.row--expanded {
		background: var(--bg-secondary);
	}
	.breakdown-row td {
		padding: 0;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}
	.breakdown-content {
		padding: 12px 20px 12px 56px;
	}
	.breakdown-title {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.breakdown-empty {
		font-size: 13px;
		color: var(--text-secondary);
		font-style: italic;
	}
	.breakdown-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}
	.bd-category {
		font-weight: 600;
		min-width: 80px;
		text-transform: capitalize;
	}
	.bd-bar-container {
		flex: 1;
		height: 6px;
		background: var(--bg);
		border-radius: 3px;
		overflow: hidden;
		min-width: 80px;
	}
	.bd-bar {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	.bd-avg {
		min-width: 60px;
		text-align: right;
		color: var(--text-secondary);
		font-size: 12px;
	}
	.bd-weight {
		color: var(--text-secondary);
		font-size: 12px;
		min-width: 50px;
	}
	.bd-result {
		font-weight: 700;
		min-width: 60px;
		text-align: right;
	}
	.breakdown-total {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-top: 6px;
		margin-top: 4px;
		border-top: 1px solid var(--border);
		font-size: 13px;
		font-weight: 600;
	}
	.bd-final {
		font-size: 15px;
		font-weight: 700;
	}
	.bd-final-grade {
		font-size: 15px;
		font-weight: 700;
	}

	.grade-error-toast {
		position: fixed;
		bottom: 24px;
		right: 24px;
		background: #e74c3c;
		color: #fff;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0,0,0,0.2);
		animation: fadeIn 0.2s ease;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-header { flex-direction: column; gap: 12px; }
		.header-actions { width: 100%; }
		.search-input { flex: 1; }
		.gradebook-table { font-size: 12px; }
		.name-col { min-width: 140px; }
		.student-email { display: none; }
		.item-title { max-width: 80px; }
		.weight-config-section { padding: 12px; }
		.weight-categories { flex-direction: column; }
	}
</style>
