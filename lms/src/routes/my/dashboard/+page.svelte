<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { Avatar, Card, CardContent, Alert, Button, StatCard } from '$lib/components/ui';
	import DailyQuests from '$lib/components/DailyQuests.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

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
	let streakFreezes = $derived(data.streakFreezes || 0);
	let streakAtRisk = $derived(data.streakAtRisk || false);

	// Daily login reward — claim once per session
	let loginReward = $state<{ claimed: boolean; xp: number } | null>(null);
	// Freeze shop
	let buyingFreeze = $state(false);
	let freezeBuyError = $state('');
	let freezeBuySuccess = $state(false);

	async function buyFreeze() {
		if (buyingFreeze) return;
		buyingFreeze = true;
		freezeBuyError = '';
		freezeBuySuccess = false;
		try {
			const res = await fetch('/api/gamification/freeze/buy', {
				method: 'POST',
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			const json = await res.json().catch(() => null);
			if (res.ok && json?.success) {
				freezeBuySuccess = true;
				setTimeout(() => (freezeBuySuccess = false), 4000);
			} else {
				freezeBuyError = json?.error || 'Gagal beli streak freeze';
				setTimeout(() => (freezeBuyError = ''), 5000);
			}
		} catch {
			freezeBuyError = 'Gagal beli streak freeze';
			setTimeout(() => (freezeBuyError = ''), 5000);
		} finally {
			buyingFreeze = false;
		}
	}

	onMount(() => {
		if (!browser) return;
		claimDailyLogin();
	});

	async function claimDailyLogin() {
		try {
			const res = await fetch('/api/gamification/daily-login', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data?.claimed) {
					loginReward = { claimed: true, xp: json.data.xp };
					setTimeout(() => (loginReward = null), 5000);
				}
			}
		} catch {
			// non-critical
		}
	}

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
	<nav class="breadcrumb">
		<a href="/" class="bc-link">Beranda</a>
		<span class="bc-sep">/</span>
		<span class="bc-current">Dashboard</span>
	</nav>

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
			{#if streakFreezes > 0}
				<span class="freeze-chip" title="Streak Freeze — lindungi streak dari skip 1 hari">🧊 {streakFreezes}</span>
			{/if}
			{#if streakFreezes < 3}
				<Button variant="ghost" size="sm" onclick={buyFreeze} disabled={buyingFreeze}>🧊 +1</Button>
			{/if}
		</div>
		<div class="header-actions">
			<Button variant="outline" size="sm" onclick={() => (location.href = '/api/my/progress/export?format=json')}>📥 JSON</Button>
			<Button variant="outline" size="sm" onclick={() => (location.href = '/api/my/progress/export?format=csv')}>📊 CSV</Button>
		</div>
	</header>

	{#if freezeBuyError}
		<div class="freeze-buy-error">{freezeBuyError}</div>
	{/if}
	{#if freezeBuySuccess}
		<div class="freeze-buy-success">🧊 Streak freeze dibeli! -50 XP</div>
	{/if}

	{#if streakAtRisk && currentStreak > 0}
		<div class="streak-risk-banner">
			<span class="risk-icon">🔥</span>
			<div class="risk-text">
				<strong>Streak {currentStreak} hari bakal putus!</strong>
				<span>Belajar hari ini buat pertahankan streak-mu.</span>
			</div>
			<a href="/learn" class="risk-cta">Lanjut Belajar →</a>
		</div>
	{/if}

	{#if loginReward}
		<div class="login-reward-toast">
			🌅 Login harian! +{loginReward.xp} XP 🎉
		</div>
	{/if}

	<!-- Overview cards -->
	<section class="overview-cards">
		<StatCard icon="📚" value={activeCourses.length} label="Kursus aktif" color="var(--accent)" delay={0} />
		<StatCard icon="📊" value="{averageProgress}%" label="Rata-rata progres" color="var(--success)" delay={0.05} />
		<StatCard icon="📖" value={totalLessonsDone} label="Pelajaran selesai" color="var(--accent)" delay={0.1} />
		<StatCard icon="🎓" value={completedCourseCount} label="Kursus selesai" color="var(--success)" delay={0.15} />
		<StatCard icon="⭐" value={totalXp} label="Total XP" color="var(--warning)" delay={0.2} />
		<StatCard icon="🔥" value={currentStreak} label="Streak belajar" color="var(--danger)" delay={0.25} />
	</section>

	<!-- Grid: Courses + Side panel -->
	<!-- XP Progress Ring widget -->
	<section class="xp-ring-section">
		<div class="section-header">
			<h2>⭐ XP Progress</h2>
		</div>
		<div class="xp-ring-card">
			<div class="xp-ring-svg">
				<svg width="100" height="100" viewBox="0 0 36 36">
					<path d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none" stroke="var(--border)" stroke-width="3" />
					<path d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none" stroke="var(--accent)" stroke-width="3"
						stroke-dasharray="{Math.min(Math.round((totalXp % 1000) / 10), 100)}, 100"
						stroke-linecap="round"
						style="transition: stroke-dasharray 0.6s ease" />
				</svg>
				<div class="xp-ring-center">
					<span class="xp-ring-value">{totalXp}</span>
					<span class="xp-ring-label">XP</span>
				</div>
			</div>
			<div class="xp-ring-info">
				<span class="xp-ring-stat">{Math.round((totalXp % 1000) / 10)}% ke level {Math.floor(totalXp / 1000) + 1}</span>
				<span class="xp-ring-sub">{1000 - (totalXp % 1000)} XP tersisa</span>
			</div>
		</div>
	</section>

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
			<!-- Daily Quests -->
			<DailyQuests />

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
								<span class="activity-dot" style="background: var(--accent)"></span>
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

			<!-- Recent Activity with timeline -->
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
					<div class="timeline">
						{#each recentActivity as act, i}
							<div class="timeline-item">
								<div class="timeline-marker">
									<span class="timeline-dot" class:timeline-dot--first={i === 0}></span>
									{#if i < recentActivity.length - 1}
										<span class="timeline-line"></span>
									{/if}
								</div>
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

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		font-size: 12px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-muted);
	}

	.bc-link {
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}
	.bc-link:hover {
		color: var(--text-secondary);
	}

	.bc-sep {
		color: var(--text-muted);
		opacity: 0.5;
	}

	.bc-current {
		color: var(--text-secondary);
	}

	/* Header */
	.dashboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}
	.header-actions { display: flex; gap: 8px; }
	.dashboard-header {
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
		color: var(--text);
	}

	.subtitle {
		font-size: 14px;
		color: var(--text-secondary);
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
		color: var(--warning);
		white-space: nowrap;
		flex-shrink: 0;
		font-feature-settings: 'cv01', 'ss03';
	}
	.streak-fire { font-size: 14px; }
	.streak-risk-banner {
		display: flex; align-items: center; gap: 12px;
		margin-bottom: 14px; padding: 12px 16px;
		background: var(--warning-light);
		border: 1px solid var(--warning); border-radius: 12px;
	}
	.risk-icon { font-size: 24px; }
	.risk-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
	.risk-text strong { font-size: 14px; color: var(--warning); }
	.risk-text span { font-size: 13px; color: var(--danger); }
	.risk-cta {
		padding: 8px 14px; background: var(--danger); color: white;
		border-radius: 8px; font-size: 13px; font-weight: 600;
		text-decoration: none; white-space: nowrap;
	}
	.risk-cta:hover { background: var(--danger); }
	.freeze-chip {
		background: var(--accent-light); color: var(--accent);
		border-radius: 6px; padding: 1px 7px;
		font-size: 12px; font-weight: 700;
	}
	.freeze-buy-error {
		margin-bottom: 12px; padding: 8px 14px;
		background: var(--danger-light); color: var(--danger);
		border: 1px solid var(--danger); border-radius: 8px;
		font-size: 13px;
	}
	.freeze-buy-success {
		margin-bottom: 12px; padding: 8px 14px;
		background: var(--success-light); color: var(--success);
		border: 1px solid var(--success); border-radius: 8px;
		font-size: 13px;
	}
	.login-reward-toast {
		margin-bottom: 14px;
		padding: 10px 16px;
		background: var(--warning);
		color: white;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
		animation: toast-in 0.4s ease;
	}
	@keyframes toast-in {
		from { opacity: 0; transform: translateY(-8px); }
		to { opacity: 1; transform: translateY(0); }
	}

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

/* XP Ring widget */
	.xp-ring-section {
		margin-bottom: 24px;
	}

	.xp-ring-card {
		display: flex;
		align-items: center;
		gap: 20px;
		background: rgba(var(--accent-rgb), 0.04);
		border: 1px solid rgba(var(--accent-rgb), 0.15);
		border-radius: 12px;
		padding: 20px 24px;
	}

	.xp-ring-svg {
		position: relative;
		width: 100px;
		height: 100px;
		flex-shrink: 0;
	}

	.xp-ring-center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.xp-ring-value {
		font-size: 22px;
		font-weight: 700;
		color: var(--accent);
		line-height: 1;
		font-feature-settings: 'cv01', 'ss03';
	}

	.xp-ring-label {
		font-size: 10px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 510;
	}

	.xp-ring-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.xp-ring-stat {
		font-size: 15px;
		font-weight: 590;
		color: var(--text);
		font-feature-settings: 'cv01', 'ss03';
	}

	.xp-ring-sub {
		font-size: 12px;
		color: var(--text-secondary);
	}

	/* Timeline */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.timeline-item {
		display: flex;
		gap: 10px;
		min-height: 44px;
	}

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 14px;
		flex-shrink: 0;
	}

	.timeline-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--border);
		flex-shrink: 0;
		margin-top: 8px;
		transition: all 0.2s ease;
	}
	.timeline-dot--first {
		width: 10px;
		height: 10px;
		background: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
		margin-top: 7px;
	}

	.timeline-line {
		width: 2px;
		flex: 1;
		background: var(--border);
		margin: 2px 0;
	}

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
		color: var(--text);
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
		background: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 18px;
		text-decoration: none !important;
		transition: all 0.15s ease;
		animation: fadeInUp 0.4s ease both;
		animation-delay: var(--delay, 0s);
	}

	.course-card:hover {
		border-color: rgba(var(--accent-rgb), 0.25);
		background: var(--surface-alt);
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
		color: var(--text);
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
		background: var(--border);
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
		color: var(--text-secondary);
		font-feature-settings: 'cv01', 'ss03';
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
		font-weight: 510;
	}

	.course-action {
		margin-top: auto;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}

	.lanjut-belajar {
		font-size: 13px;
		font-weight: 510;
		color: var(--accent);
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Empty states */
	.empty-state { text-align: center; padding: 20px; }
	.empty-state h3 { margin: 8px 0 4px; font-size: 16px; font-weight: 590; color: var(--text); font-feature-settings: 'cv01', 'ss03'; }
	.empty-state p { color: var(--text-secondary); font-size: 13px; margin: 0 0 16px; }

	/* Empty mini */
	.empty-mini { text-align: center; padding: 20px; }
	.empty-text { color: var(--text-secondary); font-size: 13px; margin: 0; }

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
		background: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.task-item:hover {
		border-color: rgba(var(--accent-rgb), 0.2);
		background: var(--surface-alt);
	}

	.task-icon { font-size: 18px; flex-shrink: 0; line-height: 1.4; }
	.task-body { flex: 1; min-width: 0; }
	.task-title { font-size: 13px; font-weight: 510; color: var(--text); display: block; font-feature-settings: 'cv01', 'ss03'; }
	.task-meta { font-size: 11px; color: var(--text-secondary); display: block; margin-top: 1px; font-feature-settings: 'cv01', 'ss03'; }
	.task-date { text-align: right; flex-shrink: 0; }
	.date-label { font-size: 12px; font-weight: 510; color: var(--text); display: block; font-feature-settings: 'cv01', 'ss03'; }
	.task-date.urgent .date-label { color: var(--danger); }
	.date-full { font-size: 11px; color: var(--text-secondary); }

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
		border-bottom: 1px solid var(--surface-alt);
	}

	.activity-item:last-child { border-bottom: none; }

	.activity-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
		margin-top: 6px;
	}

	.activity-body { flex: 1; min-width: 0; }
	.activity-action { font-size: 13px; font-weight: 510; color: var(--text); display: block; font-feature-settings: 'cv01', 'ss03'; }
	.activity-detail { font-size: 12px; color: var(--text-secondary); display: block; margin-top: 1px; }
	.activity-meta { font-size: 11px; color: var(--text-secondary); display: block; margin-top: 2px; }
	.activity-time { font-size: 11px; color: var(--text-secondary); flex-shrink: 0; font-feature-settings: 'cv01', 'ss03'; }

	/* Empty mini */
	.empty-mini { text-align: center; padding: 20px; }
	.empty-text { color: var(--text-secondary); font-size: 13px; margin: 0; }

	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

	@media (max-width: 768px) {
		.dashboard-page {
			padding: 16px 14px;
		}
		.dashboard-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}
		.streak-badge {
			font-size: 12px;
			padding: 4px 10px;
		}
		.header-actions {
			width: 100%;
		}
}

@media (max-width: 480px) {
	.dashboard-page {
		padding: 12px 10px;
	}
	h1 {
		font-size: 20px;
	}
	.subtitle {
		font-size: 12px;
	}
	.overview-cards {
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.streak-risk-banner {
		flex-direction: column;
		gap: 8px;
		text-align: center;
	}
	.risk-cta {
		width: 100%;
		text-align: center;
	}
	.course-grid {
		gap: 8px;
	}
	.section-header h2 {
		font-size: 15px;
	}
}
</style>
