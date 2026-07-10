<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { modules, type Module } from '$lib/stores/modules';
	import { progress } from '$lib/stores/progress.svelte';
	import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
	import { onMount } from 'svelte';

	let { data } = $props();

	let mod = $state<Module | null>(null);
	let activeSession = $state<string | null>(null);
	let readmeHtml = $state<string>('');
	let sessionHtml = $state<string>('');
	let loading = $state(true);
	let errorMsg = $state('');

	// Feature: Font size toggle
	let fontSize = $state(16);
	onMount(() => {
		const saved = localStorage.getItem('lms-font-size');
		if (saved) {
			const n = parseInt(saved, 10);
			if (n === 14 || n === 16 || n === 18) fontSize = n;
		}
	});
	function setFontSize(size: number) {
		fontSize = size;
		localStorage.setItem('lms-font-size', String(size));
	}

	// Feature: Session word counts from API
	let sessionWordCounts = $state<Record<string, number>>({});
	let totalWords = $state(0);

	// Feature: Next / Prev module navigation
	let moduleIndex = $derived(modules.findIndex(m => m.slug === mod?.slug));
	let prevModule = $derived(moduleIndex > 0 ? modules[moduleIndex - 1] : undefined);
	let nextModule = $derived(moduleIndex >= 0 && moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : undefined);

	onMount(async () => {
		const slug = data.slug;
		mod = modules.find(m => m.slug === slug) ?? null;

		if (!mod) {
			errorMsg = 'Modul tidak ditemukan';
			loading = false;
			return;
		}

		progress.setLastRead(slug);

		try {
			const res = await fetch(`/api/readme/${slug}`);
			if (!res.ok) throw new Error('Gagal memuat README');
			const json = await res.json();
			const cleaned = stripFrontmatter(json.content);
			readmeHtml = parseMarkdown(cleaned);
			// Load session word counts from API
			if (json.sessionWordCounts) {
				sessionWordCounts = json.sessionWordCounts;
			}
			if (typeof json.totalWords === 'number') {
				totalWords = json.totalWords;
			}
		} catch (e) {
			errorMsg = 'Gagal memuat konten modul';
		}

		loading = false;
	});

	async function loadSession(sessionId: string) {
		if (!mod) return;
		activeSession = sessionId;
		sessionHtml = '';
		try {
			const res = await fetch(`/api/session/${mod.slug}/${sessionId}`);
			if (!res.ok) throw new Error('Gagal memuat sesi');
			const json = await res.json();
			const cleaned = stripFrontmatter(json.content);
			sessionHtml = parseMarkdown(cleaned);
		} catch (e) {
			sessionHtml = '<p class="error">Gagal memuat konten sesi</p>';
		}
	}

	function toggleComplete(sessionId: string | null) {
		if (!mod || !sessionId) return;
		progress.toggleSession(mod.slug, sessionId);
	}

	let moduleProgress = $derived(mod ? progress.getModuleProgress(mod.slug) : 0);
	let completedSessions = $derived(mod ? progress.getCompletedSessions(mod.slug) : []);
</script>

