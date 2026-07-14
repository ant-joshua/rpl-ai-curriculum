<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let offeringId = $state('');
	let course: any = $state(null);
	let enrollments: any[] = $state([]);
	let assignments: any[] = $state([]);
	let submissions: any[] = $state([]);
	let lessons: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let activeTab = $state<'overview' | 'assignments' | 'roster'>('overview');
	let searchQuery = $state('');

	// Grade modal
	let showGradeModal = $state(false);
	let gradingSub: any = $state(null);
	let gradeScore = $state('');
	let gradeFeedback = $state('');
	let savingGrade = $state(false);
	let gradeError = $state('');

	// Enrollment actions
	let savingEnrollment = $state(false);
	let enrollmentActionMsg = $state('');

	$effect(() => {
		if (browser) {
			offeringId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadCourseDetail();
	});

	async function loadCourseDetail() {
		if (!offeringId) { setTimeout(() => loadCourseDetail(), 100); return; }
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}`);
			const json = await res.json();
			if (json.success) {
				const d = json.data;
				course = d.offering;
				enrollments = d.enrollments || [];
				assignments = d.assignments || [];
				submissions = d.submissions || [];
				lessons = d.lessons || [];
			} else {
				error = json.error || 'Failed to load';
			}
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	function statusClass(s: string): string {
		const m: Record<string, string> = { active: 'status--active', draft: 'status--draft', archived: 'status--archived', completed: 'status--completed' };
		return m[s] || 'status--draft';
	}

	function subStatusClass(s: string): string {
		const m: Record<string, string> = { graded: 'bg--graded', submitted: 'bg--submitted', returned: 'bg--returned', draft: 'bg--draft' };
		return m[s] || 'bg--draft';
	}

	function enrollmentStatusClass(s: string): string {
		const m: Record<string, string> = { active: 'status--active', dropped: 'status--archived', completed: 'status--completed', pending: 'status--draft' };
		return m[s] || 'status--draft';
	}

	function formatDate(d: string | null): string {
		if (!d) return '-';
		try { return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
		catch { return d; }
	}

	// Filter submissions by assignment
	function subsForAssignment(assignmentId: string): any[] {
		return submissions.filter(s => s.assignment_id === assignmentId);
	}

	function submissionCount(assignmentId: string): number {
		return submissions.filter(s => s.assignment_id === assignmentId).length;
	}

	function gradedCount(assignmentId: string): number {
		return submissions.filter(s => s.assignment_id === assignmentId && s.status === 'graded').length;
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

	// Grade modal
	function openGradeModal(sub: any, maxScore: number) {
		gradingSub = sub;
		gradeScore = sub.score != null ? String(sub.score) : '';
		gradeFeedback = sub.feedback || '';
		gradeError = '';
		showGradeModal = true;
	}

	function closeGradeModal() {
		showGradeModal = false;
		gradingSub = null;
	}

	async function saveGrade() {
		if (!gradingSub) return;
		savingGrade = true;
		gradeError = '';
		const score = parseFloat(gradeScore);
		if (isNaN(score) || score < 0) {
			gradeError = 'Invalid score';
			savingGrade = false;
			return;
		}
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}/submissions/${gradingSub.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ score, feedback: gradeFeedback, status: 'graded' }),
			});
			const json = await res.json();
			if (json.success) {
				loadCourseDetail();
				closeGradeModal();
			} else {
				gradeError = json.error || 'Failed to save';
			}
		} catch {
			gradeError = 'Network error';
		} finally {
			savingGrade = false;
		}
	}

	// Enrollment actions
	async function dropStudent(enrollmentId: string) {
		if (!confirm('Remove this student from the course?')) return;
		savingEnrollment = true;
		enrollmentActionMsg = '';
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}/enrollments/${enrollmentId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'dropped' }),
			});
			const json = await res.json();
			if (json.success) {
				loadCourseDetail();
				enrollmentActionMsg = 'Student removed';
			} else {
				enrollmentActionMsg = json.error || 'Failed';
			}
		} catch {
			enrollmentActionMsg = 'Network error';
		} finally {
			savingEnrollment = false;
		}
	}

	async function unenrollStudent(enrollmentId: string) {
		if (!confirm('Permanently delete this enrollment?')) return;
		savingEnrollment = true;
		enrollmentActionMsg = '';
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}/enrollments/${enrollmentId}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (json.success) {
				loadCourseDetail();
				enrollmentActionMsg = 'Enrollment deleted';
			} else {
				enrollmentActionMsg = json.error || 'Failed';
			}
		} catch {
			enrollmentActionMsg = 'Network error';
		} finally {
			savingEnrollment = false;
		}
	}

	function fileCount(urls: string | null): number {
		if (!urls) return 0;
		try { return JSON.parse(urls).length; } catch { return 0; }
	}

	function isLate(sub: any, dueDate: string | null): boolean {
		if (!dueDate || !sub.submitted_at) return false;
		return new Date(sub.submitted_at) > new Date(dueDate + 'Z');
	}
</script>

<svelte:head>
	<title>{course?.name || 'Course'} — Instructor — RPL AI Curriculum</title>
</svelte:head>

{#if loading}
	<div class="loading">Loading course data...</div>
{:else if error}
	<div class="error-state">
		<p class="error-msg">{error}</p>
		<button class="btn" onclick={loadCourseDetail}>Retry</button>
	</div>
{:else if course}
	<div class="course-page">
		<!-- Breadcrumb + Header -->
		<div class="breadcrumb">
			<a href="/admin/instructor">← Instructor Dashboard</a>
		</div>

		<div class="page-header">
			<div class="header-left">
				<h1>{course?.name}</h1>
				<div class="header-meta">
					<span class="meta-label">{course.course_title || ''}</span>
					{#if course.code}<span class="meta-label meta-code">{course.code}</span>{/if}
					<span class="status-badge {statusClass(course.status)}">{course.status}</span>
				</div>
			</div>
			<div class="header-right">
				<button class="btn btn--refresh" onclick={loadCourseDetail}>🔄 Refresh</button>
			</div>
		</div>

		<!-- Stats -->
		<div class="quick-stats">
			<div class="qs-item"><strong>{enrollments.filter(e => e.status === 'active').length}</strong> Active Students</div>
			<div class="qs-item"><strong>{assignments.length}</strong> Assignments</div>
			<div class="qs-item"><strong>{lessons.length}</strong> Lessons</div>
			<div class="qs-item"><strong>{submissions.filter(s => s.status !== 'graded').length}</strong> Ungraded</div>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button class="tab" class:tab--active={activeTab === 'overview'} onclick={() => activeTab = 'overview'}>📋 Overview</button>
			<button class="tab" class:tab--active={activeTab === 'assignments'} onclick={() => activeTab = 'assignments'}>📝 Assignments & Grading</button>
			<button class="tab" class:tab--active={activeTab === 'roster'} onclick={() => activeTab = 'roster'}>👥 Roster</button>
		</div>

		<!-- Tab: Overview -->
		{#if activeTab === 'overview'}
			<div class="tab-content">
				<div class="info-grid">
					<div class="info-card">
						<h3>Course Details</h3>
						<div class="info-row"><span>Course</span><span>{course.course_title}</span></div>
						<div class="info-row"><span>Code</span><span>{course.code || '-'}</span></div>
						<div class="info-row"><span>Status</span><span class="status-badge {statusClass(course.status)}">{course.status}</span></div>
						<div class="info-row"><span>Start Date</span><span>{course.start_date ? formatDate(course.start_date) : '-'}</span></div>
						<div class="info-row"><span>End Date</span><span>{course.end_date ? formatDate(course.end_date) : '-'}</span></div>
					</div>
					<div class="info-card">
						<h3>Enrollment</h3>
						<div class="info-row"><span>Active</span><span>{enrollments.filter(e => e.status === 'active').length}</span></div>
						<div class="info-row"><span>Completed</span><span>{enrollments.filter(e => e.status === 'completed').length}</span></div>
						<div class="info-row"><span>Dropped</span><span>{enrollments.filter(e => e.status === 'dropped').length}</span></div>
						<div class="info-row"><span>Max Students</span><span>{course.max_students || 'Unlimited'}</span></div>
					</div>
				</div>

				<!-- Lessons list -->
				{#if lessons.length > 0}
					<div class="section-card">
						<h3>Lessons ({lessons.length})</h3>
						<div class="lesson-list">
							{#each lessons as l, i}
								<div class="lesson-row">
									<span class="lesson-order">{i + 1}.</span>
									<span class="lesson-title">{l.title}</span>
									<span class="status-badge {statusClass(l.status)}">{l.status}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Tab: Assignments & Grading -->
		{#if activeTab === 'assignments'}
			<div class="tab-content">
				{#if assignments.length === 0}
					<div class="empty-state">No assignments yet for this course.</div>
				{:else}
					<div class="assignments-list">
						{#each assignments as a}
							{@const subs = subsForAssignment(a.id)}
							<div class="assignment-card">
								<div class="assignment-header">
									<div class="ah-left">
										<h3>{a.title}</h3>
										<div class="ah-meta">
											<span>📊 {a.max_score} pts</span>
											<span>📁 {a.submission_type}</span>
											{#if a.due_date}<span>📅 {formatDate(a.due_date)}</span>{/if}
										</div>
									</div>
									<div class="ah-right">
										<span class="grade-progress">{gradedCount(a.id)}/{submissionCount(a.id)} graded</span>
									</div>
								</div>

								{#if subs.length === 0}
									<div class="no-subs">No submissions yet.</div>
								{:else}
									<div class="table-wrap">
										<table class="subs-table">
											<thead>
												<tr>
													<th>Student</th>
													<th>Status</th>
													<th>Submitted</th>
													<th>Score</th>
													<th>Feedback</th>
													<th>Action</th>
												</tr>
											</thead>
											<tbody>
												{#each subs as sub}
													<tr class:row--late={isLate(sub, a.due_date)}>
														<td class="student-name">{sub.user_name || '-'}</td>
														<td>
															<span class="mini-badge {subStatusClass(sub.status)}">{sub.status}</span>
															{#if isLate(sub, a.due_date)}
																<span class="late-tag">LATE</span>
															{/if}
														</td>
														<td class="date-cell">{formatDate(sub.submitted_at)}</td>
														<td class="score-cell">
															{#if sub.score != null}
																{sub.score}<span class="max-score">/{a.max_score}</span>
															{:else}
																<span class="score-na">-</span>
															{/if}
														</td>
														<td class="feedback-cell">{sub.feedback ? sub.feedback.slice(0, 30) + (sub.feedback.length > 30 ? '…' : '') : '-'}</td>
														<td class="action-cell">
															<button class="btn btn--small" onclick={() => openGradeModal(sub, a.max_score)}>
																{sub.score != null ? 'Edit' : 'Grade'}
															</button>
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Tab: Roster -->
		{#if activeTab === 'roster'}
			<div class="tab-content">
				<div class="roster-toolbar">
					<input
						type="text"
						class="search-input"
						placeholder="Search students..."
						bind:value={searchQuery}
					/>
					<span class="roster-count">{enrollments.length} enrolled</span>
				</div>

				{#if enrollmentActionMsg}
					<div class="action-msg">{enrollmentActionMsg}</div>
				{/if}

				{#if enrollments.length === 0}
					<div class="empty-state">No students enrolled yet.</div>
				{:else}
					{@const filtered = filteredEnrollments()}
					{#if filtered.length === 0}
						<div class="empty-state">No students match your search.</div>
					{:else}
						<div class="table-wrap">
							<table class="roster-table">
								<thead>
									<tr>
										<th>Name</th>
										<th>Email</th>
										<th>Status</th>
										<th>Enrolled</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each filtered as e}
										<tr>
											<td class="student-name">
												{e.display_name || e.username || '-'}
											</td>
											<td>{e.email || '-'}</td>
											<td>
												<span class="mini-badge {enrollmentStatusClass(e.status)}">{e.status}</span>
											</td>
											<td class="date-cell">{formatDate(e.enrolled_at)}</td>
											<td class="action-cell">
												{#if e.status === 'active'}
													<button class="btn btn--small btn--warn" onclick={() => dropStudent(e.id)} disabled={savingEnrollment}>
														Drop
													</button>
												{/if}
												<button class="btn btn--small btn--danger" onclick={() => unenrollStudent(e.id)} disabled={savingEnrollment}>
													Remove
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{/if}

<!-- Grade Modal -->
{#if showGradeModal && gradingSub}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeGradeModal} role="dialog" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="modal-header">
				<h2>Grade Submission</h2>
				<button class="modal-close" onclick={closeGradeModal}>✕</button>
			</div>

			<div class="modal-body">
				<div class="modal-student">
					<strong>{gradingSub.user_name || 'Unknown'}</strong>
				</div>

				{#if gradingSub.submission_text}
					<div class="modal-section">
						<label>Submission Text</label>
						<pre class="modal-text">{gradingSub.submission_text}</pre>
					</div>
				{/if}

				{#if gradingSub.file_urls}
					{@const urls = JSON.parse(gradingSub.file_urls) as string[]}
					{#if urls.length > 0}
						<div class="modal-section">
							<label>Files ({urls.length})</label>
							<div class="modal-files">
								{#each urls as url}
									<a href={url} target="_blank" class="file-link" rel="noreferrer">📎 {url.split('/').pop()}</a>
								{/each}
							</div>
						</div>
					{/if}
				{/if}

				<div class="modal-section">
					<label for="grade-score">Score</label>
					<input id="grade-score" type="number" step="0.5" min="0" bind:value={gradeScore} class="score-input" />
				</div>

				<div class="modal-section">
					<label for="grade-feedback">Feedback (optional)</label>
					<textarea id="grade-feedback" bind:value={gradeFeedback} rows="4" placeholder="Comments for the student..." class="feedback-input"></textarea>
				</div>

				{#if gradeError}
					<div class="grade-error">{gradeError}</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn" onclick={closeGradeModal}>Cancel</button>
				<button class="btn btn--primary" onclick={saveGrade} disabled={savingGrade}>
					{savingGrade ? 'Saving...' : 'Save Grade'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.loading, .error-state, .empty-state {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error-msg { color: #e74c3c; margin-bottom: 12px; }

	.course-page { max-width: 1100px; }

	.breadcrumb { font-size: 13px; margin-bottom: 12px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
		gap: 16px;
	}
	.page-header h1 { margin: 0 0 4px; font-size: 24px; }
	.header-meta { display: flex; gap: 10px; align-items: center; font-size: 13px; flex-wrap: wrap; }
	.meta-label { color: var(--text-secondary); }
	.meta-code { font-family: monospace; }

	.status-badge {
		font-size: 11px;
		padding: 2px 10px;
		border-radius: 20px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.status--active { background: #2ecc7133; color: #2ecc71; }
	.status--draft { background: var(--bg-secondary); color: var(--text-secondary); }
	.status--archived { background: #95a5a633; color: #95a5a6; }
	.status--completed { background: #3498db33; color: #3498db; }
	.mini-badge {
		font-size: 11px;
		padding: 1px 8px;
		border-radius: 10px;
		font-weight: 500;
	}
	.bg--graded { background: #2ecc7133; color: #2ecc71; }
	.bg--submitted { background: #3498db33; color: #3498db; }
	.bg--returned { background: #f39c1233; color: #f39c12; }
	.bg--draft { background: var(--bg-secondary); color: var(--text-secondary); }

	.quick-stats {
		display: flex;
		gap: 20px;
		padding: 14px 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		margin-bottom: 20px;
		font-size: 13px;
		flex-wrap: wrap;
	}
	.qs-item strong { font-size: 18px; color: var(--accent); margin-right: 4px; }

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid var(--border);
		margin-bottom: 20px;
	}
	.tab {
		padding: 10px 18px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: color 0.15s, border-color 0.15s;
	}
	.tab:hover { color: var(--text); }
	.tab--active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.tab-content { min-height: 300px; }

	/* Overview tab */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}
	.info-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
	}
	.info-card h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 6px 0;
		font-size: 13px;
		border-bottom: 1px solid var(--border);
	}
	.info-row:last-child { border-bottom: none; }
	.info-row span:first-child { color: var(--text-secondary); }

	.section-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 20px;
	}
	.section-card h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }

	.lesson-list { display: flex; flex-direction: column; gap: 4px; }
	.lesson-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.lesson-row:last-child { border-bottom: none; }
	.lesson-order { color: var(--text-secondary); min-width: 24px; }
	.lesson-title { flex: 1; }

	/* Assignments tab */
	.assignments-list { display: flex; flex-direction: column; gap: 16px; }
	.assignment-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
	}
	.assignment-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
		gap: 12px;
	}
	.ah-left h3 { margin: 0 0 6px; font-size: 16px; }
	.ah-meta { display: flex; gap: 14px; font-size: 12px; color: var(--text-secondary); }
	.grade-progress { font-size: 12px; font-weight: 600; color: var(--accent); white-space: nowrap; }
	.no-subs { padding: 20px; text-align: center; color: var(--text-secondary); font-size: 13px; }

	.table-wrap { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th {
		text-align: left;
		padding: 8px 10px;
		font-weight: 600;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	td { padding: 8px 10px; border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.row--late { background: rgba(231, 76, 60, 0.04); }
	.student-name { font-weight: 500; }
	.date-cell { white-space: nowrap; color: var(--text-secondary); font-size: 12px; }
	.score-cell { font-weight: 600; }
	.score-na { color: var(--text-secondary); }
	.max-score { color: var(--text-secondary); font-weight: 400; font-size: 12px; }
	.feedback-cell { color: var(--text-secondary); font-size: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.action-cell { white-space: nowrap; }
	.late-tag {
		margin-left: 4px;
		font-size: 9px;
		padding: 1px 5px;
		border-radius: 4px;
		background: #e74c3c33;
		color: #e74c3c;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	/* Roster tab */
	.roster-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		gap: 12px;
	}
	.search-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		width: 240px;
		font-family: inherit;
	}
	.search-input:focus { border-color: var(--accent); outline: none; }
	.roster-count { font-size: 13px; color: var(--text-secondary); }

	.action-msg {
		padding: 8px 12px;
		background: #2ecc7133;
		color: #2ecc71;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 12px;
	}

	.roster-table td { vertical-align: middle; }

	/* Buttons */
	.btn {
		display: inline-block;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: opacity 0.15s;
	}
	.btn:hover { opacity: 0.85; }
	.btn:disabled { opacity: 0.4; cursor: default; }
	.btn--small { padding: 4px 10px; font-size: 12px; }
	.btn--primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn--warn { background: #f39c1233; color: #f39c12; border-color: #f39c1244; }
	.btn--danger { background: #e74c3c33; color: #e74c3c; border-color: #e74c3c44; }
	.btn--refresh { padding: 6px 14px; font-size: 12px; }

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}
	.modal-content {
		background: var(--surface);
		border-radius: 12px;
		width: 100%;
		max-width: 540px;
		max-height: 80vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}
	.modal-header h2 { margin: 0; font-size: 18px; }
	.modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); padding: 0; }
	.modal-body { padding: 16px 20px; }
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 20px;
		border-top: 1px solid var(--border);
	}
	.modal-student { margin-bottom: 12px; font-size: 15px; }
	.modal-section { margin-bottom: 16px; }
	.modal-section label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
	.modal-text {
		background: var(--bg-secondary);
		padding: 10px;
		border-radius: 8px;
		font-size: 13px;
		white-space: pre-wrap;
		max-height: 200px;
		overflow-y: auto;
	}
	.modal-files { display: flex; flex-direction: column; gap: 4px; }
	.file-link { font-size: 13px; color: var(--accent); text-decoration: none; }
	.file-link:hover { text-decoration: underline; }
	.score-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 16px;
		width: 120px;
		font-family: inherit;
	}
	.feedback-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		width: 100%;
		font-family: inherit;
		box-sizing: border-box;
		resize: vertical;
	}
	.grade-error { color: #e74c3c; font-size: 13px; padding: 8px; background: #e74c3c15; border-radius: 8px; }

	@media (max-width: 768px) {
		.info-grid { grid-template-columns: 1fr; }
		.quick-stats { gap: 12px; }
	}
</style>
