<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Skeleton } from '$lib/components/ui/index.js';

	let loading = $state(true);
	let userName = $state('Student');
	let today = $state('');

	// Stats
	let enrolledCount = $state(0);
	let completedCount = $state(0);
	let studyHours = $state(0);
	let certificateCount = $state(0);

	// Sections
	let activeCourses = $state<any[]>([]);
	let upcomingDeadlines = $state<any[]>([]);
	let recentGrades = $state<any[]>([]);

	onMount(() => {
		if (!browser) return;
		today = new Date().toLocaleDateString('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		try {
			// Parallel fetch: dashboard + grades + certificates
			const [dashRes, gradesRes, certsRes] = await Promise.all([
				fetch('/api/my/dashboard'),
				fetch('/api/my/grades'),
				fetch('/api/my/certificates')
			]);

			// Dashboard data
			if (dashRes.ok) {
				const dash = await dashRes.json();
				if (dash.success && dash.data) {
					const d = dash.data;
					userName = d.userName || 'Student';
					activeCourses = (d.activeCourses || []).filter((c: any) => c.progress < 100);
					enrolledCount = (d.activeCourses || []).length;
					completedCount = (d.activeCourses || []).filter((c: any) => c.progress >= 100).length;
					studyHours = d.currentStreak ? Math.round(d.currentStreak * 0.5 * 10) / 10 : 0;
					upcomingDeadlines = (d.upcomingDeadlines || []).slice(0, 5);
				}
			}

			// Grades data
			if (gradesRes.ok) {
				const grades = await gradesRes.json();
				if (grades.success && grades.data) {
					const flat: any[] = [];
					for (const entry of grades.data) {
						for (const sub of [...(entry.assessments || []), ...(entry.assignments || [])]) {
							if (sub.score != null) {
								flat.push({
									title: sub.title || sub.name || 'Unknown',
									offeringName: entry.offering_name || '',
									score: sub.score,
									maxScore: sub.max_score || sub.maxScore || 100,
									type: sub.type || 'assessment'
								});
							}
						}
					}
					recentGrades = flat.slice(0, 5);
				}
			}

			// Certificates data
			if (certsRes.ok) {
				const certs = await certsRes.json();
				if (certs.success && certs.data) {
					certificateCount = (certs.data || []).length;
				}
			}
		} catch {
			// Ignore fetch errors — show empty dashboard
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Student Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="student-dash">
	<!-- Welcome Header -->
	<div class="welcome">
		<h1>Selamat datang, {userName}</h1>
		<p class="today-date">{today}</p>
	</div>

	{#if loading}
		<!-- Stats skeleton -->
		<div class="stats-row">
			{#each [1, 2, 3, 4] as _}
				<div class="stat-card">
					<Skeleton variant="block" count={2} />
				</div>
			{/each}
		</div>
		<div class="section">
			<Skeleton variant="block" count={1} />
		</div>
		<div class="section">
			<Skeleton variant="block" count={3} />
		</div>
	{:else}
		<!-- Stats Row -->
		<div class="stats-row">
			<div class="stat-card">
				<div class="stat-icon">📚</div>
				<div class="stat-info">
					<span class="stat-value">{enrolledCount}</span>
					<span class="stat-label">Enrolled Courses</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">✅</div>
				<div class="stat-info">
					<span class="stat-value">{completedCount}</span>
					<span class="stat-label">Completed</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">⏱️</div>
				<div class="stat-info">
					<span class="stat-value">{studyHours}</span>
					<span class="stat-label">Study Time (hours)</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">🏆</div>
				<div class="stat-info">
					<span class="stat-value">{certificateCount}</span>
					<span class="stat-label">Certificates</span>
				</div>
			</div>
		</div>

		<!-- Continue Learning -->
		<div class="section">
			<h2 class="section-title">Continue Learning</h2>
			{#if activeCourses.length === 0}
				<p class="empty-text">No courses in progress.</p>
			{:else}
				<div class="courses-list">
					{#each activeCourses as course}
						<a href="/learn/{course.offeringId}" class="course-row">
							<span class="course-icon">{course.courseIcon || '📚'}</span>
							<div class="course-info">
								<span class="course-title">{course.courseTitle}</span>
								<span class="course-meta">{course.completedLessons}/{course.totalLessons} lessons</span>
							</div>
							<div class="progress-wrap">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {course.progress}%"></div>
								</div>
								<span class="progress-pct">{course.progress}%</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Two column: Deadlines + Grades -->
		<div class="two-col">
			<!-- Upcoming Deadlines -->
			<div class="section">
				<h2 class="section-title">Upcoming Deadlines</h2>
				{#if upcomingDeadlines.length === 0}
					<p class="empty-text">No upcoming deadlines.</p>
				{:else}
					<div class="deadlines-list">
						{#each upcomingDeadlines as dl}
							<div class="deadline-row">
								<div class="deadline-info">
									<span class="deadline-title">{dl.title}</span>
									<span class="deadline-course">{dl.offering_name}</span>
								</div>
								<div class="deadline-right">
									<span class="deadline-kind">{dl.kind}</span>
									<span class="deadline-date">{formatDate(dl.due_date)}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Recent Grades -->
			<div class="section">
				<h2 class="section-title">Recent Grades</h2>
				{#if recentGrades.length === 0}
					<p class="empty-text">No grades yet.</p>
				{:else}
					<div class="grades-list">
						{#each recentGrades as g}
							<div class="grade-row">
								<div class="grade-info">
									<span class="grade-title">{g.title}</span>
									<span class="grade-course">{g.offeringName}</span>
								</div>
								<span class="grade-score">{g.score}/{g.maxScore}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="section">
			<h2 class="section-title">Quick Actions</h2>
			<div class="actions-row">
				<a href="/ai-course" class="action-btn">🤖 AI Course</a>
				<a href="/my/grades" class="action-btn">📝 My Grades</a>
				<a href="/my/certificates" class="action-btn">🏆 Certificates</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.student-dash {
		max-width: 960px;
		margin: 0 auto;
		animation: fadeIn 0.3s ease both;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.welcome {
		padding: 0 0 20px;
	}
	.welcome h1 {
		font-size: 22px;
		font-weight: 600;
		color: var(--text);
		margin: 0;
	}
	.today-date {
		font-size: 13px;
		color: var(--text-muted, #94a3b8);
		margin: 4px 0 0;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}
	.stat-card {
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.stat-icon {
		font-size: 24px;
		line-height: 1;
	}
	.stat-info {
		display: flex;
		flex-direction: column;
	}
	.stat-value {
		font-size: 22px;
		font-weight: 600;
		color: var(--text, #1a1a2e);
		line-height: 1.2;
	}
	.stat-label {
		font-size: 12px;
		color: var(--text-muted, #94a3b8);
		margin-top: 2px;
	}

	.section {
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 16px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text, #1a1a2e);
		margin: 0 0 14px;
	}

	.empty-text {
		color: var(--text-muted, #94a3b8);
		font-size: 13px;
		margin: 0;
	}

	/* Courses list */
	.courses-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.course-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 6px;
		text-decoration: none !important;
		color: inherit;
		transition: background 0.15s;
	}
	.course-row:hover {
		background: var(--bg, #f8fafc);
	}
	.course-icon {
		font-size: 20px;
		flex-shrink: 0;
	}
	.course-info {
		flex: 1;
		min-width: 0;
	}
	.course-title {
		display: block;
		font-size: 13.5px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.course-meta {
		display: block;
		font-size: 12px;
		color: var(--text-muted, #94a3b8);
		margin-top: 1px;
	}
	.progress-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		width: 140px;
	}
	.progress-bar {
		flex: 1;
		height: 6px;
		background: var(--border, #e5e7eb);
		border-radius: 3px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--accent, #4F46E5);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	.progress-pct {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary, #64748b);
		min-width: 32px;
		text-align: right;
	}

	/* Two column layout */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	/* Deadlines */
	.deadlines-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.deadline-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid var(--border, #e5e7eb);
		gap: 12px;
	}
	.deadline-row:last-child { border-bottom: none; }
	.deadline-info { flex: 1; min-width: 0; }
	.deadline-title {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.deadline-course {
		display: block;
		font-size: 11.5px;
		color: var(--text-muted, #94a3b8);
		margin-top: 1px;
	}
	.deadline-right {
		text-align: right;
		flex-shrink: 0;
	}
	.deadline-kind {
		display: block;
		font-size: 10.5px;
		font-weight: 500;
		color: var(--accent, #4F46E5);
		text-transform: capitalize;
	}
	.deadline-date {
		display: block;
		font-size: 12px;
		color: var(--text-secondary, #64748b);
		margin-top: 1px;
	}

	/* Grades */
	.grades-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.grade-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid var(--border, #e5e7eb);
		gap: 12px;
	}
	.grade-row:last-child { border-bottom: none; }
	.grade-info { flex: 1; min-width: 0; }
	.grade-title {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.grade-course {
		display: block;
		font-size: 11.5px;
		color: var(--text-muted, #94a3b8);
		margin-top: 1px;
	}
	.grade-score {
		font-size: 14px;
		font-weight: 600;
		color: var(--success, #16a34a);
		flex-shrink: 0;
	}

	/* Quick Actions */
	.actions-row {
		display: flex;
		gap: 10px;
	}
	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px 16px;
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 13.5px;
		font-weight: 500;
		color: var(--text, #1a1a2e);
		text-decoration: none !important;
		transition: background 0.15s;
	}
	.action-btn:hover {
		background: var(--bg, #f8fafc);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
		.two-col { grid-template-columns: 1fr; }
	}
	@media (max-width: 480px) {
		.stats-row { grid-template-columns: 1fr; }
		.actions-row { flex-direction: column; }
	}
</style>
