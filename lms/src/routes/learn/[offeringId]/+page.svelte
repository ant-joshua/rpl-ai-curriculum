<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Card, CardContent, Button, Alert, Avatar, Badge, Progress } from '$lib/components/ui';

	let { data } = $props();

	onMount(() => {
		if (browser) loadQuestions();
	});

	let offering = $derived(data.offering);
	let instructor = $derived(data.instructor);
	let enrollment = $derived(data.enrollment);
	let tree = $derived(data.tree || []);
	let progress = $derived(data.progress || { completed: 0, total: 0, percentage: 0 });
	let assessments = $derived(data.assessments || []);
	let assignments = $derived(data.assignments || []);
	let nextLessonSlug = $derived(data.nextLessonSlug);
	let lastCompletedTitle = $derived(data.lastCompletedTitle);

	// Q&A forum state
	let questions = $state<any[]>([]);
	let showAskForm = $state(false);
	let askTitle = $state('');
	let askBody = $state('');
	let asking = $state(false);
	let qaError = $state('');
	let openQuestionId = $state<string | null>(null);
	let answersMap = $state<Record<string, any[]>>({});
	let answerText = $state('');
	let answeringId = $state<string | null>(null);

	async function loadQuestions() {
		try {
			const res = await fetch(`/api/courses/${data.offering.id}/questions`);
			const json = await res.json();
			if (json.success) questions = json.data || [];
		} catch { /* ignore */ }
	}

	async function loadAnswers(qid: string) {
		try {
			const res = await fetch(`/api/courses/${data.offering.id}/questions/${qid}/answers`);
			const json = await res.json();
			if (json.success) answersMap[qid] = json.data || [];
		} catch { /* ignore */ }
	}

	function toggleQuestion(qid: string) {
		openQuestionId = openQuestionId === qid ? null : qid;
		if (openQuestionId === qid && !answersMap[qid]) loadAnswers(qid);
	}

	async function submitQuestion() {
		if (!askTitle.trim() || !askBody.trim()) { qaError = 'Judul dan isi wajib'; return; }
		asking = true;
		qaError = '';
		try {
			const res = await fetch(`/api/courses/${data.offering.id}/questions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: askTitle, text: askBody }),
			});
			const json = await res.json();
			if (json.success) {
				askTitle = '';
				askBody = '';
				showAskForm = false;
				loadQuestions();
			} else {
				qaError = json.error || 'Gagal kirim';
			}
		} catch { qaError = 'Gagal kirim'; } finally {
			asking = false;
		}
	}

	async function submitAnswer(qid: string) {
		if (!answerText.trim()) return;
		answeringId = qid;
		try {
			const res = await fetch(`/api/courses/${data.offering.id}/questions/${qid}/answers`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: answerText }),
			});
			const json = await res.json();
			if (json.success) {
				answerText = '';
				loadAnswers(qid);
			}
		} catch { /* ignore */ } finally {
			answeringId = null;
		}
	}

	async function toggleResolved(qid: string) {
		try {
			await fetch(`/api/courses/${data.offering.id}/questions/${qid}/resolve`, { method: 'POST' });
			loadQuestions();
		} catch { /* ignore */ }
	}

	// Review state
	let reviewRating = $state(0);
	let reviewComment = $state('');
	let reviewSubmitting = $state(false);
	let reviews = $state<any[]>([]);
	let myReview = $derived(data.myReview);

	$effect(() => {
		if (data.myReview) {
			reviewRating = data.myReview.rating;
			reviewComment = data.myReview.comment || '';
		}
		// Load existing reviews
		if (data.offering?.id) {
			fetch(`/api/courses/${data.offering.id}/reviews`)
				.then(r => r.json())
				.then(j => { if (j.success) reviews = j.data || []; })
				.catch(() => {});
		}
	});

	async function submitReview() {
		if (!reviewRating) return;
		reviewSubmitting = true;
		try {
			const res = await fetch(`/api/courses/${data.offering.id}/reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
			});
			const json = await res.json();
			if (json.success) {
				const { addToast } = await import('$lib/stores/toast.svelte');
				addToast('Review tersimpan! ⭐', 'success');
				// Reload reviews
				const r2 = await fetch(`/api/courses/${data.offering.id}/reviews`).then(r => r.json());
				if (r2.success) reviews = r2.data || [];
			} else {
				const { addToast } = await import('$lib/stores/toast.svelte');
				addToast(json.error || 'Gagal simpan review', 'error');
			}
		} catch {
			const { addToast } = await import('$lib/stores/toast.svelte');
			addToast('Gagal simpan review', 'error');
		} finally {
			reviewSubmitting = false;
		}
	}

	// Expand/collapse state for module sections
	let expandedSections = $state<Set<string>>(new Set());

	function toggleSection(id: string) {
		const next = new Set(expandedSections);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedSections = next;
	}

	// Auto-expand sections that have lessons
	$effect(() => {
		if (tree.length > 0 && expandedSections.size === 0) {
			const toExpand = new Set<string>();
			function collectSections(nodes: any[]) {
				for (const n of nodes) {
					if (n.type === 'section' || n.type === 'module') {
						toExpand.add(n.id);
					}
					collectSections(n.children || []);
				}
			}
			collectSections(tree);
			expandedSections = toExpand;
		}
	});

	function instructorInitials(name: string): string {
		if (!name) return '?';
		return name.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2);
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr + 'T00:00:00Z');
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	let currentPath = $derived(String($page.url.pathname));

	let pageTitle = $derived(offering.courseTitle || offering.name || 'Kursus');
	let pageDesc = $derived(offering.courseDescription || offering.name || 'Kursus RPL AI Curriculum');
