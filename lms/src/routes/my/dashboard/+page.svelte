<script lang="ts">
	let { data }: { data: import('./$types').PageData } = $props();

	let userName = $derived(data.userName || 'Student');
	let currentStreak = $derived(data.currentStreak || 0);
	let averageProgress = $derived(data.averageProgress || 0);
	let activeCourses = $derived(data.activeCourses || []);

	let showAllCourses = $state(false);
	let visibleCourses = $derived(showAllCourses ? activeCourses : activeCourses.slice(0, 4));

	function progressColor(pct: number): string {
		if (pct >= 80) return 'var(--success)';
		if (pct >= 40) return 'var(--warning)';
		return 'var(--accent)';
	}

	function offeringUrl(offeringId: string, nextSlug: string | null): string {
		if (nextSlug) return `/learn/${offeringId}/lessons/${nextSlug}`;
		return `/learn/${offeringId}`;
	}
</script>

<svelte:head>
	<title>Dashboard — RPL AI Curriculum</title>
</svelte:head>

<div class="dashboard-page">
	<!-- Welcome header -->
	<header class="dashboard-header">
		<div>
			<h1>Selamat datang, {userName}! 👋</h1>
			<p class="subtitle">Lanjutkan perjalanan belajar RPL AI-mu</p>
		</div>
		<div class="streak-badge">
			<span class="streak-fire">🔥</span>
			<span>{currentStreak} hari berturut-turut</span>
		</div>
	</header>

	<!-- Overview cards -->
	<section class="overview-cards">
		<div class="overview-card">
			<span class="overview-icon">📚</span>
			<div>
				<span class="overview-value">{activeCourses.length}</span>
				<span class="overview-label">Course aktif</span>
			</div>
		</div>
		<div class="overview-card">
			<span class="overview-icon">📊</span>
			<div>
				<span class="overview-value">{averageProgress}%</span>
				<span class="overview-label">Rata-rata progres</span>
			</div>
		</div>
		<div class="overview-card">
			<span class="overview-icon">🔥</span>
			<div>
				<span class="overview-value">{currentStreak}</span>
				<span class="overview-label">Streak</span>
			</div>
		</div>
	</section>

	<!-- Active Courses -->
	<section class="courses-section">
		<div class="section-header">
			<h2>📖 Course Aktif</h2>
			{#if activeCourses.length > 4}
				<button class="toggle-btn" onclick={() => showAllCourses = !showAllCourses}>
					{showAllCourses ? 'Lihat sedikit' : `Lihat semua (${activeCourses.length})`}
				</button>
			{/if}
		</div>

		{#if visibleCourses.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<h3>Belum ada course aktif</h3>
				<p>Kamu belum terdaftar di course manapun. Jelajahi path belajar yang tersedia!</p>
				<a href="/path" class="cta-button">Jelajahi Path</a>
			</div>
		{:else}
			<div class="course-grid">
				{#each visibleCourses as course, i (course.offeringId)}
					<a href={offeringUrl(course.offeringId, course.nextLessonSlug)} class="course-card animate-in" style="--delay: {i * 0.05}s">
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
							<span class="course-stat">
								{course.completedLessons}/{course.totalLessons} sesi
							</span>
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
</div>

<style>
	.dashboard-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 16px;
		animation: fadeIn 0.4s ease both;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 12px;
	}

	h1 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 2px;
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
	}

	/* Streak badge */
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
		animation: pulse 2s ease-in-out infinite;
		flex-shrink: 0;
	}
	.streak-fire { font-size: 16px; }

	/* Overview cards */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}

	.overview-card {
		background: var(--gradient-card);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 18px 20px;
		display: flex;
		align-items: center;
		gap: 14px;
		transition: all 0.2s ease;
	}

	.overview-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
	}

	.overview-icon { font-size: 28px; }

	.overview-card div {
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

	/* Section header */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-header h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	.toggle-btn {
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		border: none;
		padding: 6px 14px;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.toggle-btn:hover {
		background: var(--accent);
		color: #fff;
	}

	/* Course grid */
	.course-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}

	/* Course card */
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

	.course-icon {
		font-size: 28px;
		line-height: 1;
	}

	.course-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
	}

	/* Progress bar */
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

	/* Stats */
	.course-stats {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.course-stat {
		font-weight: 500;
	}

	/* Last lesson */
	.course-last-lesson {
		font-size: 12px;
		color: var(--text-secondary);
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.last-lesson-label {
		flex-shrink: 0;
	}

	.last-lesson-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text);
		font-weight: 500;
	}

	/* Action button */
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

	.course-card:hover .lanjut-belajar {
		color: var(--accent-secondary);
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: var(--text);
	}

	.empty-state p {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 20px 0;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.cta-button {
		display: inline-block;
		padding: 10px 24px;
		background: var(--gradient-primary);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		border-radius: 10px;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.cta-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
	}

	/* Responsive */
	@media (max-width: 768px) {
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
