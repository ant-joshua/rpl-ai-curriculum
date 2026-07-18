<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
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
	let upcomingSchedules = $derived(data.upcomingSchedules || []);
	let recentAnnouncements = $derived(data.recentAnnouncements || []);
	let completedCourseCount = $derived(data.completedCourseCount || 0);
	let totalLessonsDone = $derived(data.totalLessonsDone || 0);
	let totalXp = $derived(data.totalXp || 0);
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

	function formatDateTime(dt: string): string {
		if (!dt) return '';
		const d = new Date(dt + (dt.endsWith('Z') ? '' : 'Z'));
		return d.toLocaleDateString('id-ID', {
			weekday: 'short', day: 'numeric', month: 'short',
			hour: '2-digit', minute: '2-digit',
		});
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
					<span class="overview-icon">📖</span>
					<div>
						<span class="overview-value">{totalLessonsDone}</span>
						<span class="overview-label">Pelajaran selesai</span>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card variant="interactive">
			<CardContent>
				<div class="overview-item">
					<span class="overview-icon">🎓</span>
					<div>
						<span class="overview-value">{completedCourseCount}</span>
						<span class="overview-label">Kursus selesai</span>
					</div>
				</div>
			</CardContent>
		</Card>
		<Card variant="interactive">
			<CardContent>
				<div class="overview-item">
					<span class="overview-icon">⭐</span>
					<div>
						<span class="overview-value">{totalXp}</span>
						<span class="overview-label">Total XP</span>
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

	<!-- Grid: Courses + Side panel -->
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

		<!-- Side panel -->
		<div class="side-panel">
			<!-- Upcoming Schedule Events -->
			<section class="upcoming-section">
				<div class="section-header">
					<h2>📅 Jadwal Mendatang</h2>
					{#if upcomingSchedules.length > 0}
						<Button href="/my/schedule" variant="ghost" size="sm">Lihat Semua</Button>
					{/if}
				</div>

				{#if upcomingSchedules.length === 0}
					<Card>
						<CardContent>
							<div class="empty-mini">
								<p class="empty-text">Tidak ada jadwal dalam waktu dekat</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<div class="task-list">
						{#each upcomingSchedules as s}
							<a href="/learn/{s.course_offering_id}" class="task-item">
								<span class="task-icon">{s.course_icon || '📅'}</span>
								<div class="task-body">
									<span class="task-title">{s.title}</span>
									<span class="task-meta">
										{s.offering_name} · {formatDateTime(s.startTime)}
									</span>
									{#if s.location}
										<span class="task-meta">📍 {s.location}</span>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</section>

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

			<!-- Recent Announcements -->
			<section class="activity-section">
				<div class="section-header">
					<h2>📢 Pengumuman Terbaru</h2>
				</div>

				{#if recentAnnouncements.length === 0}
					<Card>
						<CardContent>
							<div class="empty-mini">
								<p class="empty-text">Belum ada pengumuman</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<div class="activity-list">
						{#each recentAnnouncements as ann}
							<div class="activity-item">
								<span class="activity-dot" style="background: #7170ff"></span>
								<div class="activity-body">
									<span class="activity-action">{ann.title}</span>
									{#if ann.body}
										<span class="activity-detail">{ann.body.slice(0, 100)}{ann.body.length > 100 ? '…' : ''}</span>
									{/if}
									<span class="activity-meta">{ann.offering_name} · {timeAgo(ann.createdAt)}</span>
								</div>
							</div>
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
		font-size: 24px;
		font-weight: 590;
		margin: 0 0 2px;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.288px;
		color: #f7f8f8;
	}

	.subtitle {
		font-size: 14px;
		color: #8a8f98;
		margin: 0;
		font-feature-settings: 'cv01', 'ss03';
	}

	.streak-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(245, 158, 11, 0.08);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 9999px;
		padding: 5px 14px;
		font-size: 13px;
		font-weight: 510;
		color: #f59e0b;
		white-space: nowrap;
		flex-shrink: 0;
		font-feature-settings: 'cv01', 'ss03';
	}
	.streak-fire { font-size: 14px; }

	/* Overview */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 12px;
		margin-bottom: 28px;
	}

	@media (max-width: 1000px) {
		.overview-cards { grid-template-columns: repeat(3, 1fr); }
	}
	@media (max-width: 500px) {
		.overview-cards { grid-template-columns: repeat(2, 1fr); }
	}

	.overview-item {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.overview-icon {
		font-size: 22px;
		opacity: 0.9;
	}

	.overview-item div {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.overview-value {
		font-size: 20px;
		font-weight: 590;
		color: #f7f8f8;
		font-feature-settings: 'cv01', 'ss03';
		line-height: 1.2;
	}

	.overview-label {
		font-size: 11px;
		color: #8a8f98;
		font-weight: 510;
		font-feature-settings: 'cv01', 'ss03';
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
		font-weight: 590;
		margin: 0;
		font-feature-settings: 'cv01', 'ss03';
		color: #f7f8f8;
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
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 8px;
		padding: 18px;
		text-decoration: none !important;
		transition: all 0.15s ease;
		animation: fadeInUp 0.4s ease both;
		animation-delay: var(--delay, 0s);
	}

	.course-card:hover {
		border-color: rgba(94,106,210,0.25);
		background: rgba(255,255,255,0.04);
	}

	.course-card-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.course-icon { font-size: 28px; line-height: 1; }

	.course-title {
		font-size: 15px;
		font-weight: 590;
		color: #f7f8f8;
		margin: 0;
		line-height: 1.3;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Progress */
	.course-progress-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.course-progress-bar {
		flex: 1;
		height: 4px;
		background: rgba(255,255,255,0.06);
		border-radius: 2px;
		overflow: hidden;
	}

	.course-progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.5s ease;
	}

	.course-progress-text {
		font-size: 13px;
		font-weight: 590;
		min-width: 36px;
		text-align: right;
		font-feature-settings: 'cv01', 'ss03';
	}

	.course-stats {
		font-size: 12px;
		color: #8a8f98;
		font-feature-settings: 'cv01', 'ss03';
	}

	.course-last-lesson {
		font-size: 12px;
		color: #8a8f98;
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.last-lesson-label { flex-shrink: 0; }

	.last-lesson-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #f7f8f8;
		font-weight: 510;
	}

	.course-action {
		margin-top: auto;
		padding-top: 8px;
		border-top: 1px solid rgba(255,255,255,0.06);
	}

	.lanjut-belajar {
		font-size: 13px;
		font-weight: 510;
		color: #7170ff;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Empty states */
	.empty-state { text-align: center; padding: 20px; }
	.empty-state h3 { margin: 8px 0 4px; font-size: 16px; font-weight: 590; color: #f7f8f8; font-feature-settings: 'cv01', 'ss03'; }
	.empty-state p { color: #8a8f98; font-size: 13px; margin: 0 0 16px; }

	/* Side panel */
	.side-panel {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Task list */
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.task-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px;
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.task-item:hover {
		border-color: rgba(94,106,210,0.2);
		background: rgba(255,255,255,0.04);
	}

	.task-icon { font-size: 18px; flex-shrink: 0; line-height: 1.4; }
	.task-body { flex: 1; min-width: 0; }
	.task-title { font-size: 13px; font-weight: 510; color: #f7f8f8; display: block; font-feature-settings: 'cv01', 'ss03'; }
	.task-meta { font-size: 11px; color: #8a8f98; display: block; margin-top: 1px; font-feature-settings: 'cv01', 'ss03'; }
	.task-date { text-align: right; flex-shrink: 0; }
	.date-label { font-size: 12px; font-weight: 510; color: #f7f8f8; display: block; font-feature-settings: 'cv01', 'ss03'; }
	.task-date.urgent .date-label { color: #ef4444; }
	.date-full { font-size: 11px; color: #8a8f98; }

	/* Activity */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid rgba(255,255,255,0.04);
	}

	.activity-item:last-child { border-bottom: none; }

	.activity-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #5e6ad2;
		flex-shrink: 0;
		margin-top: 6px;
	}

	.activity-body { flex: 1; min-width: 0; }
	.activity-action { font-size: 13px; font-weight: 510; color: #f7f8f8; display: block; font-feature-settings: 'cv01', 'ss03'; }
	.activity-detail { font-size: 12px; color: #8a8f98; display: block; margin-top: 1px; }
	.activity-meta { font-size: 11px; color: #8a8f98; display: block; margin-top: 2px; }
	.activity-time { font-size: 11px; color: #8a8f98; flex-shrink: 0; font-feature-settings: 'cv01', 'ss03'; }

	/* Empty mini */
	.empty-mini { text-align: center; padding: 20px; }
	.empty-text { color: #8a8f98; font-size: 13px; margin: 0; }

	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
