<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { Card, CardContent, Button, Badge, StatCard, PageHeader } from '$lib/components/ui';

	let { data }: { data: import('./$types').PageData } = $props();

	let courses = $derived(data.courses ?? []);
	let courseStats = $derived(data.courseStats ?? {});
	let pendingSubmissions = $derived(data.pendingSubmissions ?? []);
	let pendingAssignments = $derived(data.pendingAssignments ?? []);
	let pendingCount = $derived(data.pendingCount ?? 0);
	let upcomingDeadlines = $derived(data.upcomingDeadlines ?? []);
	let recentReviews = $derived(data.recentReviews ?? []);
	let aieduStats = $derived(data.aieduStats ?? { docs_created: 0, docs_saved: 0, generations_count: 0, quiz_count: 0, graded_count: 0 });
	let recentAttempts = $derived(data.recentAttempts ?? []);

	let courseCount = $derived(courses.length);
	let totalStudents = $derived(courses.reduce((sum: number, c: any) => sum + (c.activeEnrollments || 0), 0));
	let avgCompletion = $derived.by(() => {
		const keys = Object.keys(courseStats);
		if (keys.length === 0) return 0;
		return Math.round(keys.reduce((s: number, k: string) => s + (courseStats[k]?.completionRate || 0), 0) / keys.length);
	});

	function timeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'Z').getTime();
		const diff = Math.floor((Date.now() - d) / 1000);
		if (diff < 60) return 'baru saja';
		if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
		return `${Math.floor(diff / 86400)}h lalu`;
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('id-ID', {
			day: 'numeric', month: 'short', year: 'numeric'
		});
	}

	function daysUntil(dateStr: string): number {
		if (!dateStr) return 0;
		const now = new Date(); now.setHours(0, 0, 0, 0);
		const d = new Date(dateStr + 'T00:00:00Z');
		return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	}

	function statusBadge(status: string): 'success' | 'warning' | 'default' {
		if (status === 'active') return 'success';
		if (status === 'draft') return 'warning';
		return 'default';
	}

	let showAllCourses = $state(false);
	let visibleCourses = $derived(showAllCourses ? courses : courses.slice(0, 6));
</script>

<svelte:head>
	<title>Dashboard Instruktur — LMS RPL</title>
</svelte:head>

