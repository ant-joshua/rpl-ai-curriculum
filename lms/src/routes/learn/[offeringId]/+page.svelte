<script lang="ts">
	import { page } from '$app/stores';
	import { Card, CardContent, Button, Alert, Avatar, Badge, Progress } from '$lib/components/ui';

	let { data } = $props();

	let offering = $derived(data.offering);
	let instructor = $derived(data.instructor);
	let enrollment = $derived(data.enrollment);
	let tree = $derived(data.tree || []);
	let progress = $derived(data.progress || { completed: 0, total: 0, percentage: 0 });
	let assessments = $derived(data.assessments || []);
	let assignments = $derived(data.assignments || []);
	let nextLessonSlug = $derived(data.nextLessonSlug);
	let lastCompletedTitle = $derived(data.lastCompletedTitle);

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

		<!-- Progress bar -->
		<Card class="progress-card">
			<CardContent>
				<div class="progress-header">
					<span class="progress-label">Progres Belajar</span>
					<span class="progress-pct">{progress.percentage}%</span>
				</div>
				<Progress value={progress.completed} max={progress.total} variant="default" size="md" showLabel={false} />
				<p class="progress-sub">{progress.completed} dari {progress.total} pelajaran selesai</p>

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
							<span class="instructor-name">{instructor.name}</span>
							{#if instructor.email}
								<span class="instructor-email">{instructor.email}</span>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	{/if}

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
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		flex-shrink: 0;
	}

	.overview-info { flex: 1; min-width: 0; }

	.overview-info h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 2px;
		color: var(--text);
	}

	.offering-name {
		font-size: 14px;
		color: var(--text-secondary);
		margin: 0 0 8px;
	}

	.course-desc {
		font-size: 14px;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0 0 12px;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}

	.enrollment-alert {
		margin-top: 8px;
		font-size: 13px;
	}

	/* Progress card */
	.progress-card {
		margin-top: 16px;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.progress-label { font-weight: 600; color: var(--text); font-size: 14px; }
	.progress-pct { font-weight: 700; color: var(--accent); font-size: 18px; }
	.progress-sub { font-size: 12px; color: var(--text-secondary); margin: 8px 0 0; }

	.continue-row {
		display: flex;
		gap: 10px;
		margin-top: 14px;
		flex-wrap: wrap;
	}

	.last-completed {
		font-size: 12px;
		color: var(--text-secondary);
		margin: 10px 0 0;
	}

	/* Instructor */
	.instructor-section {
		margin-bottom: 28px;
	}

	.instructor-section h2 {
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 10px;
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
		font-weight: 600;
		color: var(--text);
	}

	.instructor-email {
		font-size: 13px;
		color: var(--text-secondary);
	}

	/* Modules section */
	.modules-section {
		margin-bottom: 28px;
	}

	.modules-section h2 {
		font-size: 17px;
		font-weight: 600;
		margin: 0 0 14px;
	}

	.module-tree {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.module-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.module-card:hover {
		border-color: var(--accent-dim);
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
		color: var(--text);
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		transition: background 0.15s;
		gap: 12px;
	}

	.module-header:hover {
		background: var(--hover);
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
		color: var(--text-secondary);
		width: 12px;
		flex-shrink: 0;
		transition: transform 0.15s;
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
		font-weight: 600;
		color: var(--text);
	}

	.module-subtitle {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.module-duration {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Lesson list */
	.lesson-list {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--border);
	}

	.lesson-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px 12px 48px;
		text-decoration: none;
		border-bottom: 1px solid var(--border);
		transition: background 0.12s;
	}

	.lesson-item:last-child {
		border-bottom: none;
	}

	.lesson-item:hover:not(.locked) {
		background: color-mix(in srgb, var(--accent) 8%, transparent);
	}

	.lesson-item.locked {
		opacity: 0.5;
		cursor: default;
	}

	.lesson-item.completed {
		background: color-mix(in srgb, #22c55e 5%, transparent);
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
		background: var(--accent);
		color: #fff;
		font-size: 11px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lesson-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.lesson-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		margin-bottom: 2px;
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
		border-radius: 99px;
	}

	.lesson-duration {
		background: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.optional-badge {
		background: color-mix(in srgb, #22c55e 15%, transparent);
		color: #22c55e;
	}

	.completed-badge {
		background: color-mix(in srgb, #3b82f6 15%, transparent);
		color: #3b82f6;
	}

	.lock-reason {
		font-size: 11px;
		color: var(--text-secondary);
		margin: 2px 0 0;
	}

	.lesson-arrow {
		color: var(--text-secondary);
		font-size: 16px;
		flex-shrink: 0;
	}

	/* Nested sections */
	.nested-section {
		border-top: 1px solid var(--border);
	}

	.nested-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px 10px 40px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-secondary);
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
		font-weight: 600;
		margin: 0 0 10px;
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
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		text-decoration: none;
		transition: all 0.12s;
	}

	.quick-item:hover {
		border-color: var(--accent);
		background: var(--hover);
	}

	.quick-title {
		font-size: 13px;
		font-weight: 500;
		color: var(--text);
	}

	.quick-type {
		font-size: 11px;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 2px 8px;
		border-radius: 99px;
	}

	.empty-modules {
		padding: 24px;
		text-align: center;
		color: var(--text-secondary);
	}

	.empty-quick {
		margin: 0;
		font-size: 13px;
		color: var(--text-secondary);
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
