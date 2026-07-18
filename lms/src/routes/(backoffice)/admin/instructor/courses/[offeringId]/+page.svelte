<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, Modal, Input, Textarea, EmptyState, Loading } from '$lib/components/ui';

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
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{course?.name || 'Course'} — Instructor — RPL AI Curriculum</title>
</svelte:head>

{#if loading}
	<Loading />
{:else if error}
	<EmptyState icon="⚠️" title="Error" description={error}>
		<Button onclick={loadCourseDetail}>{t('common.retry')}</Button>
	</EmptyState>
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
					<Badge variant={course.status === 'active' ? 'success' : course.status === 'completed' ? 'info' : course.status === 'archived' ? 'default' : 'warning'}>{course.status}</Badge>
				</div>
			</div>
			<div class="header-right">
				<Button variant="secondary" size="sm" onclick={loadCourseDetail}>🔄 Refresh</Button>
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
						<div class="info-row"><span>{t('common.status')}</span><Badge variant={course.status === 'active' ? 'success' : course.status === 'completed' ? 'info' : course.status === 'archived' ? 'default' : 'warning'}>{course.status}</Badge></div>
						<div class="info-row"><span>Start Date</span><span>{course.start_date ? formatDate(course.start_date) : '-'}</span></div>
						<div class="info-row"><span>End Date</span><span>{course.end_date ? formatDate(course.end_date) : '-'}</span></div>
					</div>
					<div class="info-card">
						<h3>Enrollment</h3>
						<div class="info-row"><span>Active</span><span>{enrollments.filter(e => e.status === 'active').length}</span></div>
						<div class="info-row"><span>{t('admin.completed')}</span><span>{enrollments.filter(e => e.status === 'completed').length}</span></div>
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
									<Badge variant={l.status === 'active' ? 'success' : l.status === 'completed' ? 'info' : l.status === 'archived' ? 'default' : 'warning'}>{l.status}</Badge>
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
					<EmptyState title="No Assignments" description="No assignments yet for this course." />
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
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Student</TableHead>
												<TableHead>{t('common.status')}</TableHead>
												<TableHead>Submitted</TableHead>
												<TableHead>Score</TableHead>
												<TableHead>Feedback</TableHead>
												<TableHead>Action</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{#each subs as sub}
												<TableRow class={isLate(sub, a.due_date) ? 'row--late' : ''}>
													<TableCell class="student-name">{sub.user_name || '-'}</TableCell>
													<TableCell>
														<Badge variant={sub.status === 'graded' ? 'success' : sub.status === 'submitted' ? 'info' : sub.status === 'returned' ? 'warning' : 'default'}>{sub.status}</Badge>
														{#if isLate(sub, a.due_date)}
															<span class="late-tag">LATE</span>
														{/if}
													</TableCell>
													<TableCell class="date-cell">{formatDate(sub.submitted_at)}</TableCell>
													<TableCell class="score-cell">
														{#if sub.score != null}
															{sub.score}<span class="max-score">/{a.max_score}</span>
														{:else}
															<span class="score-na">-</span>
														{/if}
													</TableCell>
													<TableCell class="feedback-cell">{sub.feedback ? sub.feedback.slice(0, 30) + (sub.feedback.length > 30 ? '…' : '') : '-'}</TableCell>
													<TableCell class="action-cell">
														<Button size="sm" onclick={() => openGradeModal(sub, a.max_score)}>
															{sub.score != null ? 'Edit' : 'Grade'}
														</Button>
													</TableCell>
												</TableRow>
											{/each}
										</TableBody>
									</Table>
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
					<Input type="text" placeholder="Search students..." bind:value={searchQuery} />
					<span class="roster-count">{enrollments.length} enrolled</span>
				</div>

				{#if enrollmentActionMsg}
					<div class="action-msg">{enrollmentActionMsg}</div>
				{/if}

				{#if enrollments.length === 0}
					<EmptyState title="No Students" description="No students enrolled yet." />
				{:else}
					{@const filtered = filteredEnrollments()}
					{#if filtered.length === 0}
						<EmptyState title="No Results" description="No students match your search." />
					{:else}
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>{t('common.status')}</TableHead>
									<TableHead>Enrolled</TableHead>
									<TableHead>{t('common.action')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each filtered as e}
									<TableRow>
										<TableCell class="student-name">
											{e.display_name || e.username || '-'}
										</TableCell>
										<TableCell>{e.email || '-'}</TableCell>
										<TableCell>
											<Badge variant={e.status === 'active' ? 'success' : e.status === 'completed' ? 'info' : e.status === 'dropped' ? 'default' : 'warning'}>{e.status}</Badge>
										</TableCell>
										<TableCell class="date-cell">{formatDate(e.enrolled_at)}</TableCell>
										<TableCell class="action-cell">
											{#if e.status === 'active'}
												<Button size="sm" variant="outline" onclick={() => dropStudent(e.id)} disabled={savingEnrollment}>
													Drop
												</Button>
											{/if}
											<Button size="sm" variant="danger" onclick={() => unenrollStudent(e.id)} disabled={savingEnrollment}>
												Remove
											</Button>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{/if}

<!-- Grade Modal -->
{#if showGradeModal && gradingSub}
	<Modal open={showGradeModal} title="Grade Submission" onclose={closeGradeModal}>
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
			<Input id="grade-score" type="number" step="0.5" min="0" bind:value={gradeScore} />
		</div>

		<div class="modal-section">
			<label for="grade-feedback">Feedback (optional)</label>
			<Textarea id="grade-feedback" bind:value={gradeFeedback} rows={4} placeholder="Comments for the student..." />
		</div>

		{#if gradeError}
			<div class="grade-error">{gradeError}</div>
		{/if}

		{#snippet footer()}
			<Button variant="secondary" onclick={closeGradeModal}>{t('common.cancel')}</Button>
			<Button onclick={saveGrade} disabled={savingGrade}>
				{savingGrade ? 'Saving...' : 'Save Grade'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<style>
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
		background: #ef444433;
		color: #ef4444;
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
	.roster-count { font-size: 13px; color: var(--text-secondary); }

	.action-msg {
		padding: 8px 12px;
		background: #22c55e33;
		color: #22c55e;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 12px;
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
	.grade-error { color: #ef4444; font-size: 13px; padding: 8px; background: #ef444415; border-radius: 8px; }

	@media (max-width: 768px) {
		.info-grid { grid-template-columns: 1fr; }
		.quick-stats { gap: 12px; }
	}
</style>