<div class="module-page">
	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if errorMsg}
		<div class="error-page">
			<h2>{errorMsg}</h2>
			<a href="/dashboard" class="back-link">&larr; Kembali ke Dashboard</a>
		</div>
	{:else if mod}
		<header class="module-header">
			<a href="/dashboard" class="back-link">&larr; Dashboard</a>
			<h1>{mod.title}</h1>
			<div class="module-meta">
				<span>{mod.sessions.length} sesi</span>
				<span class="meta-dot">&middot;</span>
				<span>{completedSessions.length} selesai</span>
				{#if totalWords > 0}
					<span class="meta-dot">&middot;</span>
					<span>📝 ~{totalWords} kata</span>
				{/if}
			</div>
			<ProgressBar value={moduleProgress} />
			<!-- Font size toggle -->
			<div class="font-size-controls">
				<button
					class="font-btn"
					class:active={fontSize === 14}
					onclick={() => setFontSize(14)}
					title="Ukuran kecil"
				>A-</button>
				<button
					class="font-btn"
					class:active={fontSize === 16}
					onclick={() => setFontSize(16)}
					title="Ukuran normal"
				>A</button>
				<button
					class="font-btn"
					class:active={fontSize === 18}
					onclick={() => setFontSize(18)}
					title="Ukuran besar"
				>A+</button>
			</div>
		</header>

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
									<span class="word-count">({sessionWordCounts[session.id]} kata)</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</aside>

			<div class="content-area" style="font-size: {fontSize}px">
				{#if activeSession}
					<div class="session-toolbar">
						<h2>{mod.sessions.find(s => s.id === activeSession)?.title}</h2>
						<button
							class="complete-btn"
							class:done={progress.isSessionCompleted(mod.slug, activeSession)}
							onclick={() => toggleComplete(activeSession)}
						>
							{progress.isSessionCompleted(mod.slug, activeSession) ? '✓ Selesai' : 'Tandai Selesai'}
						</button>
					</div>
					<div class="markdown-content">
						{@html sessionHtml}
					</div>
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
	{/if}
</div>

<style>
	.module-page {
		max-width: 1100px;
		margin: 0 auto;
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

	.meta-dot {
		color: var(--border);
	}

	.font-size-controls {
		display: flex;
		gap: 4px;
		margin-top: 10px;
	}

	.font-btn {
		width: 32px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.font-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.font-btn.active {
		background: var(--accent-dim);
		border-color: var(--accent);
		color: var(--accent);
	}

	.module-layout {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}

	.session-sidebar {
		width: 240px;
		min-width: 240px;
		position: sticky;
		top: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
	}

	.session-sidebar h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	.session-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.session-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		flex-wrap: wrap;
	}

	.session-item:hover {
		background: var(--hover);
		color: var(--text);
	}

	.session-item.active {
		background: var(--accent-dim);
		color: var(--accent);
	}

	.session-check {
		font-size: 14px;
		width: 18px;
		text-align: center;
		flex-shrink: 0;
	}

	.session-check.done {
		color: var(--success, #22c55e);
	}

	.session-name {
		line-height: 1.3;
	}

	.word-count {
		font-size: 10px;
		color: var(--text-secondary);
		margin-left: 26px;
		width: 100%;
		opacity: 0.7;
	}

	.content-area {
		flex: 1;
		min-width: 0;
		transition: font-size 0.1s ease;
	}

	.session-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.session-toolbar h2 {
		font-size: 18px;
		font-weight: 600;
	}

	.complete-btn {
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.complete-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.complete-btn.done {
		background: var(--success, #22c55e);
		color: #fff;
		border-color: var(--success, #22c55e);
	}

	.markdown-content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		line-height: 1.7;
	}

	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4) {
		margin-top: 24px;
		margin-bottom: 12px;
		font-weight: 600;
		color: var(--text);
	}

	.markdown-content :global(h1) { font-size: 24px; }
	.markdown-content :global(h2) { font-size: 20px; }
	.markdown-content :global(h3) { font-size: 18px; }
	.markdown-content :global(h4) { font-size: 16px; }

	.markdown-content :global(h1:first-child) { margin-top: 0; }

	.markdown-content :global(p) {
		margin-bottom: 16px;
		color: var(--text);
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin-bottom: 16px;
		padding-left: 24px;
	}

	.markdown-content :global(li) {
		margin-bottom: 6px;
	}

	.markdown-content :global(code) {
		background: var(--bg-secondary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.9em;
		font-family: 'Fira Code', 'JetBrains Mono', monospace;
	}

	.markdown-content :global(pre) {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 16px;
		overflow-x: auto;
	}

	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-content :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding-left: 16px;
		margin: 16px 0;
		color: var(--text-secondary);
	}

	.markdown-content :global(img) {
		max-width: 100%;
		border-radius: 8px;
		margin: 16px 0;
	}

	.markdown-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 16px 0;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		padding: 10px 14px;
		border: 1px solid var(--border);
		text-align: left;
	}

	.markdown-content :global(th) {
		background: var(--bg-secondary);
		font-weight: 600;
	}

	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 24px 0;
	}

	.markdown-content :global(a) {
		color: var(--accent);
	}

	.readme-content h2 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	/* Prev/Next module navigation */
	.module-nav {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid var(--border);
	}

	.nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.nav-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--hover);
	}

	.nav-btn.disabled {
		visibility: hidden;
		pointer-events: none;
	}

	.nav-btn.next {
		margin-left: auto;
	}

	@media (max-width: 768px) {
		.module-layout {
			flex-direction: column;
		}

		.session-sidebar {
			width: 100%;
			min-width: 100%;
			position: static;
		}

		.session-toolbar {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.module-nav {
			flex-direction: column;
			gap: 8px;
		}

		.nav-btn {
			width: 100%;
			justify-content: center;
		}

		.nav-btn.next {
			margin-left: 0;
		}
	}
</style>
