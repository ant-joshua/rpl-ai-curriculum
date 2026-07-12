<script lang="ts">
	import NotesPanel from '$lib/components/NotesPanel.svelte';
import FontSizeControl from '$lib/components/FontSizeControl.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';
	import { modules, type Module } from '$lib/stores/modules';
import { getCaseStudyByModule } from '$lib/stores/case-studies';
	import { progress } from '$lib/stores/progress.svelte';
	import { activity } from '$lib/stores/activity.svelte';
	import { lastActivity } from '$lib/stores/last-activity.svelte';
	import { notes } from '$lib/stores/notes.svelte';
import { fontSizeStore } from '$lib/stores/font-size.svelte';
	import { parseMarkdown, stripFrontmatter, hasExercise, getExerciseStarterCode } from '$lib/utils/markdown';
	import { onMount } from 'svelte';
	import QuizCard from '$lib/components/QuizCard.svelte';
	import type { QuizQuestion } from '$lib/utils/quiz';
	import { parseQuizHtml } from '$lib/utils/quiz';
	import { getVideosByModule, type VideoEntry } from '$lib/stores/videos';
	import { discussions } from '$lib/stores/discussions.svelte';
	import { getDeviceId } from '$lib/utils/api';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let slug = $derived(data.slug);

	let mod = $state<Module | null>(null);
	let activeSession = $state<string | null>(null);
	let readmeHtml = $state<string>('');
	let sessionHtml = $state<string>('');
	let loading = $state(true);
	let errorMsg = $state('');
	let pdfIndex = $state<Record<string, boolean>>({});

	// Share link + toast
	let toastMsg = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	async function copyShareLink() {
		const url = `${window.location.origin}/module/${slug}`;
		try {
			await navigator.clipboard.writeText(url);
			showToast('Tersalin!');
		} catch {
			showToast('Gagal menyalin');
		}
	}

	function showToast(msg: string) {
		clearTimeout(toastTimer);
		toastMsg = msg;
		toastTimer = setTimeout(() => { toastMsg = ''; }, 2000);
	}

	// Next / Prev module navigation
	let moduleIndex = $derived(modules.findIndex(m => m.slug === mod?.slug));
	let prevModule = $derived(moduleIndex > 0 ? modules[moduleIndex - 1] : undefined);
	let nextModule = $derived(moduleIndex >= 0 && moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : undefined);

	// All sessions completed?
	let allSessionsCompleted = $derived(
		mod && mod.sessions.length > 0 && completedSessions.length === mod.sessions.length
	);

	// Content cache from static JSON (no API needed — works on CF Pages)
	let contentCache = $state<Record<string, string>>({});
	let sessionWordCounts = $state<Record<string, number>>({});
	let totalWords = $state(0);
	let readingTime = $derived(Math.max(1, Math.round(totalWords / 200)));

	// Estimated reading time for current session (Indonesian WPM: 200)
	let sessionWordCount = $derived.by(() => {
		if (!sessionHtml) return 0;
		const text = sessionHtml.replace(/<[^>]*>/g, '').trim();
		return text ? text.split(/\s+/).length : 0;
	});
	let sessionReadingTime = $derived(sessionWordCount > 0 ? Math.max(1, Math.round(sessionWordCount / 200)) : null);

	// Load content from static JSON
	async function loadContent() {
		mod = modules.find(m => m.slug === slug) ?? null;

		if (!mod) {
			errorMsg = 'Modul tidak ditemukan';
			loading = false;
			return;
		}

		progress.setLastRead(slug);

		try {
			const res = await fetch(`/content/${mod.dirName}.json`);
			if (!res.ok) throw new Error('Gagal memuat konten');
			const json: Record<string, string> = await res.json();
			contentCache = json;
			loadQuizFromContent(json);

			const readmeContent = json['README'] || '';
			const cleaned = stripFrontmatter(readmeContent);
			readmeHtml = parseMarkdown(cleaned);

			// Compute word counts
			const wordCounts: Record<string, number> = {};
			let total = 0;
			for (const session of mod.sessions) {
				const content = json[session.id];
				if (content) {
					const cleanedContent = content.replace(/^---[\s\S]*?---\n*/, '').trim();
					const wc = cleanedContent ? cleanedContent.split(/\s+/).length : 0;
					wordCounts[session.id] = wc;
					total += wc;
				}
			}
			sessionWordCounts = wordCounts;
			totalWords = total;
		} catch (e) {
			errorMsg = 'Gagal memuat konten modul';
		}

		loading = false;
	}

	// Load PDF index to know which PDFs exist
	async function loadPdfIndex() {
		try {
			const res = await fetch('/pdfs/index.json');
			if (res.ok) {
				const idx = await res.json();
				const map: Record<string, boolean> = {};
				for (const f of idx.files) {
					map[f.dirName] = true;
				}
				pdfIndex = map;
			}
		} catch { /* silent fail — PDF button just won't show */ }
	}

	async function loadSession(sessionId: string) {
		if (!mod) return;
		activeSession = sessionId;
		sessionHtml = '';
		showExercise = false;
		showQuiz = false;
		const content = contentCache[sessionId];
		if (content) {
			const cleaned = stripFrontmatter(content);
			sessionHtml = parseMarkdown(cleaned);

			// Log view activity
			activity.logAction('view', mod.slug, sessionId);

			// Save last-activity for "Lanjut Belajar" on dashboard
			lastActivity.save(mod.slug, sessionId);

			// Detect if session has exercises
			if (hasExercise(cleaned)) {
				const starterCode = getExerciseStarterCode(cleaned);
				if (starterCode) {
					exerciseCode = starterCode;
					// Detect language from the code block
					const codeMatch = cleaned.match(/```(\w+)\n/);
					if (codeMatch) {
						let lang = codeMatch[1].toLowerCase();
						if (lang === 'js') lang = 'javascript';
						if (lang === 'ts') lang = 'typescript';
						exerciseLang = lang;
					}
				}
			}
		} else {
			sessionHtml = '<p class="error">Konten sesi tidak ditemukan</p>';
		}
	}

	function toggleComplete(sessionId: string | null) {
		if (!mod || !sessionId) return;
		progress.toggleSession(mod.slug, sessionId);
		// Log complete activity (log after toggling — it now counts as completed)
		if (progress.isSessionCompleted(mod.slug, sessionId)) {
			activity.logAction('complete', mod.slug, sessionId);
			// Trigger celebration animation
			celebrateSession = sessionId;
		}
	}

	let moduleProgress = $derived(mod ? progress.getModuleProgress(mod.slug) : 0);
	let completedSessions = $derived(mod ? progress.getCompletedSessions(mod.slug) : []);
	let showNotes = $state(false);
	let showQuiz = $state(false);
	let showExercise = $state(false);
	let showVideos = $state(false);
	let exerciseCode = $state('');
	let exerciseLang = $state('javascript');
	let quizQuestions = $state<QuizQuestion[]>([]);
	let moduleVideos = $derived(mod ? getVideosByModule(mod.slug) : []);
	let selectedVideo = $state<VideoEntry | null>(null);
	let scrollProgress = $state(0);
	let celebrateSession = $state<string | null>(null);

	// Exercises for this module
	let moduleExercises = $state<any[]>([]);

	$effect(() => {
		async function loadExercises() {
			if (!mod) return;
			try {
				const res = await fetch('/content/exercises.json');
				const data = await res.json();
				if (data.grouped && data.grouped[mod.slug]) {
					moduleExercises = data.grouped[mod.slug];
				}
			} catch {
				// silent fail
			}
		}
		loadExercises();
	});
	let showDiscussions = $state(false);
	let discussionInput = $state('');
	let replyToId = $state<string | null>(null);

	function formatTime(iso: string): string {
		try {
			const date = new Date(iso + 'Z');
			const now = new Date();
			const diff = now.getTime() - date.getTime();
			if (diff < 60000) return 'baru saja';
			if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
			if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
			return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
		} catch {
			return iso;
		}
	}

	// Auto-remove celebration after animation completes
	$effect(() => {
		if (celebrateSession) {
			const timer = setTimeout(() => {
				celebrateSession = null;
			}, 400);
			return () => clearTimeout(timer);
		}
	});

	// Load discussions when panel opens
	$effect(() => {
		if (showDiscussions && mod) {
			discussions.loadComments(mod.slug, activeSession ?? undefined);
		}
	});

	// Parse quiz content from loaded JSON
	function loadQuizFromContent(json: Record<string, string>) {
		const quizContent = json['quiz'];
		if (quizContent) {
			const parsed = parseQuizHtml(quizContent);
			if (parsed.length > 0) {
				quizQuestions = parsed;
			}
		}
	}

	// --- Session position indicator ---
	let currentSessionIndex = $derived(
		mod && activeSession ? mod.sessions.findIndex(s => s.id === activeSession) : -1
	);
	let totalSessions = $derived(mod ? mod.sessions.length : 0);
	let sessionPosition = $derived(
		currentSessionIndex >= 0 ? `Sesi ${currentSessionIndex + 1}/${totalSessions}` : ''
	);

	// --- Scroll persistence ---
	function getScrollKey(sessionId: string | null): string {
		if (!sessionId) return '';
		return `lms-scroll-${slug}-${sessionId}`;
	}

	// Scroll on session change: restore saved position, or scroll to content top
	$effect(() => {
		if (!activeSession) return;
		const key = getScrollKey(activeSession);
		if (!key) return;
		const saved = localStorage.getItem(key);
		requestAnimationFrame(() => {
			if (saved) {
				window.scrollTo({ top: parseInt(saved, 10), behavior: 'smooth' });
			} else {
				document.querySelector('.content-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});

	// Debounced scroll position save + reading progress
	let scrollTimer: ReturnType<typeof setTimeout> | undefined;
	function handleScroll() {
		if (!activeSession) return;
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(() => {
			localStorage.setItem(getScrollKey(activeSession), String(window.scrollY));
		}, 300);
		const scrollEl = document.documentElement;
		const pct = (scrollEl.scrollTop / (scrollEl.scrollHeight - scrollEl.clientHeight)) * 100;
		scrollProgress = Math.min(100, Math.max(0, pct));
	}

	// Keyboard shortcuts: arrows for prev/next, letters for toggles
	function handleKeydown(e: KeyboardEvent) {
		if (!mod || !activeSession) return;
		// Ignore if modifier keys pressed (mobile keyboards, etc.)
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		// Ignore if focus is on input/textarea
		const tag = (e.target as HTMLElement)?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA') return;
		if (e.key === 'ArrowLeft') {
			const prevIdx = currentSessionIndex - 1;
			if (prevIdx >= 0) {
				e.preventDefault();
				loadSession(mod.sessions[prevIdx].id);
			}
		} else if (e.key === 'ArrowRight') {
			const nextIdx = currentSessionIndex + 1;
			if (nextIdx < mod.sessions.length) {
				e.preventDefault();
				loadSession(mod.sessions[nextIdx].id);
			}
		} else if (e.key === 'n') {
			showNotes = !showNotes;
		} else if (e.key === 'q') {
			showQuiz = !showQuiz;
		} else if (e.key === 'e') {
			showExercise = !showExercise;
		} else if (e.key === 'v') {
			showVideos = !showVideos;
		} else if (e.key === 'c') {
			showDiscussions = !showDiscussions;
		} else if (e.key === 'd') {
			toggleComplete(activeSession);
		}
	}

	onMount(() => {
		loadContent();
		loadPdfIndex();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Reading progress bar -->
{#if activeSession}
	<div
		class="reading-progress"
		style="width: {scrollProgress}%"
		role="progressbar"
		aria-valuenow={scrollProgress}
		aria-valuemin={0}
		aria-valuemax={100}
	></div>
{/if}

<div class="module-page">
	{#if loading}
		<div class="skeleton-loading" in:fade={{ duration: 150 }}>
			<!-- Skeleton: header -->
			<div class="module-header" style="margin-bottom: 24px;">
				<Skeleton width="100px" height="16px" />
				<div style="margin-bottom: 12px;"></div>
				<Skeleton width="60%" height="26px" />
				<div style="margin-bottom: 8px;"></div>
				<Skeleton width="40%" height="16px" />
				<div style="margin-bottom: 12px;"></div>
				<Skeleton width="100%" height="8px" borderRadius="4px" />
			</div>

			<!-- Skeleton: layout with sidebar + content -->
			<div class="module-layout" style="display: flex; gap: 24px; align-items: flex-start;">
				<!-- Sidebar skeleton -->
				<aside class="session-sidebar" style="width: 240px; min-width: 240px; padding: 16px; background: transparent; border: none;">
					<Skeleton width="100px" height="16px" />
					<div style="margin-bottom: 16px;"></div>
					{#each [1, 2, 3, 4, 5] as _}
						<Skeleton width="100%" height="32px" borderRadius="8px" />
						<div style="margin-bottom: 4px;"></div>
					{/each}
				</aside>

				<!-- Content area skeleton -->
				<div class="content-area" style="flex: 1;">
					<Skeleton width="180px" height="20px" />
					<div style="margin-bottom: 20px;"></div>
					{#each [1, 2, 3, 4, 5, 6] as i}
						<Skeleton width="{70 + (i * 4)}%" height="14px" />
						<div style="margin-bottom: 10px;"></div>
					{/each}
					<Skeleton width="45%" height="14px" />
					<div style="margin-bottom: 24px;"></div>
					<Skeleton width="100%" height="120px" borderRadius="10px" />
					<div style="margin-bottom: 16px;"></div>
					{#each [1, 2, 3, 4] as i}
						<Skeleton width="{60 + (i * 7)}%" height="14px" />
						<div style="margin-bottom: 10px;"></div>
					{/each}
				</div>
			</div>
		</div>
	{:else if errorMsg}
		<div class="error-page">
			<h2>{errorMsg}</h2>
			<a href="/dashboard" class="back-link">&larr; Kembali ke Dashboard</a>
		</div>
	{:else if mod}
		{#if mod}
			<div class="module-banner">
				<img
					src="/assets/thumbnails/{mod.slug}.svg"
					alt=""
					class="banner-img"
					loading="lazy"
					onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					onload={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
				/>
				<div class="banner-overlay">
					<div class="banner-content">
						<span class="banner-level">{mod.level}</span>
						<h1 class="banner-title">{mod.title}</h1>
						<p class="banner-desc">{mod.description}</p>
					</div>
				</div>
			</div>
		{/if}
		<header class="module-header">
			<a href="/dashboard" class="back-link">&larr; Dashboard</a>
			<div class="module-meta">
				<span>{mod.sessions.length} sesi</span>
				<span class="meta-dot">&middot;</span>
				<span>{completedSessions.length} selesai</span>
				{#if totalWords > 0}
					<span class="meta-dot">&middot;</span>
					<span>📝 ~{totalWords} kata</span>
					<span class="meta-dot">&middot;</span>
					<span>⏱ ~{readingTime} mnt</span>
				{/if}
			</div>
			<ProgressBar value={moduleProgress} />
			<div class="header-actions">
				<FontSizeControl />
				<button class="share-btn" onclick={copyShareLink}>
					🔗 Share
				</button>
				{#if mod && pdfIndex[mod.dirName]}
					<a href="/pdfs/{mod.dirName}.pdf" target="_blank" class="pdf-download-btn" download>
						📥 Download PDF
					</a>
				{/if}
			</div>
		</header>

		{#if allSessionsCompleted && nextModule}
			<div class="module-complete-banner">
				<div class="banner-content">
					<span class="banner-icon">🎉</span>
					<div class="banner-text">
						<strong>Modul selesai!</strong>
						<span>Lanjut ke modul selanjutnya</span>
					</div>
					<a href="/module/{nextModule.slug}" class="banner-link">
						{nextModule.title} &rarr;
					</a>
				</div>
			</div>
		{/if}

		<div class="module-layout">
			<aside class="session-sidebar">
				<h3>Sesi Belajar</h3>
				<ul class="session-list">
					{#each mod.sessions as session}
						<li>
							<button
								class="session-item"
								class:active={activeSession === session.id}
								onclick={() => loadSession(session.id)}
							>
								<span class="session-check" class:done={progress.isSessionCompleted(mod.slug, session.id)}>
									{#if progress.isSessionCompleted(mod.slug, session.id)}✓{:else}○{/if}
								</span>
								<span class="session-name">{session.title}</span>
								{#if sessionWordCounts[session.id] != null}
									{@const wc = sessionWordCounts[session.id]}
									{@const rt = Math.max(1, Math.round(wc / 200))}
									<span class="word-count">📝{wc} kata · ⏱{rt} mnt</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</aside>

			<div class="content-area" style="font-size: var(--reading-font-size, 16px)">
				{#if activeSession}
					<div class="session-toolbar">
						<h2>
							{mod.sessions.find(s => s.id === activeSession)?.title}
							{#if sessionPosition}
								<span class="session-position">{sessionPosition}</span>
							{/if}
							{#if sessionReadingTime != null}
								<span class="session-reading-time">📖 ~{sessionReadingTime} menit</span>
							{/if}
						</h2>
						<div class="toolbar-actions">
							<button
								class="notes-toggle-btn"
								class:active={showNotes}
								onclick={() => showNotes = !showNotes}
								title="Catatan (n)"
							>
								📝 Catatan
							</button>
							<FontSizeControl />
							{#if quizQuestions.length > 0}
								<button
									class="quiz-toggle-btn"
									class:active={showQuiz}
									onclick={() => showQuiz = !showQuiz}
									title="Quiz (q)"
								>
									🧪 Quiz
								</button>
							{/if}
							{#if exerciseCode}
								<button
									class="exercise-toggle-btn"
									class:active={showExercise}
									onclick={() => showExercise = !showExercise}
									title="Coba Kode (e)"
								>
									▶️ Coba Kode
								</button>
							{/if}
							{#if moduleVideos.length > 0}
								<button
									class="video-toggle-btn"
									class:active={showVideos}
									onclick={() => showVideos = !showVideos}
									title="Video (v)"
								>
									🎥 Video
								</button>
							{/if}
							<button
								class="complete-btn"
								class:done={progress.isSessionCompleted(mod.slug, activeSession)}
								class:celebrate={celebrateSession === activeSession}
								onclick={() => toggleComplete(activeSession)}
								title="Tandai Selesai (d)"
							>
								{progress.isSessionCompleted(mod.slug, activeSession) ? '✓ Selesai' : 'Tandai Selesai'}
							</button>
							<button
								class="discuss-toggle-btn"
								class:active={showDiscussions}
								onclick={() => showDiscussions = !showDiscussions}
								title="Diskusi (c)"
							>
								💬 Diskusi
							</button>
						</div>
					</div>
					<div class="markdown-content">
						{@html sessionHtml}
					</div>
					{#if showNotes}
						<NotesPanel {slug} sessionId={activeSession} />
					{/if}
					{#if showQuiz && quizQuestions.length > 0 && activeSession}
						<div class="quiz-section">
							<QuizCard questions={quizQuestions} moduleSlug={slug} sessionId={activeSession} />
						</div>
					{/if}
					{#if showExercise && exerciseCode}
						<div class="exercise-section">
							<ExerciseRunner
								code={exerciseCode}
								language={exerciseLang}
								exerciseType={exerciseLang === 'html' ? 'html' : 'js'}
							/>
						</div>
					{/if}
					{#if showVideos && moduleVideos.length > 0}
						<div class="videos-section">
							<h3>🎥 Video Pembelajaran</h3>
							<div class="video-list">
								{#each moduleVideos as v}
									<div class="video-item" class:planned={!v.url}>
										<div class="video-thumb">
											{#if v.url}
												{@const ytId = v.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1]}
												{#if ytId}
													<img
														src="https://img.youtube.com/vi/{ytId}/hqdefault.jpg"
														alt={v.title}
														loading="lazy"
													/>
												{/if}
											{/if}
										</div>
										<div class="video-info">
											<h4>{v.title}</h4>
											{#if v.description}
												<p class="video-desc">{v.description}</p>
											{/if}
											<div class="video-meta">
												{#if v.duration}
													<span class="video-duration">{v.duration}</span>
												{/if}
												{#if v.url}
													<span class="video-status published">Published</span>
													<button
														class="video-play-btn"
														onclick={() => selectedVideo = v}
													>▶ Putar</button>
												{:else}
													<span class="video-status planned">Planned</span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					{#if showDiscussions}
						<div class="discussions-section">
							<h3>
								💬 Diskusi
								<span class="discussion-count">{discussions.getTopLevelComments(slug).length} komentar</span>
							</h3>

							<!-- Comment list -->
							<div class="discussion-list">
								{#each discussions.getTopLevelComments(slug) as comment}
									<div class="discussion-item">
										<div class="discussion-avatar">
											{(comment.username || comment.user_id).charAt(0).toUpperCase()}
										</div>
										<div class="discussion-body">
											<div class="discussion-meta">
												<strong>{comment.username || comment.user_id.slice(0, 8)}</strong>
												<span class="discussion-time">{formatTime(comment.created_at)}</span>
											</div>
											<p class="discussion-content">{comment.content}</p>
											<div class="discussion-actions">
												<button
													class="reply-btn"
													onclick={() => replyToId = replyToId === comment.id ? null : comment.id}
												>↩ Balas</button>
												{#if getDeviceId() === comment.user_id}
													<button
														class="delete-btn"
														onclick={async () => {
															await discussions.deleteComment(comment.id, slug, activeSession ?? undefined);
														}}
													>🗑 Hapus</button>
												{/if}
											</div>

											<!-- Replies -->
											{#each discussions.getReplies(comment.id) as reply}
												<div class="discussion-item reply">
													<div class="discussion-avatar small">
														{(reply.username || reply.user_id).charAt(0).toUpperCase()}
													</div>
													<div class="discussion-body">
														<div class="discussion-meta">
															<strong>{reply.username || reply.user_id.slice(0, 8)}</strong>
															<span class="discussion-time">{formatTime(reply.created_at)}</span>
														</div>
														<p class="discussion-content">{reply.content}</p>
														{#if getDeviceId() === reply.user_id}
															<button
																class="delete-btn"
																onclick={async () => {
																	await discussions.deleteComment(reply.id, slug, activeSession ?? undefined);
																}}
															>🗑 Hapus</button>
														{/if}
													</div>
												</div>
											{/each}

											<!-- Reply input -->
											{#if replyToId === comment.id}
												<div class="reply-input">
													<input
														type="text"
														placeholder="Tulis balasan..."
														bind:value={discussionInput}
														onkeydown={async (e) => {
															if (e.key === 'Enter' && discussionInput.trim()) {
																await discussions.addComment(discussionInput.trim(), slug, activeSession ?? undefined, comment.id);
																discussionInput = '';
																replyToId = null;
															}
														}}
													/>
													<button
														class="send-reply-btn"
														disabled={!discussionInput.trim()}
														onclick={async () => {
															if (discussionInput.trim()) {
																await discussions.addComment(discussionInput.trim(), slug, activeSession ?? undefined, comment.id);
																discussionInput = '';
																replyToId = null;
															}
														}}
													>Kirim</button>
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>

							<!-- New comment input -->
							{#if replyToId === null}
								<div class="discussion-input-area">
									<div class="discussion-avatar">
										{getDeviceId().charAt(0).toUpperCase()}
									</div>
									<div class="discussion-input-wrapper">
										<input
											type="text"
											placeholder="Tulis komentar... (Enter untuk kirim)"
											bind:value={discussionInput}
											onkeydown={async (e) => {
												if (e.key === 'Enter' && discussionInput.trim()) {
													await discussions.addComment(discussionInput.trim(), slug, activeSession ?? undefined);
													discussionInput = '';
												}
											}}
										/>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{:else}
					<div class="readme-content">
						<h2>📖 README — {mod.title}</h2>
						<div class="markdown-content">
							{@html readmeHtml}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prev/Next module navigation -->
		<div class="module-nav">
			{#if prevModule}
				<a href="/module/{prevModule.slug}" class="nav-btn prev">
					&larr; Modul Sebelumnya
				</a>
			{:else}
				<span class="nav-btn disabled"></span>
			{/if}
			{#if nextModule}
				<a href="/module/{nextModule.slug}" class="nav-btn next">
					Modul Selanjutnya &rarr;
				</a>
			{:else}
				<span class="nav-btn disabled"></span>
			{/if}
		</div>

		<!-- Case Study section -->
		{#if mod}
			{@const cs = getCaseStudyByModule(mod.slug)}
			{#if cs}
				<div class="case-study-section">
					<h2>📋 Case Study Terkait</h2>
					<a href="/case-study/{cs.slug}" class="case-study-card">
						<div class="cs-card-header">
							<span class="cs-company">{cs.company}</span>
							<span class="cs-level">{cs.level}</span>
						</div>
						<h3>{cs.title}</h3>
						<p>{cs.description}</p>
						<span class="cs-read-more">Baca selengkapnya &rarr;</span>
					</a>
				</div>
			{/if}
		{/if}
	{/if}

	<!-- Exercise section -->
	{#if mod && moduleExercises.length > 0}
		<div class="exercise-section">
			<h2>🏋️ Latihan Soal</h2>
			<p class="section-desc">Latihan untuk modul ini — coba kerjakan untuk menguji pemahaman.</p>
			<div class="exercise-list">
				{#each moduleExercises as ex}
					<a href="/exercises/{ex.slug}" class="exercise-item">
						<div class="ex-header">
							<span class="ex-title">{ex.title}</span>
							<div class="ex-meta">
								<span class="badge" class:beginner={ex.difficulty === 'Beginner'} class:intermediate={ex.difficulty === 'Intermediate'} class:advanced={ex.difficulty === 'Advanced'}>
									{ex.difficulty}
								</span>
								<span class="ex-type">{ex.type}</span>
							</div>
						</div>
						{#if ex.description}
							<p class="ex-desc">{ex.description}</p>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Video Player Modal -->
{#if selectedVideo && selectedVideo.url}
	{@const ytId = selectedVideo.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1]}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => selectedVideo = null} role="button" tabindex="-1">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<button class="modal-close" onclick={() => selectedVideo = null}>&times;</button>
			<h3 class="modal-title">{selectedVideo.title}</h3>
			{#if ytId}
				<div class="video-wrapper">
					<iframe
						src="https://www.youtube-nocookie.com/embed/{ytId}?autoplay=1"
						title={selectedVideo.title}
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Toast -->
{#if toastMsg}
	<div class="toast">{toastMsg}</div>
{/if}

<style>
	.module-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.module-banner {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 7;
		border-radius: 16px;
		overflow: hidden;
		margin-bottom: 24px;
	}

	.banner-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.banner-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%);
		display: flex;
		align-items: flex-end;
		padding: 32px;
	}

	.banner-content {
		max-width: 80%;
	}

	.banner-level {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		padding: 3px 12px;
		border-radius: 20px;
		background: rgba(255,255,255,0.15);
		color: rgba(255,255,255,0.9);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.banner-title {
		font-size: 32px;
		font-weight: 700;
		color: #fff;
		margin: 0 0 6px 0;
		line-height: 1.2;
	}

	.banner-desc {
		font-size: 14px;
		color: rgba(255,255,255,0.7);
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.module-banner {
			aspect-ratio: 16 / 9;
			border-radius: 12px;
			margin-bottom: 16px;
		}
		.banner-overlay {
			padding: 20px;
		}
		.banner-content {
			max-width: 100%;
		}
		.banner-title {
			font-size: 22px;
		}
		.banner-desc {
			font-size: 13px;
		}
	}

	.loading, .error-page {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.module-header {
		margin-bottom: 24px;
	}

	.back-link {
		display: inline-block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: 8px;
		text-decoration: none !important;
	}

	.back-link:hover {
		color: var(--accent);
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.module-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}

	.meta-dot { color: var(--border); }

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
		flex-wrap: wrap;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 8px 18px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.share-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.pdf-download-btn {
		display: inline-block;
		margin-top: 12px;
		padding: 8px 18px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		text-decoration: none !important;
		transition: all 0.15s ease;
	}
	.pdf-download-btn:hover {
		background: var(--accent);
		color: #fff;
	}

	.module-layout { display: flex; gap: 24px; align-items: flex-start; }

	.session-sidebar {
		width: 240px; min-width: 240px;
		position: sticky; top: 24px;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; padding: 16px;
	}

	.session-sidebar h3 {
		font-size: 14px; font-weight: 600;
		margin-bottom: 12px; padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	.session-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }

	.session-item {
		display: flex; align-items: center; gap: 8px;
		width: 100%; padding: 8px 10px; border-radius: 8px;
		border: none; background: transparent;
		color: var(--text-secondary); font-size: 13px;
		text-align: left; cursor: pointer;
		transition: all 0.15s ease; flex-wrap: wrap;
	}

	.session-item:hover { background: var(--hover); color: var(--text); }
	.session-item.active { background: var(--accent-dim); color: var(--accent); }

	.session-check { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
	.session-check.done { color: var(--success, #22c55e); }
	.session-name { line-height: 1.3; }

	.word-count {
		font-size: 10px; color: var(--text-secondary);
		margin-left: 26px; width: 100%; opacity: 0.7;
	}

	.content-area { flex: 1; min-width: 0; transition: font-size 0.1s ease; }

	.session-toolbar {
		display: flex; justify-content: space-between; align-items: center;
		margin-bottom: 20px; padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.session-toolbar h2 {
		font-size: 18px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.session-position {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 2px 10px;
		border-radius: 10px;
		white-space: nowrap;
	}

	.session-reading-time {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 2px 10px;
		border-radius: 10px;
		white-space: nowrap;
	}

	.toolbar-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.notes-toggle-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}

	.notes-toggle-btn:hover { border-color: var(--accent); color: var(--accent); }
	.notes-toggle-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

	.quiz-toggle-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}

	.quiz-toggle-btn:hover { border-color: #f59e0b; color: #f59e0b; }
	.quiz-toggle-btn.active { background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; color: #f59e0b; }

	.exercise-toggle-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}

	.exercise-toggle-btn:hover { border-color: #22c55e; color: #22c55e; }
	.exercise-toggle-btn.active { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; color: #22c55e; }

	.quiz-section {
		margin-top: 24px;
	}

	.exercise-section {
		margin-top: 24px;
	}

	.complete-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}

	.complete-btn:hover { border-color: var(--accent); color: var(--accent); }
	.complete-btn.done { background: var(--success, #22c55e); color: #fff; border-color: var(--success, #22c55e); }

	/* Celebration animation on complete button */
	.complete-btn.celebrate {
		animation: celebrate-pulse 0.4s ease;
	}

	@keyframes celebrate-pulse {
		0% { transform: scale(1); background: var(--success, #22c55e); }
		50% { transform: scale(1.15); background: #22c55e; }
		100% { transform: scale(1); }
	}

	.markdown-content {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 12px; padding: 24px; line-height: 1.7;
	}

	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4) {
		margin-top: 24px; margin-bottom: 12px; font-weight: 600; color: var(--text);
	}

	.markdown-content :global(h1) { font-size: 24px; }
	.markdown-content :global(h2) { font-size: 20px; }
	.markdown-content :global(h3) { font-size: 18px; }
	.markdown-content :global(h4) { font-size: 16px; }
	.markdown-content :global(h1:first-child) { margin-top: 0; }

	.markdown-content :global(p) { margin-bottom: 16px; color: var(--text); }

	.markdown-content :global(ul),
	.markdown-content :global(ol) { margin-bottom: 16px; padding-left: 24px; }

	.markdown-content :global(li) { margin-bottom: 6px; }

	.markdown-content :global(code) {
		background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px;
		font-size: 0.9em; font-family: 'Fira Code', 'JetBrains Mono', monospace;
	}

	.markdown-content :global(pre) {
		background: var(--bg-secondary); border: 1px solid var(--border);
		border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;
	}

	.markdown-content :global(pre code) { background: none; padding: 0; }

	.markdown-content :global(blockquote) {
		border-left: 3px solid var(--accent); padding-left: 16px;
		margin: 16px 0; color: var(--text-secondary);
	}

	.markdown-content :global(img) { max-width: 100%; border-radius: 8px; margin: 16px 0; }

	.markdown-content :global(table) { width: 100%; border-collapse: collapse; margin: 16px 0; }

	.markdown-content :global(th),
	.markdown-content :global(td) { padding: 10px 14px; border: 1px solid var(--border); text-align: left; }

	.markdown-content :global(th) { background: var(--bg-secondary); font-weight: 600; }

	.module-nav {
		display: flex; justify-content: space-between; gap: 16px;
		margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border);
	}

	.nav-btn {
		padding: 12px 20px; border: 1px solid var(--border);
		border-radius: 10px; text-decoration: none !important;
		color: var(--text); font-size: 14px; font-weight: 500;
		transition: all 0.15s ease;
	}

	.nav-btn:hover { border-color: var(--accent); color: var(--accent); }
	.nav-btn.disabled { visibility: hidden; }

	@media (max-width: 768px) {
		.module-layout { flex-direction: column; }
		.session-sidebar { width: 100%; min-width: 0; position: static; }
		h1 { font-size: 20px; }
	}

	/* Video toggle button */
	.video-toggle-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}
	.video-toggle-btn:hover { border-color: #ef4444; color: #ef4444; }
	.video-toggle-btn.active { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; }

	/* Videos section */
	.videos-section {
		margin-top: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}
	.videos-section h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
	}
	.video-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.video-item {
		display: flex;
		gap: 14px;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		align-items: flex-start;
	}
	.video-item.planned {
		opacity: 0.75;
	}
	.video-thumb {
		width: 160px;
		min-width: 160px;
		aspect-ratio: 16 / 9;
		background: var(--bg-secondary);
		border-radius: 6px;
		overflow: hidden;
	}
	.video-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.video-info {
		flex: 1;
		min-width: 0;
	}
	.video-info h4 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.video-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		margin-bottom: 8px;
	}
	.video-meta {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.video-duration {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.video-status {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 4px;
	}
	.video-status.published {
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}
	.video-status.planned {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;
	}
	.video-play-btn {
		padding: 4px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		margin-left: auto;
	}
	.video-play-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* Video modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 500;
		background: rgba(0,0,0,0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}
	.modal-content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		max-width: 800px;
		width: 100%;
		padding: 24px;
		position: relative;
	}
	.modal-close {
		position: absolute;
		top: 12px;
		right: 16px;
		background: none;
		border: none;
		font-size: 28px;
		color: var(--text-secondary);
		cursor: pointer;
		line-height: 1;
		z-index: 1;
	}
	.modal-close:hover { color: var(--text); }
	.modal-title {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		padding-right: 32px;
	}
	.video-wrapper {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000;
		border-radius: 8px;
		overflow: hidden;
	}
	.video-wrapper iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

		/* Toast */
		.toast {
			position: fixed;
			bottom: 24px;
			right: 24px;
			background: #1a1a2e;
			color: #e0e0e0;
			padding: 10px 20px;
			border-radius: 10px;
			font-size: 13px;
			font-weight: 500;
			z-index: 600;
			animation: toast-in 0.3s ease;
			box-shadow: 0 4px 16px rgba(0,0,0,0.3);
		}

		/* Case Study section */
		.case-study-section {
			margin-top: 32px;
			padding-top: 20px;
			border-top: 1px solid var(--border);
		}
		.case-study-section h2 {
			font-size: 18px;
			font-weight: 600;
			margin-bottom: 12px;
		}
		.case-study-card {
			display: block;
			padding: 20px;
			border-radius: 12px;
			background: var(--surface);
			border: 1px solid var(--border);
			text-decoration: none !important;
			transition: border-color 0.15s ease, box-shadow 0.15s ease;
		}
		.case-study-card:hover {
			border-color: var(--accent);
			box-shadow: 0 0 0 2px var(--accent-dim);
		}
		.case-study-card .cs-card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}
		.case-study-card .cs-company {
			font-size: 11px;
			font-weight: 600;
			color: var(--text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.03em;
		}
		.case-study-card .cs-level {
			font-size: 10px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 4px;
			background: var(--bg-secondary);
			color: var(--text-secondary);
		}
		.case-study-card h3 {
			font-size: 16px;
			font-weight: 700;
			margin-bottom: 6px;
			color: var(--text);
		}
		.case-study-card p {
			font-size: 13px;
			color: var(--text-secondary);
			line-height: 1.5;
			margin-bottom: 8px;
		}
		.case-study-card .cs-read-more {
			font-size: 12px;
			font-weight: 600;
			color: var(--accent);
		}

	@keyframes toast-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Reading progress bar */
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		z-index: 1000;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		transition: none;
		pointer-events: none;
	}

	/* Module complete banner */
	.module-complete-banner {
		margin-bottom: 20px;
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.05));
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: 12px;
		padding: 16px 20px;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.banner-icon {
		font-size: 28px;
		line-height: 1;
		flex-shrink: 0;
	}

	.banner-text {
		flex: 1;
	}

	.banner-text strong {
		display: block;
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	.banner-text span {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.banner-link {
		padding: 8px 16px;
		border-radius: 8px;
		background: #22c55e;
		color: #fff !important;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none !important;
		white-space: nowrap;
		transition: opacity 0.15s ease;
		flex-shrink: 0;
	}
	.banner-link:hover {
		opacity: 0.9;
	}

	/* Discussion section */
	.discuss-toggle-btn {
		padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
		color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer;
		transition: all 0.15s ease;
	}
	.discuss-toggle-btn:hover { border-color: #3b82f6; color: #3b82f6; }
	.discuss-toggle-btn.active { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: #3b82f6; }

	.discussions-section {
		margin-top: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
	}
	.discussions-section h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.discussion-count {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 2px 10px;
		border-radius: 10px;
	}
	.discussion-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
	}
	.discussion-item {
		display: flex;
		gap: 10px;
		padding: 8px;
		border-radius: 10px;
	}
	.discussion-item.reply {
		margin-left: 36px;
		padding: 6px 8px;
		background: var(--bg-secondary);
		border-radius: 8px;
	}
	.discussion-avatar {
		width: 32px;
		height: 32px;
		min-width: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 600;
	}
	.discussion-avatar.small {
		width: 24px;
		height: 24px;
		min-width: 24px;
		font-size: 11px;
	}
	.discussion-body {
		flex: 1;
		min-width: 0;
	}
	.discussion-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}
	.discussion-meta strong {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}
	.discussion-time {
		font-size: 11px;
		color: var(--text-secondary);
	}
	.discussion-content {
		font-size: 14px;
		color: var(--text);
		line-height: 1.5;
		margin-bottom: 6px;
		word-break: break-word;
	}
	.discussion-actions {
		display: flex;
		gap: 8px;
	}
	.reply-btn, .delete-btn {
		padding: 2px 8px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.15s ease;
	}
	.reply-btn:hover { color: var(--accent); background: var(--accent-dim); }
	.delete-btn:hover { color: var(--danger, #ef4444); background: rgba(239, 68, 68, 0.1); }

	.reply-input {
		display: flex;
		gap: 8px;
		margin-top: 8px;
		align-items: center;
	}
	.reply-input input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 13px;
		outline: none;
	}
	.reply-input input:focus {
		border-color: var(--accent);
	}
	.send-reply-btn {
		padding: 8px 16px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s ease;
	}
	.send-reply-btn:hover { background: var(--accent); color: #fff; }
	.send-reply-btn:disabled { opacity: 0.4; cursor: default; }

	.discussion-input-area {
		display: flex;
		gap: 10px;
		align-items: center;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.discussion-input-wrapper {
		flex: 1;
	}
	.discussion-input-wrapper input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s ease;
	}
	.discussion-input-wrapper input:focus {
		border-color: var(--accent);
	}

	/* Exercise section */
	.exercise-section {
		margin-top: 32px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.exercise-section h2 {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.section-desc {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 16px;
	}
	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.exercise-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px 16px;
		border-radius: 8px;
		background: var(--bg);
		border: 1px solid var(--border);
		text-decoration: none !important;
		color: inherit;
		transition: border-color 0.15s ease;
	}
	.exercise-item:hover {
		border-color: var(--accent);
	}
	.ex-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.ex-title {
		font-size: 14px;
		font-weight: 600;
	}
	.ex-meta {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-shrink: 0;
	}
	.ex-meta .badge {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
		text-transform: uppercase;
	}
	.ex-meta .badge.beginner { background: #10b98122; color: #10b981; }
	.ex-meta .badge.intermediate { background: #f59e0b22; color: #f59e0b; }
	.ex-meta .badge.advanced { background: #ef444422; color: #ef4444; }
	.ex-type {
		font-size: 11px;
		color: var(--text-secondary);
		background: var(--surface);
		padding: 2px 8px;
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	.ex-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.module-layout {
			flex-direction: column !important;
		}
		.session-sidebar {
			width: 100% !important;
			min-width: unset !important;
			position: static !important;
		}
		.module-banner img.banner-img {
			max-width: 100%;
			height: auto;
		}
		.banner-title {
			font-size: 20px;
		}
		.content-area {
			padding: 0;
		}
		.session-toolbar {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.toolbar-actions {
			flex-wrap: wrap;
		}
		.module-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.header-actions {
			flex-wrap: wrap;
		}
	}
</style>
