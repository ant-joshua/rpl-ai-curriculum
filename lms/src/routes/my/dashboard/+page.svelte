<script lang="ts">
	import { Avatar, Card, CardContent, Alert, Button } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();

	let displayName = $derived(data.displayName || 'Siswa');
	let avatarUrl = $derived(data.avatarUrl || '');
	let initials = $derived(
		displayName
			.split(' ')
			.map((s: string) => s[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
	let currentStreak = $derived(data.currentStreak || 0);
	let averageProgress = $derived(data.averageProgress || 0);
	let activeCourses = $derived(data.activeCourses || []);
	let upcomingDeadlines = $derived(data.upcomingDeadlines || []);
	let recentActivity = $derived(data.recentActivity || []);

	let showAllCourses = $state(false);
	let visibleCourses = $derived(showAllCourses ? activeCourses : activeCourses.slice(0, 4));

	function progressColor(pct: number): string {
		if (pct >= 80) return 'var(--success)';
		if (pct >= 40) return 'var(--warning)';
		return 'var(--accent)';
	}

	function progressVariant(pct: number): string {
		if (pct >= 80) return 'success';
		if (pct >= 40) return 'warning';
		return 'default';
	}

	function offeringUrl(offeringId: string, nextSlug: string | null): string {
		if (nextSlug) return `/learn/${offeringId}/lessons/${nextSlug}`;
		return `/learn/${offeringId}`;
	}

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const now = Date.now();
		const d = new Date(dateStr + 'Z').getTime();
		const diff = Math.floor((now - d) / 1000);
		if (diff < 60) return 'baru saja';
		if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
		return `${Math.floor(diff / 86400)}h lalu`;
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'T00:00:00Z');
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function daysUntil(dateStr: string): number {
		if (!dateStr) return 0;
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const d = new Date(dateStr + 'T00:00:00Z');
		return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	}

	function activityLabel(action: string, entityType: string): string {
		if (action === 'complete_lesson') return 'Menyelesaikan pelajaran';
		if (action === 'start_lesson') return 'Mulai pelajaran';
		if (action === 'view_course') return 'Melihat kursus';
		if (action === 'submit_assignment') return 'Mengumpulkan tugas';
		if (action === 'start_assessment') return 'Mulai penilaian';
		if (action === 'complete_assessment') return 'Menyelesaikan penilaian';
		if (action === 'login') return 'Login';
		return action?.replace(/_/g, ' ') || 'Aktivitas';
	}
</script>

<svelte:head>
	<title>Dashboard — LMS RPL</title>
</svelte:head>

<div class="dashboard-page">
	<!-- Header with avatar -->
	<header class="dashboard-header">
		<div class="header-left">
			<Avatar src={avatarUrl} {initials} alt={displayName} size="lg" />
			<div>
				<h1>Halo, {displayName}! 👋</h1>
				<p class="subtitle">Lanjutkan perjalanan belajar RPL AI-mu</p>
			</div>
		</div>
		<div class="streak-badge">
			<span class="streak-fire">🔥</span>
			<span>{currentStreak} hari berturut-turut</span>
		</div>
	</header>

	<!-- Overview cards -->
	<section class="overview-cards">
		<Card variant="interactive">
			<CardContent>
				<div class="overview-item">
					<span class="overview-icon">📚</span>
					<div>
						<span class="overview-value">{activeCourses.length}</span>
						<span class="overview-label">Kursus aktif</span>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card variant="interactive">
			<CardContent>
				<div class="overview-item">
					<span class="overview-icon">📊</span>
					<div>
						<span class="overview-value">{averageProgress}%</span>
						<span class="overview-label">Rata-rata progres</span>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card variant="interactive">
			<CardContent>
				<div class="overview-item">
					<span class="overview-icon">🔥</span>
					<div>
						<span class="overview-value">{currentStreak}</span>
						<span class="overview-label">Streak belajar</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Grid: Courses + Upcoming tasks -->
	<div class="content-grid">
		<!-- Active Courses -->
		<section class="courses-section">
			<div class="section-header">
				<h2>📖 Kursus Aktif</h2>
				{#if activeCourses.length > 4}
					<Button variant="ghost" size="sm" onclick={() => showAllCourses = !showAllCourses}>
						{showAllCourses ? 'Tampilkan sedikit' : `Lihat semua (${activeCourses.length})`}
					</Button>
				{/if}
			</div>

			{#if visibleCourses.length === 0}
				<Card>
					<CardContent>
						<div class="empty-state">
							<div class="empty-icon">📭</div>
							<h3>Belum ada kursus aktif</h3>
							<p>Kamu belum terdaftar di kursus manapun. Jelajahi path belajar yang tersedia!</p>
							<Button href="/path" variant="primary">Jelajahi Path</Button>
						</div>
					</CardContent>
				</Card>
			{:else}
				<div class="course-grid">
					{#each visibleCourses as course, i (course.offeringId)}
						<a href={offeringUrl(course.offeringId, course.nextLessonSlug)} class="course-card" style="--delay: {i * 0.05}s">
							<div class="course-card-header">
								<span class="course-icon">{course.courseIcon || '📚'}</span>
								<h3 class="course-title">{course.courseTitle}</h3>
							</div>

							<div class="course-progress-section">
								<div class="course-progress-bar">
									<div
										class="course-progress-fill"
										style="width: {course.progress}%; background: {progressColor(course.progress)}"
									></div>
								</div>
								<span class="course-progress-text" style="color: {progressColor(course.progress)}">
									{course.progress}%
								</span>
							</div>

							<div class="course-stats">
								<span>{course.completedLessons}/{course.totalLessons} sesi</span>
							</div>

							{#if course.lastLessonTitle}
								<div class="course-last-lesson">
									<span class="last-lesson-label">Terakhir:</span>
									<span class="last-lesson-title">{course.lastLessonTitle}</span>
								</div>
							{/if}

							<div class="course-action">
								<span class="lanjut-belajar">Lanjut Belajar →</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Side panel: Upcoming + Activity -->
		<div class="side-panel">
			<!-- Upcoming Tasks -->
			<section class="upcoming-section">
				<div class="section-header">
					<h2>📋 Tugas Mendatang</h2>
				</div>

				{#if upcomingDeadlines.length === 0}
					<Card>
						<CardContent>
							<div class="empty-mini">
								<p class="empty-text">Tidak ada tugas mendatang. Santai dulu! 🎉</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<div class="task-list">
						{#each upcomingDeadlines as task}
							<a
								href={task.kind === 'assessment' ? `/my/assessments/${task.id}` : `/my/assignments/${task.id}`}
								class="task-item"
							>
								<span class="task-icon">{task.kind === 'assessment' ? '📋' : '📂'}</span>
								<div class="task-body">
									<span class="task-title">{task.title}</span>
									<span class="task-meta">
										{task.offering_name} · {task.kind === 'assessment' ? 'Penilaian' : 'Tugas'}
									</span>
								</div>
								<div class="task-date" class:urgent={daysUntil(task.due_date) <= 3}>
									<span class="date-label">
										{daysUntil(task.due_date) <= 0
											? 'Tenggat hari ini'
											: daysUntil(task.due_date) === 1
												? 'Besok'
												: `${daysUntil(task.due_date)} hari lagi`}
									</span>
									<span class="date-full">{formatDate(task.due_date)}</span>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Recent Activity -->
			<section class="activity-section">
				<div class="section-header">
					<h2>🕐 Aktivitas Terbaru</h2>
				</div>

				{#if recentActivity.length === 0}
					<Card>
						<CardContent>
							<div class="empty-mini">
								<p class="empty-text">Belum ada aktivitas. Mulai belajar! 🚀</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<div class="activity-list">
						{#each recentActivity as act}
							<div class="activity-item">
								<span class="activity-dot"></span>
								<div class="activity-body">
									<span class="activity-action">{activityLabel(act.action, act.entityType)}</span>
									{#if act.metadata?.title}
										<span class="activity-detail">{act.metadata.title}</span>
									{/if}
								</div>
								<span class="activity-time">{timeAgo(act.createdAt)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</div>
</div>

<style>
	.dashboard-page {
		max-width: 1120px;
		margin: 0 auto;
		padding: 24px 20px;
		animation: fadeIn 0.4s ease both;
	}

	/* Header */
	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	h1 {
		font-size: 22px;
		font-weight: 700;
		margin: 0 0 2px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0;
	}

	.streak-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.streak-fire { font-size: 16px; }

	/* Overview */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 28px;
	}

	.overview-item {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.overview-icon { font-size: 28px; }

	.overview-item div {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.overview-value {
		font-size: 22px;
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.overview-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Content grid layout */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 20px;
		align-items: start;
	}

	@media (max-width: 900px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Section header */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
	}

	.section-header h2 {
		font-size: 17px;
		font-weight: 600;
		margin: 0;
	}

	/* Course grid */
	.course-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}

	.course-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 18px;
		text-decoration: none !important;
		transition: all 0.2s ease;
		animation: fadeInUp 0.4s ease both;
		animation-delay: var(--delay, 0s);
	}

	.course-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	}

	.course-card-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.course-icon { font-size: 28px; line-height: 1; }

	.course-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
	}

	/* Progress */
	.course-progress-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.course-progress-bar {
		flex: 1;
		height: 8px;
		background: var(--border);
		border-radius: 4px;
		overflow: hidden;
	}

	.course-progress-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s ease;
	}

	.course-progress-text {
		font-size: 14px;
		font-weight: 700;
		min-width: 36px;
		text-align: right;
	}

	.course-stats {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.course-last-lesson {
		font-size: 12px;
		color: var(--text-secondary);
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.last-lesson-label { flex-shrink: 0; }

	.last-lesson-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text);
		font-weight: 500;
	}

	.course-action {
		margin-top: auto;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}

	.lanjut-belajar {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		transition: gap 0.15s ease;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 40px 20px;
	}

	.empty-icon { font-size: 48px; margin-bottom: 12px; }

	.empty-state h3 {
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 6px;
		color: var(--text);
	}

	.empty-state p {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0 0 16px;
	}

	/* Side panel */
	.side-panel {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Task list */
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.task-item {
		display: flex;
		gap: 10px;
		padding: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		text-decoration: none;
		transition: all 0.15s ease;
		align-items: center;
	}

	.task-item:hover {
		border-color: var(--accent);
		background: var(--hover);
	}

	.task-icon { font-size: 20px; flex-shrink: 0; }

	.task-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.task-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.task-meta {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.task-date {
		text-align: right;
		flex-shrink: 0;
	}

	.date-label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: var(--text);
	}

	.task-date.urgent .date-label {
		color: #ef4444;
	}

	.date-full {
		display: block;
		font-size: 10px;
		color: var(--text-secondary);
	}

	/* Activity list */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.activity-item {
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		align-items: center;
		border-radius: 8px;
		transition: background 0.12s;
	}

	.activity-item:hover {
		background: var(--hover);
	}

	.activity-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}

	.activity-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.activity-action {
		font-size: 13px;
		color: var(--text);
		font-weight: 500;
	}

	.activity-detail {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.activity-time {
		font-size: 11px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.empty-mini {
		padding: 16px;
		text-align: center;
	}

	.empty-text {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard-page {
			padding: 16px 12px;
		}

		.dashboard-header {
			flex-direction: column;
		}

		.overview-cards {
			grid-template-columns: 1fr;
		}

		.course-grid {
			grid-template-columns: 1fr;
		}

		h1 {
			font-size: 20px;
		}
	}
</style>