</script>

<svelte:head>
	<title>{pageTitle} — LMS RPL</title>
	<meta name="description" content={pageDesc} />
	<meta property="og:title" content="{pageTitle} — LMS RPL" />
	<meta property="og:description" content={pageDesc} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{pageTitle} — LMS RPL" />
	<meta name="twitter:description" content={pageDesc} />
</svelte:head>

<div class="learn-page">
	<!-- Course Overview Section -->
	<section class="course-overview">
		<div class="overview-header">
			<div class="course-icon-large">{offering.courseIcon}</div>
			<div class="overview-info">
				<h1>{offering.courseTitle}</h1>
				{#if offering.name !== offering.courseTitle}
					<p class="offering-name">{offering.name}</p>
				{/if}
				<p class="course-desc">{offering.courseDescription || 'Tidak ada deskripsi.'}</p>
				<div class="meta-row">
					{#if offering.category}
						<Badge variant="default">{offering.category}</Badge>
					{/if}
					{#if offering.level}
						<Badge variant="default">{offering.level}</Badge>
					{/if}
					<Badge variant="default">{progress.total} pelajaran</Badge>
					{#if offering.status}
						<Badge variant={offering.status === 'active' ? 'success' : 'default'}>
							{offering.status === 'active' ? 'Aktif' : offering.status}
						</Badge>
					{/if}
				</div>

				<!-- Enrollment status -->
				{#if enrollment}
					<Alert variant="info" class="enrollment-alert">
						Terdaftar sejak {formatDate(enrollment.enrolledAt)}
						{#if enrollment.completedAt}
							· Selesai {formatDate(enrollment.completedAt)}
						{/if}
					</Alert>
				{/if}
			</div>
		</div>

		<!-- Progress bar + ring -->
		<Card class="progress-card">
			<CardContent>
				<div class="progress-ring-row">
					<div class="progress-ring" style="--ring-pct: {progress.percentage};">
						<div class="progress-ring-inner">
							<span class="progress-ring-value">{progress.percentage}%</span>
							<span class="progress-ring-label">selesai</span>
						</div>
					</div>
					<div class="progress-ring-info">
						<div class="progress-header">
							<span class="progress-label">Progres Belajar</span>
						</div>
						<Progress value={progress.completed} max={progress.total} variant="default" size="md" showLabel={false} />
						<p class="progress-sub">{progress.completed} dari {progress.total} pelajaran selesai</p>
					</div>
				</div>

				<div class="continue-row">
					{#if nextLessonSlug}
						<Button href={`/learn/${offering.id}/lessons/${nextLessonSlug}`} variant="primary">
							Lanjut Belajar →
						</Button>
					{:else if progress.percentage === 100}
						<Button href="/my/certificates" variant="primary">
							🎓 Ambil Sertifikat
						</Button>
					{/if}
					<Button href={`/learn/${offering.id}/syllabus`} variant="secondary">
						📋 Lihat Silabus
					</Button>
				</div>

				{#if lastCompletedTitle}
					<p class="last-completed">Terakhir: {lastCompletedTitle}</p>
				{/if}
			</CardContent>
		</Card>
	</section>

	<!-- Instructor info -->
	{#if instructor}
		<section class="instructor-section">
			<h2>👨‍🏫 Pengajar</h2>
			<Card>
				<CardContent>
					<div class="instructor-info">
						<Avatar
							src={instructor.avatarUrl}
							initials={instructorInitials(instructor.name)}
							alt={instructor.name}
							size="lg"
						/>
						<div class="instructor-text">
							<a class="instructor-name" href="/instructor/{instructor.id}">{instructor.name}</a>
							{#if instructor.email}
								<span class="instructor-email">{instructor.email}</span>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	{/if}

	<!-- Live classes -->
	{#if data.liveClasses?.length > 0}
		<section class="live-section">
			<h2>📺 Kelas Live</h2>
			<div class="live-list">
				{#each data.liveClasses as lc}
					<div class="live-card">
						<div class="live-card-info">
							<strong>{lc.title}</strong>
							<span class="live-card-meta">📅 {lc.start_at?.replace('T', ' ').slice(0, 16)} · ⏱️ {lc.duration_minutes}m</span>
							{#if lc.description}<span class="live-card-desc">{lc.description}</span>{/if}
						</div>
						{#if lc.status === 'live' && lc.join_url}
							<a class="live-join-btn" href={lc.join_url} target="_blank" rel="noopener">▶ Gabung</a>
						{:else}
							<span class="live-status">Terjadwal</span>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Related courses -->
	{#if data.relatedCourses?.length > 0}
		<section class="related-section">
			<h2>🔗 Kursus Serupa</h2>
			<div class="related-grid">
				{#each data.relatedCourses as rc}
					<a class="related-card" href="/learn/{rc.id}">
						<div class="related-icon">{rc.icon}</div>
						<div class="related-info">
							<strong>{rc.courseTitle}</strong>
							<span class="related-meta">
								{#if rc.rating}★ {rc.rating}{/if}
								{#if rc.enrolledCount} · {rc.enrolledCount} siswa{/if}
							</span>
							{#if rc.instructorName}<span class="related-instructor">{rc.instructorName}</span>{/if}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Course Q&A Forum -->
	<section class="qa-section">
		<div class="qa-header">
			<h2>💬 Tanya Jawab</h2>
			{#if data.enrollment}
				<Button size="sm" variant={showAskForm ? 'secondary' : 'primary'} onclick={() => showAskForm = !showAskForm}>
					{showAskForm ? 'Batal' : '+ Tanya'}
				</Button>
			{/if}
		</div>

		{#if showAskForm}
			<div class="qa-ask-form">
				<input class="qa-input" placeholder="Judul pertanyaan" bind:value={askTitle} />
				<textarea class="qa-textarea" placeholder="Detail pertanyaan..." rows={3} bind:value={askBody}></textarea>
				{#if qaError}<p class="qa-error">{qaError}</p>{/if}
				<div class="qa-form-actions">
					<Button size="sm" onclick={submitQuestion} disabled={asking}>{asking ? 'Mengirim...' : 'Kirim Pertanyaan'}</Button>
				</div>
			</div>
		{/if}

		{#if questions.length === 0}
			<p class="qa-empty">Belum ada pertanyaan. {data.enrollment ? 'Jadi yang pertama bertanya!' : 'Terdaftar untuk bertanya.'}</p>
		{:else}
			<div class="qa-list">
				{#each questions as q}
					<div class="qa-item" class:open={openQuestionId === q.id}>
						<div class="qa-item-head" onclick={() => toggleQuestion(q.id)}>
							<div class="qa-item-info">
								<strong>{q.title}</strong>
								<span class="qa-item-meta">👤 {q.asker_name || 'User'} · {q.created_at?.replace('T', ' ').slice(0, 16)} · 💬 {q.answer_count}</span>
							</div>
							<div class="qa-item-badges">
								{#if q.is_resolved == 1}
									<span class="qa-resolved">✓ Terjawab</span>
								{/if}
								<span class="qa-chevron">{openQuestionId === q.id ? '▾' : '▸'}</span>
							</div>
						</div>
						{#if openQuestionId === q.id}
							<div class="qa-item-body">
								<p class="qa-question-text">{q.body}</p>
								{#if data.enrollment}
									<div class="qa-actions-row">
										<Button size="sm" variant="ghost" onclick={() => toggleResolved(q.id)}>
											{q.is_resolved == 1 ? '↺ Buka lagi' : '✓ Tandai Terjawab'}
										</Button>
									</div>
								{/if}

								<div class="qa-answers">
									{#each answersMap[q.id] || [] as a}
										<div class="qa-answer">
											<div class="qa-answer-head">
												<strong>{a.author_name || 'User'}</strong>
												{#if a.role === 'instructor' || a.role === 'admin'}<span class="qa-instructor-tag">Pengajar</span>{/if}
												<span class="qa-answer-date">{a.created_at?.replace('T', ' ').slice(0, 16)}</span>
											</div>
											<p class="qa-answer-text">{a.body}</p>
										</div>
									{/each}
								</div>

								{#if data.enrollment}
									<div class="qa-answer-form">
										<input class="qa-input" placeholder="Tulis jawaban..." bind:value={answerText}
											onkeydown={(e) => e.key === 'Enter' && submitAnswer(q.id)} />
										<Button size="sm" onclick={() => submitAnswer(q.id)} disabled={answeringId === q.id}>Kirim</Button>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Rating & Review -->
	<section class="review-section">
		<h2>⭐ Rating & Review</h2>
		<Card>
			<CardContent>
				{#if data.rating}
					<div class="rating-summary">
						<span class="rating-big">★ {data.rating}</span>
						<span class="rating-sub">dari {data.ratingCount} review</span>
					</div>
				{:else}
					<p class="no-rating">Belum ada review untuk kursus ini.</p>
				{/if}

				<div class="review-form">
					<h3>{data.myReview ? 'Ubah Review Kamu' : 'Kasih Rating'}</h3>
					<div class="star-input">
						{#each [1, 2, 3, 4, 5] as n}
							<button
								type="button"
								class="star-btn"
								class:selected={n <= (reviewRating || (data.myReview?.rating ?? 0))}
								onclick={() => reviewRating = n}
							>★</button>
						{/each}
						<span class="star-hint">{reviewRating || data.myReview?.rating || 0}/5</span>
					</div>
					<textarea
						class="review-comment"
						placeholder="Ceritakan pengalaman belajarmu di kursus ini..."
						bind:value={reviewComment}
						rows={3}
					></textarea>
					<button class="review-submit" onclick={submitReview} disabled={reviewSubmitting}>
						{reviewSubmitting ? 'Menyimpan...' : data.myReview ? 'Update Review' : 'Kirim Review'}
					</button>
				</div>

				{#if reviews.length > 0}
					<div class="reviews-list">
						{#each reviews as r}
							<div class="review-item">
								<div class="review-head">
									<strong>{r.display_name || 'Student'}</strong>
									<span class="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
								</div>
								{#if r.comment}<p class="review-comment-text">{r.comment}</p>{/if}
								<span class="review-date">{r.created_at?.slice(0, 10)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</section>

	<!-- Module/Lesson Tree -->
	<section class="modules-section">
		<h2>📖 Modul & Pelajaran</h2>

		{#if tree.length === 0}
			<Card>
				<CardContent>
					<div class="empty-modules">
						<p>Belum ada modul untuk kursus ini.</p>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="module-tree">
				{#each tree as section}
					<div class="module-card" class:expanded={expandedSections.has(section.id)}>
						<button
							class="module-header"
							onclick={() => toggleSection(section.id)}
							aria-expanded={expandedSections.has(section.id)}
						>
							<div class="module-title-row">
								<span class="module-expand-icon">
									{expandedSections.has(section.id) ? '▼' : '▶'}
								</span>
								<span class="section-type-icon">
									{section.type === 'section' ? '📂' : '📦'}
								</span>
								<div class="module-title-text">
									<span class="module-title">{section.title}</span>
									{#if section.subtitle}
										<span class="module-subtitle">{section.subtitle}</span>
									{/if}
								</div>
							</div>
							{#if section.duration_min}
								<span class="module-duration">⏱ {section.duration_min}m</span>
							{/if}
						</button>

						{#if expandedSections.has(section.id) && section.children?.length > 0}
							<div class="lesson-list">
								{#each section.children as lesson}
									{#if lesson.type === 'lesson'}
										<a
											href={lesson.isLocked ? '#' : `/learn/${offering.id}/lessons/${lesson.slug}`}
											class="lesson-item"
											class:completed={lesson.isCompleted}
											class:locked={lesson.isLocked}
											tabindex={lesson.isLocked ? -1 : 0}
										>
											<span class="lesson-status-icon">
												{#if lesson.isCompleted}
													✅
												{:else if lesson.isLocked}
													🔒
												{:else}
													<span class="lesson-num">{section.children.filter((c: any) => c.type === 'lesson').indexOf(lesson) + 1}</span>
												{/if}
											</span>
											<div class="lesson-body">
												<span class="lesson-title">{lesson.title}</span>
												<div class="lesson-meta">
													{#if lesson.duration_min}
														<span class="lesson-duration">⏱ {lesson.duration_min}m</span>
													{/if}
													{#if lesson.is_optional}
														<span class="optional-badge">⚡ Tambahan</span>
													{/if}
													{#if lesson.isCompleted}
														<span class="completed-badge">✓ Selesai</span>
													{/if}
												</div>
												{#if lesson.isLocked && lesson.unlock_days}
													<p class="lock-reason">🔒 Terkunci</p>
												{/if}
											</div>
											{#if !lesson.isLocked && !lesson.isCompleted}
												<span class="lesson-arrow">→</span>
											{/if}
										</a>
									{/if}
								{/each}
							</div>
						{/if}

						<!-- Nested sections (modules inside sections) -->
						{#if expandedSections.has(section.id) && section.children?.length > 0}
							{#each section.children as child}
								{#if child.type !== 'lesson'}
									<div class="nested-section">
										<div class="nested-header">
											<span class="nested-icon">📁</span>
											<span class="nested-title">{child.title}</span>
											{#if child.duration_min}
												<span class="nested-duration">⏱ {child.duration_min}m</span>
											{/if}
										</div>
										{#if child.children?.length > 0}
											<div class="lesson-list">
												{#each child.children as nestedLesson}
													{#if nestedLesson.type === 'lesson'}
														<a
															href={nestedLesson.isLocked ? '#' : `/learn/${offering.id}/lessons/${nestedLesson.slug}`}
															class="lesson-item"
															class:completed={nestedLesson.isCompleted}
															class:locked={nestedLesson.isLocked}
															tabindex={nestedLesson.isLocked ? -1 : 0}
														>
															<span class="lesson-status-icon">
																{#if nestedLesson.isCompleted}
																	✅
																{:else if nestedLesson.isLocked}
																	🔒
																{:else}
																	<span class="lesson-num">{child.children.filter((c: any) => c.type === 'lesson').indexOf(nestedLesson) + 1}</span>
																{/if}
															</span>
															<div class="lesson-body">
																<span class="lesson-title">{nestedLesson.title}</span>
																<div class="lesson-meta">
																	{#if nestedLesson.duration_min}
																		<span class="lesson-duration">⏱ {nestedLesson.duration_min}m</span>
																	{/if}
																	{#if nestedLesson.is_optional}
																		<span class="optional-badge">⚡ Tambahan</span>
																	{/if}
																	{#if nestedLesson.isCompleted}
																		<span class="completed-badge">✓ Selesai</span>
																	{/if}
																</div>
															</div>
														</a>
													{/if}
												{/each}
											</div>
										{/if}
									</div>
								{/if}
							{/each}
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Quick Links to Assessments & Assignments -->
	<section class="quick-links">
		<div class="quick-link-column">
			<h2>📋 Penilaian</h2>
			{#if assessments.length === 0}
				<Card>
					<CardContent>
						<p class="empty-quick">Belum ada penilaian.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="quick-list">
					{#each assessments as a}
						<a href={`/my/assessments/${a.id}`} class="quick-item">
							<span class="quick-title">{a.title}</span>
							<span class="quick-type">{a.type}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="quick-link-column">
			<h2>📂 Tugas</h2>
			{#if assignments.length === 0}
				<Card>
					<CardContent>
						<p class="empty-quick">Belum ada tugas.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="quick-list">
					{#each assignments as a}
						<a href={`/my/assignments/${a.id}`} class="quick-item">
							<span class="quick-title">{a.title}</span>
							<span class="quick-type">{a.submission_type}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>

<style>
	.learn-page {
		max-width: 860px;
		margin: 0 auto;
		padding: 20px 16px 64px;
		animation: fadeIn 0.3s ease both;
	}

	/* Overview header */
	.course-overview {
		margin-bottom: 28px;
	}

	.overview-header {
		display: flex;
		gap: 20px;
		margin-bottom: 20px;
	}

	.course-icon-large {
		font-size: 64px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.06);
		border-radius: 12px;
		flex-shrink: 0;
	}

	.overview-info { flex: 1; min-width: 0; }

	.overview-info h1 {
		font-size: 24px;
		font-weight: 590;
		margin: 0 0 2px;
		color: #1a1a2e;
		font-feature-settings: 'cv01', 'ss03';
		letter-spacing: -0.288px;
	}

	.offering-name {
		font-size: 14px;
		color: #64748b;
		margin: 0 0 8px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.course-desc {
		font-size: 14px;
		line-height: 1.6;
		color: #64748b;
		margin: 0 0 12px;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 12px;
	}

	.enrollment-alert {
		margin-top: 8px;
		font-size: 13px;
	}

	/* Progress card */
	.progress-card {
		margin-bottom: 20px;
	}
	.progress-ring-row { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
	.progress-ring-info { flex: 1; }
	.progress-ring {
		width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0;
		background: conic-gradient(var(--accent) calc(var(--ring-pct) * 1%), rgba(0,0,0,0.06) 0);
		display: flex; align-items: center; justify-content: center;
		position: relative;
		transition: background 0.6s ease;
	}
	.progress-ring::before {
		content: ''; position: absolute; inset: 10px;
		background: var(--surface); border-radius: 50%;
	}
	.progress-ring-inner { position: relative; text-align: center; }
	.progress-ring-value { font-size: 20px; font-weight: 700; color: var(--text); display: block; }
	.progress-ring-label { font-size: 11px; color: var(--text-secondary); }
	.progress-ring-row .progress-header { margin-bottom: 8px; }

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.progress-label {
		font-weight: 510;
		color: #64748b;
		font-size: 14px;
		font-feature-settings: 'cv01', 'ss03';
	}
	.progress-pct {
		font-weight: 590;
		color: #4F46E5;
		font-size: 18px;
		font-feature-settings: 'cv01', 'ss03';
	}
	.progress-sub {
		font-size: 12px;
		color: #94a3b8;
		margin: 8px 0 0;
		font-feature-settings: 'cv01', 'ss03';
	}

	.continue-row {
		display: flex;
		gap: 10px;
		margin-top: 14px;
		flex-wrap: wrap;
	}

	.last-completed {
		font-size: 12px;
		color: #94a3b8;
		margin: 10px 0 0;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Instructor */
	.instructor-section {
		margin-bottom: 28px;
	}

	/* Live classes */
	.live-section { margin-bottom: 28px; }
	.live-section h2 { font-size: 18px; margin-bottom: 12px; }
	.live-list { display: flex; flex-direction: column; gap: 8px; }
	.live-card {
		display: flex; align-items: center; justify-content: space-between;
		gap: 12px; padding: 12px 16px;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 10px;
	}
	.live-card-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
	.live-card-meta { font-size: 12px; color: var(--text-muted); }
	.live-card-desc { font-size: 13px; color: var(--text-secondary); }
	.live-join-btn {
		padding: 6px 14px; background: #2563eb; color: white;
		border-radius: 8px; font-size: 13px; font-weight: 600;
		text-decoration: none; white-space: nowrap;
	}
	.live-status { font-size: 12px; color: var(--text-muted); font-weight: 600; }

	/* Related courses */
	.related-section { margin-bottom: 28px; }
	.related-section h2 { font-size: 18px; margin-bottom: 12px; }
	.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
	.related-card {
		display: flex; align-items: center; gap: 12px; padding: 12px 14px;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 10px; text-decoration: none; color: inherit;
		transition: border-color 0.15s, transform 0.15s;
	}
	.related-card:hover { border-color: var(--accent); transform: translateY(-1px); }
	.related-icon { font-size: 28px; flex-shrink: 0; }
	.related-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.related-info strong { font-size: 13px; line-height: 1.35; }
	.related-meta { font-size: 12px; color: var(--text-muted); }
	.related-instructor { font-size: 12px; color: var(--text-secondary); }

	/* Q&A Forum */
	.qa-section { margin-bottom: 28px; }
	.qa-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
	.qa-header h2 { font-size: 18px; margin: 0; }
	.qa-empty { color: var(--text-muted); font-size: 14px; }
	.qa-list { display: flex; flex-direction: column; gap: 8px; }
	.qa-item { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
	.qa-item.open { border-color: var(--accent); }
	.qa-item-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; cursor: pointer; }
	.qa-item-head:hover { background: var(--surface); }
	.qa-item-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.qa-item-info strong { font-size: 14px; }
	.qa-item-meta { font-size: 12px; color: var(--text-muted); }
	.qa-item-badges { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
	.qa-resolved { font-size: 11px; font-weight: 700; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 999px; }
	.qa-chevron { color: var(--text-muted); font-size: 12px; }
	.qa-item-body { padding: 0 16px 16px; border-top: 1px solid var(--border); }
	.qa-question-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 12px 0; }
	.qa-actions-row { margin-bottom: 10px; }
	.qa-answers { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
	.qa-answer { padding: 10px 12px; background: var(--surface); border-radius: 8px; }
	.qa-answer-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
	.qa-answer-head strong { font-size: 13px; }
	.qa-instructor-tag { font-size: 10px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 999px; }
	.qa-answer-date { font-size: 11px; color: var(--text-muted); margin-left: auto; }
	.qa-answer-text { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
	.qa-answer-form { display: flex; gap: 8px; align-items: center; }
	.qa-ask-form { display: flex; flex-direction: column; gap: 8px; padding: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 12px; }
	.qa-input {
		flex: 1; padding: 8px 12px; border: 1px solid var(--border);
		border-radius: 8px; font-size: 13px; background: white; color: var(--text);
	}
	.qa-textarea { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: white; color: var(--text); resize: vertical; font-family: inherit; }
	.qa-error { font-size: 12px; color: #dc2626; margin: 0; }
	.qa-form-actions { display: flex; justify-content: flex-end; }

	/* Reviews */
	.review-section { margin-bottom: 28px; }
	.review-section h2 { font-size: 18px; margin-bottom: 12px; }
	.rating-summary { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }
	.rating-big { font-size: 28px; font-weight: 800; color: #f59e0b; }
	.rating-sub { font-size: 13px; color: var(--text-muted); }
	.no-rating { color: var(--text-muted); font-size: 14px; }
	.review-form { margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 10px; }
	.review-form h3 { font-size: 14px; margin: 0 0 8px; }
	.star-input { display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
	.star-btn {
		background: none; border: none; font-size: 26px; cursor: pointer;
		color: #d1d5db; padding: 0; line-height: 1; transition: color 0.15s;
	}
	.star-btn.selected { color: #f59e0b; }
	.star-hint { font-size: 13px; color: var(--text-muted); margin-left: 8px; }
	.review-comment {
		width: 100%; padding: 8px 12px; border: 1px solid var(--border);
		border-radius: 8px; font-size: 14px; font-family: inherit;
		background: white; resize: vertical; box-sizing: border-box;
	}
	.review-submit {
		margin-top: 10px; padding: 8px 20px; background: #f59e0b; color: white;
		border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
	}
	.review-submit:hover { background: #d97706; }
	.reviews-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
	.review-item { padding: 10px 0; border-top: 1px solid var(--border); }
	.review-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
	.review-head strong { font-size: 13px; }
	.review-stars { color: #f59e0b; font-size: 13px; }
	.review-comment-text { font-size: 13px; color: var(--text-secondary); margin: 0 0 4px; }
	.review-date { font-size: 11px; color: var(--text-muted); }

	.instructor-section h2 {
		font-size: 17px;
		font-weight: 590;
		margin: 0 0 10px;
		font-feature-settings: 'cv01', 'ss03';
		color: #1a1a2e;
	}

	.instructor-info {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.instructor-text {
		display: flex;
		flex-direction: column;
	}

	.instructor-name {
		font-size: 15px;
		font-weight: 510;
		color: #64748b;
		text-decoration: none;
		font-feature-settings: 'cv01', 'ss03';
	}
	.instructor-name:hover { color: var(--accent); text-decoration: underline; }

	.instructor-email {
		font-size: 13px;
		color: #94a3b8;
	}

	/* Modules section */
	.modules-section {
		margin-bottom: 28px;
	}

	.modules-section h2 {
		font-size: 17px;
		font-weight: 590;
		margin: 0 0 14px;
		font-feature-settings: 'cv01', 'ss03';
		color: #1a1a2e;
	}

	.module-tree {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.module-card {
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.06);
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.15s ease;
	}

	.module-card:hover {
		border-color: rgba(79,70,229,0.2);
	}

	.module-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 14px 16px;
		background: none;
		border: none;
		cursor: pointer;
		color: #1a1a2e;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		transition: background 0.15s ease;
		gap: 12px;
	}

	.module-header:hover {
		background: rgba(0,0,0,0.04);
	}

	.module-title-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}

	.module-expand-icon {
		font-size: 10px;
		color: #94a3b8;
		width: 12px;
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.section-type-icon {
		font-size: 20px;
		flex-shrink: 0;
	}

	.module-title-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.module-title {
		font-size: 14px;
		font-weight: 510;
		color: #1a1a2e;
		font-feature-settings: 'cv01', 'ss03';
	}

	.module-subtitle {
		font-size: 12px;
		color: #94a3b8;
	}

	.module-duration {
		font-size: 12px;
		color: #94a3b8;
		white-space: nowrap;
		flex-shrink: 0;
		font-feature-settings: 'cv01', 'ss03';
	}

	/* Lesson list */
	.lesson-list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid rgba(0,0,0,0.08);
	}

	.lesson-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px 12px 48px;
		text-decoration: none;
		border-bottom: 1px solid rgba(0,0,0,0.04);
		transition: background 0.12s ease;
	}

	.lesson-item:last-child {
		border-bottom: none;
	}

	.lesson-item:hover:not(.locked) {
		background: rgba(79,70,229,0.08);
	}

	.lesson-item.locked {
		opacity: 0.5;
		cursor: default;
	}

	.lesson-item.completed {
		background: rgba(16,185,129,0.05);
	}

	.lesson-status-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-size: 16px;
	}

	.lesson-num {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #4F46E5;
		color: #fff;
		font-size: 11px;
		font-weight: 590;
		display: flex;
		align-items: center;
		justify-content: center;
		font-feature-settings: 'cv01', 'ss03';
	}

	.lesson-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.lesson-title {
		font-size: 14px;
		font-weight: 510;
		color: #64748b;
		margin-bottom: 2px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.lesson-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}

	.lesson-duration,
	.optional-badge,
	.completed-badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 9999px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.lesson-duration {
		background: rgba(0,0,0,0.04);
		color: #94a3b8;
	}

	.optional-badge {
		background: rgba(16,185,129,0.12);
		color: #10b981;
	}

	.completed-badge {
		background: rgba(79,70,229,0.12);
		color: #4F46E5;
	}

	.lock-reason {
		font-size: 11px;
		color: #94a3b8;
		margin: 2px 0 0;
	}

	.lesson-arrow {
		color: #94a3b8;
		font-size: 16px;
		flex-shrink: 0;
	}

	/* Nested sections */
	.nested-section {
		border-top: 1px solid rgba(0,0,0,0.08);
	}

	.nested-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px 10px 40px;
		font-size: 13px;
		font-weight: 510;
		color: #64748b;
		background: rgba(0,0,0,0.02);
		font-feature-settings: 'cv01', 'ss03';
	}

	.nested-icon { font-size: 14px; }
	.nested-title { flex: 1; }
	.nested-duration { font-size: 11px; }

	/* Quick links */
	.quick-links {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.quick-link-column h2 {
		font-size: 17px;
		font-weight: 590;
		margin: 0 0 10px;
		font-feature-settings: 'cv01', 'ss03';
		color: #1a1a2e;
	}

	.quick-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.quick-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: rgba(0,0,0,0.02);
		border: 1px solid rgba(0,0,0,0.08);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.quick-item:hover {
		border-color: rgba(79,70,229,0.2);
		background: rgba(0,0,0,0.04);
	}

	.quick-title {
		font-size: 13px;
		font-weight: 510;
		color: #64748b;
		font-feature-settings: 'cv01', 'ss03';
	}

	.quick-type {
		font-size: 11px;
		color: #94a3b8;
		background: rgba(0,0,0,0.04);
		padding: 2px 8px;
		border-radius: 9999px;
		font-feature-settings: 'cv01', 'ss03';
	}

	.empty-modules {
		padding: 24px;
		text-align: center;
		color: #94a3b8;
	}

	.empty-quick {
		margin: 0;
		font-size: 13px;
		color: #94a3b8;
		text-align: center;
		padding: 8px;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.overview-header {
			flex-direction: column;
		}

		.course-icon-large {
			font-size: 48px;
			width: 64px;
			height: 64px;
		}

		.overview-info h1 {
			font-size: 20px;
			letter-spacing: -0.24px;
		}

		.quick-links {
			grid-template-columns: 1fr;
		}

		.lesson-item {
			padding-left: 40px;
		}

		.module-header {
			padding: 12px 14px;
		}
	}
</style>