<div class="instructor-page">
	<PageHeader title="📊 Dashboard Guru" subtitle="Kelola kursus, tugas, dan pantau perkembangan siswa" />

	<!-- Overview Stats -->
	<section class="stats-grid">
		<StatCard icon="📚" value={courseCount} label="Kursus Diajar" />
		<StatCard icon="👥" value={totalStudents} label="Siswa Aktif" />
		<StatCard icon="📝" value={pendingCount} label="Menunggu Penilaian" />
		<StatCard icon="✅" value="{avgCompletion}%" label="Rata-rata Penyelesaian" />
	</section>

	<!-- AIEdu Quick Stats -->
	<section class="aiedu-stats-bar">
		<h2 class="aiedu-title">✨ AIEdu Ringkasan</h2>
		<div class="aiedu-chips">
			<a href="/aiedu" class="aiedu-chip">
				<span class="chip-val">{aieduStats.generations_count}</span>
				<span class="chip-label">Generated</span>
			</a>
			<a href="/aiedu" class="aiedu-chip">
				<span class="chip-val">{aieduStats.docs_saved}</span>
				<span class="chip-label">Saved to Bank</span>
			</a>
			<a href="/instructor/quiz" class="aiedu-chip">
				<span class="chip-val">{aieduStats.quiz_count}</span>
				<span class="chip-label">Quiz Aktif</span>
			</a>
			<a href="/admin/gradebook" class="aiedu-chip">
				<span class="chip-val">{aieduStats.graded_count}</span>
				<span class="chip-label">Dinilai</span>
			</a>
		</div>
		<div class="aiedu-quick">
			<a href="/aiedu" class="quick-link">🤖 Generate Soal</a>
			<a href="/instructor/quiz" class="quick-link">🎯 Quiz Builder</a>
			<a href="/instructor/rapor" class="quick-link">📋 Rapor Batch</a>
			<a href="/aiedu/analisis" class="quick-link">📈 Analisis Nilai</a>
		</div>
	</section>

	<!-- Content Grid -->
	<div class="content-grid">
		<!-- Courses List -->
		<section>
			<div class="section-header">
				<h2>📖 Kursus Saya</h2>
				{#if courses.length > 6}
					<Button variant="ghost" size="sm" onclick={() => showAllCourses = !showAllCourses}>
						{showAllCourses ? 'Tampilkan sedikit' : `Lihat semua (${courses.length})`}
					</Button>
				{/if}
			</div>

			{#if visibleCourses.length === 0}
				<Card>
					<CardContent>
						<p class="empty-text">Belum ada kursus yang ditugaskan.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="course-list">
					{#each visibleCourses as course}
						<div class="course-row-wrapper">
							<a href="/instructor/courses/{course.id}" class="course-row">
								<div class="course-row-info">
									<div class="course-row-top">
										<span class="course-icon">{course.courseIcon}</span>
										<div>
											<span class="course-name">{course.offeringName}</span>
											<span class="course-title-sub">{course.courseTitle}</span>
										</div>
									</div>
									<div class="course-row-stats">
										<span class="stat-chip">👥 {course.activeEnrollments} siswa</span>
										<span class="stat-chip">🎯 {courseStats[course.id]?.completionRate ?? 0}%</span>
										<span class="stat-chip">📊 {courseStats[course.id]?.avgGrade ?? 0}</span>
										<span class="stat-chip">⭐ {courseStats[course.id]?.avgRating ?? 0} ({courseStats[course.id]?.ratingCount ?? 0})</span>
										{#if (courseStats[course.id]?.openQuestions ?? 0) > 0}
											<span class="stat-chip warn">💬 {courseStats[course.id].openQuestions} belum dijawab</span>
										{/if}
									</div>
								</div>
							</a>
							<div class="course-row-actions">
								<a href="/my/chat/{course.id}" class="chat-link" title="Chat kursus">💬</a>
								<Badge variant={statusBadge(course.status)}>
									{course.status === 'active' ? 'Aktif' : course.status === 'draft' ? 'Draft' : 'Arsip'}
								</Badge>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Side Panel -->
		<div class="side-panel">
			<!-- Pending Submissions -->
			<section class="panel-section">
				<h2>📝 Menunggu Penilaian</h2>
				{#if pendingSubmissions.length === 0 && pendingAssignments.length === 0}
					<Card>
						<CardContent>
							<p class="empty-text">Tidak ada tugas yang menunggu penilaian ✅</p>
						</CardContent>
					</Card>
				{:else}
					<div class="submission-list">
						{#each pendingSubmissions as sub}
							<a href="/admin/gradebook?submission={sub.id}" class="submission-item">
								<div class="sub-avatar">{sub.avatarUrl ? `<img src="${sub.avatarUrl}" alt="" />` : '📋'}</div>
								<div class="sub-body">
									<span class="sub-title">{sub.title}</span>
									<span class="sub-meta">{sub.studentName} · {sub.offeringName}</span>
								</div>
								<span class="sub-time">{timeAgo(sub.submittedAt)}</span>
							</a>
						{/each}
						{#each pendingAssignments as sub}
							<a href="/admin/gradebook?submission={sub.id}" class="submission-item">
								<div class="sub-avatar">{sub.avatarUrl ? `<img src="${sub.avatarUrl}" alt="" />` : '📂'}</div>
								<div class="sub-body">
									<span class="sub-title">{sub.title}</span>
									<span class="sub-meta">{sub.studentName} · {sub.offeringName}</span>
								</div>
								<span class="sub-time">{timeAgo(sub.submittedAt)}</span>
							</a>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Upcoming Deadlines -->
			<section class="panel-section">
				<h2>📅 Tenggat Mendatang</h2>
				{#if upcomingDeadlines.length === 0}
					<Card>
						<CardContent>
							<p class="empty-text">Tidak ada tenggat mendatang 🎉</p>
						</CardContent>
					</Card>
				{:else}
					<div class="deadline-list">
						{#each upcomingDeadlines as dd}
							<div class="deadline-item">
								<span class="deadline-icon">{dd.kind === 'assessment' ? '📋' : '📂'}</span>
								<div class="deadline-body">
									<span class="deadline-title">{dd.title}</span>
									<span class="deadline-meta">{dd.offeringName}</span>
								</div>
								<div class="deadline-date" class:urgent={daysUntil(dd.dueDate) <= 3}>
									{daysUntil(dd.dueDate) <= 0
										? 'Hari ini'
										: daysUntil(dd.dueDate) === 1
											? 'Besok'
											: `${daysUntil(dd.dueDate)} hari`}
									<span class="date-full">{formatDate(dd.dueDate)}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Recent Reviews -->
			<section class="panel-section">
				<h2>⭐ Review Terbaru</h2>
				{#if recentReviews.length === 0}
					<Card>
						<CardContent>
							<p class="empty-text">Belum ada review 🎉</p>
						</CardContent>
					</Card>
				{:else}
					<div class="review-list">
						{#each recentReviews as rv}
							<div class="review-item">
								<div class="review-head">
									<span class="review-stars">{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</span>
									<span class="review-date">{formatDate(rv.createdAt)}</span>
								</div>
								{#if rv.comment}
									<p class="review-comment">{rv.comment}</p>
								{:else}
									<p class="review-comment muted">Tanpa komentar</p>
								{/if}
								<span class="review-meta">{rv.reviewerName} · {rv.offeringName}</span>
									</div>
									{/each}
								</div>
								{/if}
								</section>

								<!-- Recent Quiz Attempts -->
								<section class="panel-section">
								<h2>🎯 Quiz Terbaru</h2>
								{#if recentAttempts.length === 0}
									<Card>
										<CardContent>
											<p class="empty-text">Belum ada submission quiz</p>
										</CardContent>
									</Card>
								{:else}
									<div class="attempt-list">
										{#each recentAttempts as att}
											<div class="attempt-item">
												<span class="attempt-score">{att.score}/{att.maxScore}</span>
												<div class="attempt-body">
													<span class="attempt-title">{att.title}</span>
													<span class="attempt-meta">{att.studentName} · {att.offeringName}</span>
												</div>
												<span class="attempt-time">{timeAgo(att.submittedAt)}</span>
											</div>
										{/each}
									</div>
								{/if}
								</section>
		</div>
	</div>
</div>

<style>
	.instructor-page {
		max-width: 1120px;
		margin: 0 auto;
		padding: 24px 20px;
		animation: fadeIn 0.4s ease both;
	}

	/* Stats */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}
	@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 20px;
		align-items: start;
	}
	@media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;
	}
	section h2, .panel-section h2 {
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 14px;
	}

	/* Course list */
	.course-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.course-row-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.2s ease;
	}
	.course-row-wrapper:hover {
		border-color: var(--accent);
	}
	.course-row {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		text-decoration: none !important;
		min-width: 0;
	}
	.course-row:hover {
		transform: translateX(2px);
	}
	.course-row-info { flex: 1; min-width: 0; }
	.course-row-top {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 6px;
	}
	.course-icon { font-size: 24px; flex-shrink: 0; }
	.course-name {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}
	.course-title-sub {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.course-row-stats {
		display: flex;
		gap: 8px;
		margin-left: 34px;
	}
	.stat-chip {
		font-size: 11px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 2px 8px;
		border-radius: 4px;
	}

	.course-row-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px 12px 8px 0;
		flex-shrink: 0;
	}
	.chat-link {
		font-size: 20px;
		text-decoration: none !important;
		opacity: 0.7;
		transition: opacity 0.15s;
		line-height: 1;
	}
	.chat-link:hover {
		opacity: 1;
	}

	/* Panel sections */
	.panel-section { margin-bottom: 20px; }
	.empty-text {
		text-align: center;
		padding: 24px;
		color: var(--text-secondary);
		font-size: 13px;
	}

	/* Submission list */
	.submission-list, .deadline-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.submission-item, .deadline-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
		text-decoration: none !important;
		color: inherit;
		transition: opacity 0.15s;
	}
	.submission-item:hover { opacity: 0.8; }
	.submission-item:last-child, .deadline-item:last-child { border-bottom: none; }
	/* Reviews */
	.review-item { padding: 10px 0; border-bottom: 1px solid var(--border); }
	.review-item:last-child { border-bottom: none; }
	.review-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
	.review-stars { color: #f59e0b; font-size: 13px; letter-spacing: 1px; }
	.review-date { font-size: 11px; color: var(--text-muted); }
	.review-comment { font-size: 13px; color: var(--text-secondary); margin: 0 0 4px; line-height: 1.5; }
	.review-comment.muted { color: #94a3b8; font-style: italic; }
	.review-meta { font-size: 11px; color: var(--text-muted); }
	.stat-chip.warn { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
	.sub-avatar { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
	.sub-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
	.sub-title { font-weight: 600; color: var(--text); }
	.sub-meta { font-size: 11px; color: var(--text-secondary); }
	.sub-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

	.deadline-icon { font-size: 16px; flex-shrink: 0; }
	.deadline-body { flex: 1; min-width: 0; }
	.deadline-title { display: block; font-weight: 500; color: var(--text); }
	.deadline-meta { font-size: 11px; color: var(--text-secondary); }
	.deadline-date {
		text-align: right;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		white-space: nowrap;
	}
	.deadline-date.urgent { color: #ef4444; }
	.date-full {
		display: block;
		font-size: 10px;
		font-weight: 400;
		color: var(--text-secondary);
	}

	/* AIEdu Stats Bar */
	.aiedu-stats-bar {
		background: linear-gradient(135deg, #eef2ff, #f0fdf4);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px 20px;
		margin-bottom: 24px;
	}
	.aiedu-title { font-size: 15px; font-weight: 600; margin: 0 0 12px; }
	.aiedu-chips { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
	.aiedu-chip {
		display: flex; flex-direction: column; align-items: center;
		padding: 10px 16px; background: white; border-radius: 10px;
		border: 1px solid var(--border); text-decoration: none; min-width: 90px;
		transition: transform .15s, box-shadow .15s;
	}
	.aiedu-chip:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
	.chip-val { font-size: 20px; font-weight: 700; color: var(--accent, #4F46E5); }
	.chip-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
	.aiedu-quick { display: flex; gap: 8px; flex-wrap: wrap; }
	.quick-link {
		padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
		background: white; border: 1px solid var(--border); color: var(--text);
		text-decoration: none; transition: all .15s;
	}
	.quick-link:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg, #eef2ff); }

	/* Quiz Attempts */
	.attempt-list { display: flex; flex-direction: column; gap: 6px; }
	.attempt-item {
		display: flex; align-items: center; gap: 10px;
		padding: 10px 12px; border: 1px solid var(--border);
		border-radius: 9px; background: white; font-size: 13px;
	}
	.attempt-score {
		font-weight: 700; color: var(--accent); background: var(--accent-bg, #eef2ff);
		padding: 4px 10px; border-radius: 6px; font-size: 12px; flex-shrink: 0;
	}
	.attempt-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
	.attempt-title { font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.attempt-meta { font-size: 11px; color: var(--text-secondary); }
	.attempt-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

	/* Mobile */
	@media (max-width: 768px) {
		.instructor-page { padding: 16px 12px; }
		.stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
		.content-grid { grid-template-columns: 1fr; }
		.aiedu-chips { gap: 8px; }
		.aiedu-chip { min-width: 70px; padding: 8px 10px; }
		.chip-val { font-size: 16px; }
		.aiedu-quick { gap: 6px; }
		.quick-link { padding: 6px 10px; font-size: 11px; }
		.course-row { flex-direction: column; gap: 8px; }
		.course-row-stats { flex-wrap: wrap; }
		.side-panel { gap: 16px; }
	}
</style>
