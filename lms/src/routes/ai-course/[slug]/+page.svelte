<script lang="ts">
	import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
	import { aiModules, finalProject, type AiModule } from '$lib/stores/ai-course';
	import { Skeleton } from '$lib/components/ui';
	import { onMount } from 'svelte';

	let { data } = $props();

	let content = $state('');
	let exerciseContent = $state('');
	let loading = $state(true);
	let exerciseLoading = $state(true);
	let error = $state('');
	let completedModules = $state<Set<string>>(new Set());
	let showSidebar = $state(false);
	let fullscreen = $state(true);
	let activeTab = $state<'materi' | 'latihan'>('materi');
	let readProgress = $state(0);
	let showShortcuts = $state(false);

	const mod = $derived(data.module as AiModule);
	const next = $derived(data.next as AiModule | undefined);
	const prev = $derived(data.prev as AiModule | undefined);
	const levelColors: Record<string, string> = { Pemula: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--danger)' };
	const isFinalProject = $derived(data.slug === '20-final-project');

	onMount(() => {
		try {
			const saved = localStorage.getItem('ai-course-progress');
			if (saved) completedModules = new Set(JSON.parse(saved));
		} catch {}
		if (mod) {
			completedModules.add(mod.slug);
			completedModules = new Set(completedModules);
			try { localStorage.setItem('ai-course-progress', JSON.stringify([...completedModules])); } catch {}
		}
	});

	async function loadContent() {
		loading = true;
		try {
			const slug = isFinalProject ? '20-final-project' : mod.slug;
			const res = await fetch(`/content/ai-course/${slug}.json`);
			if (!res.ok) throw new Error('Content not found');
			const json = await res.json();
			const raw = json.content || '';
			const cleaned = stripFrontmatter(raw);
			content = parseMarkdown(cleaned);
		} catch (e) {
			error = 'Gagal memuat konten modul';
		}
		loading = false;
	}

	async function loadExercise() {
		if (isFinalProject || !mod) return;
		exerciseLoading = true;
		try {
			const res = await fetch(`/content/ai-course/${mod.exerciseSlug}.json`);
			if (!res.ok) { exerciseContent = ''; return; }
			const json = await res.json();
			const raw = json.content || '';
			const cleaned = stripFrontmatter(raw);
			exerciseContent = parseMarkdown(cleaned);
		} catch {
			exerciseContent = '';
		}
		exerciseLoading = false;
	}

	function toggleComplete(slug: string) {
		const nextSet = new Set(completedModules);
		if (nextSet.has(slug)) nextSet.delete(slug);
		else nextSet.add(slug);
		completedModules = nextSet;
		try { localStorage.setItem('ai-course-progress', JSON.stringify([...nextSet])); } catch {}
	}

	$effect(() => {
		loadContent();
		loadExercise();
	});
	$effect(() => {
		const handleScroll = () => {
			const el = document.querySelector('.module-content');
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const scrolled = -rect.top;
			const total = rect.height - window.innerHeight;
			readProgress = Math.min(100, Math.max(0, (scrolled / total) * 100));
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
	$effect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === 'ArrowRight' && next) {
				window.location.href = `/ai-course/${next.slug}`;
			} else if (e.key === 'ArrowLeft' && prev) {
				window.location.href = `/ai-course/${prev.slug}`;
			} else if (e.key === 'Escape') {
				fullscreen = !fullscreen;
			} else if (e.key === '?') {
				showShortcuts = !showShortcuts;
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});
</script>

<svelte:head>
	<title>{isFinalProject ? finalProject.title : mod.title} — AI Complete Course</title>
</svelte:head>

<!-- Reading progress bar -->
<div class="read-progress" style="width: {readProgress}%"></div>

<!-- Mobile sidebar toggle -->
<button class="sidebar-toggle" onclick={() => showSidebar = !showSidebar}>
	{showSidebar ? '✕' : '☰'} Daftar Modul
</button>

<!-- Fullscreen toggle -->
<button class="fs-toggle" onclick={() => fullscreen = !fullscreen} title={fullscreen ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}>
	{fullscreen ? '☰' : '✕'}
</button>

<div class="module-layout" class:sidebar-open={showSidebar} class:fullscreen={fullscreen}>
	<!-- Sidebar -->
	<aside class="module-sidebar">
		<div class="sidebar-header">
			<a href="/ai-course" class="back-link">← Kembali ke Course</a>
			<h3>📚 AI Complete Course</h3>
		</div>
		<nav class="sidebar-nav">
			{#each aiModules as m (m.slug)}
				<a
					href="/ai-course/{m.slug}"
					class="sidebar-link"
					class:active={m.slug === data.slug}
					class:completed={completedModules.has(m.slug)}
				>
					<span class="sl-icon">{m.icon}</span>
					<span class="sl-text">
						<span class="sl-title">{m.title}</span>
						<span class="sl-level" style="color: {levelColors[m.level]}">{m.level}</span>
					</span>
					{#if completedModules.has(m.slug)}
						<span class="sl-check">✅</span>
					{/if}
				</a>
			{/each}
			<!-- Final Project -->
			<a
				href="/ai-course/20-final-project"
				class="sidebar-link"
				class:active={data.slug === '20-final-project'}
				class:completed={completedModules.has('20-final-project')}
			>
				<span class="sl-icon">🏆</span>
				<span class="sl-text">
					<span class="sl-title">Final Project</span>
					<span class="sl-level" style="color: var(--accent)">Capstone</span>
				</span>
				{#if completedModules.has('20-final-project')}
					<span class="sl-check">✅</span>
				{/if}
			</a>
		</nav>
	</aside>

	<!-- Overlay for mobile -->
	{#if showSidebar}
		<div class="sidebar-overlay" onclick={() => showSidebar = false}></div>
	{/if}

	<!-- Main content -->
	<main class="module-content">
		<!-- Breadcrumb -->
		<nav class="breadcrumb">
			<a href="/ai-course">📚 AI Course</a>
			<span class="bc-sep">›</span>
			<span class="bc-current">{isFinalProject ? finalProject.title : mod.title}</span>
		</nav>

		<!-- Module header -->
		<div class="module-header">
			<div class="mh-top">
				<span class="mh-icon">{isFinalProject ? finalProject.icon : mod.icon}</span>
				<div>
					<span class="mh-level" style="background: {isFinalProject ? 'var(--accent)' : levelColors[mod.level]}10; color: {isFinalProject ? 'var(--accent)' : levelColors[mod.level]}; border: 1px solid {isFinalProject ? 'var(--accent)' : levelColors[mod.level]}30">
						{isFinalProject ? 'Capstone' : mod.level}
					</span>
					{#if !isFinalProject}
						<span class="mh-duration">⏱️ {mod.duration}</span>
					{/if}
				</div>
			</div>
			<h1 class="mh-title">{isFinalProject ? finalProject.title : mod.title}</h1>
			<p class="mh-desc">{isFinalProject ? finalProject.description : mod.description}</p>
		</div>

		<!-- Tabs (only show if exercise exists) -->
		{#if !isFinalProject && exerciseContent}
			<div class="tab-bar">
				<button class="tab" class:active={activeTab === 'materi'} onclick={() => activeTab = 'materi'}>
					📖 Materi
				</button>
				<button class="tab" class:active={activeTab === 'latihan'} onclick={() => activeTab = 'latihan'}>
					✏️ Latihan
				</button>
			</div>
		{/if}

		<!-- Content -->
		{#if activeTab === 'materi'}
			{#if loading}
				<div class="loading-skeleton" aria-label="Memuat konten...">
					<Skeleton variant="title" width="50%" />
					<Skeleton variant="text" count={8} gap="0.75rem" />
					<Skeleton variant="block" height="120px" />
					<Skeleton variant="text" count={4} gap="0.75rem" />
				</div>
			{:else if error}
				<div class="error-msg">
					<h2>{error}</h2>
					<p>Modul "{data.slug}" tidak ditemukan.</p>
				</div>
			{:else}
				<article class="markdown-body">
					{@html content}
				</article>
			{/if}
		{:else}
			{#if exerciseLoading}
				<div class="loading-skeleton" aria-label="Memuat latihan...">
					<Skeleton variant="title" width="40%" />
					<Skeleton variant="text" count={6} gap="0.75rem" />
					<Skeleton variant="block" height="100px" />
				</div>
			{:else if exerciseContent}
				<article class="markdown-body">
					{@html exerciseContent}
				</article>
			{:else}
				<div class="empty-exercise">
					<p>📝 Latihan untuk modul ini belum tersedia.</p>
				</div>
			{/if}
		{/if}

		<!-- Navigation -->
		<div class="module-nav">
			{#if prev}
				<a href="/ai-course/{prev.slug}" class="nav-btn nav-prev">
					<span class="nav-dir">← Sebelumnya</span>
					<span class="nav-title">{prev.title}</span>
				</a>
			{:else}
				<div></div>
			{/if}

			<button class="nav-check" onclick={() => toggleComplete(data.slug)}>
				{completedModules.has(data.slug) ? '✅ Selesai' : '⬜ Tandai Selesai'}
			</button>

			{#if next}
				<a href="/ai-course/{next.slug}" class="nav-btn nav-next">
					<span class="nav-dir">Selanjutnya →</span>
					<span class="nav-title">{next.title}</span>
				</a>
			{:else}
				<a href="/ai-course" class="nav-btn nav-next">
					<span class="nav-dir">🎓 Selesai!</span>
					<span class="nav-title">Kembali ke Course</span>
				</a>
			{/if}
		</div>
	</main>
</div>
{#if showShortcuts}
	<div class="shortcuts-overlay" onclick={() => showShortcuts = false} onkeydown={(e) => { if (e.key === 'Escape') showShortcuts = false; }} role="presentation">
		<div class="shortcuts-panel" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<h3>⌨️ Keyboard Shortcuts</h3>
			<div class="sc-row"><kbd>←</kbd> Previous module</div>
			<div class="sc-row"><kbd>→</kbd> Next module</div>
			<div class="sc-row"><kbd>Esc</kbd> Toggle fullscreen</div>
			<div class="sc-row"><kbd>?</kbd> Show/hide shortcuts</div>
			<button class="sc-close" onclick={() => showShortcuts = false}>Got it</button>
		</div>
	</div>
{/if}

<style>
	/* Layout */
	.module-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		max-width: 1200px;
		margin: 0 auto;
		min-height: calc(100vh - 60px);
	}

	/* Sidebar */
	.module-sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		border-right: 1px solid var(--border);
		background: var(--surface-alt);
		padding: 20px 0;
	}
	.sidebar-header { padding: 0 16px 16px; border-bottom: 1px solid var(--border); }
	.back-link { font-size: 13px; color: var(--accent); text-decoration: none; display: block; margin-bottom: 8px; }
	.back-link:hover { text-decoration: underline; }
	.sidebar-header h3 { font-size: 14px; font-weight: 700; color: var(--text); margin: 0; }

	.sidebar-nav { padding: 8px 0; }
	.sidebar-link {
		display: flex; align-items: center; gap: 10px;
		padding: 8px 16px; text-decoration: none; color: var(--text-secondary);
		font-size: 13px; transition: background 0.15s;
		border-left: 3px solid transparent;
	}
	.sidebar-link:hover { background: var(--surface-alt); }
	.sidebar-link.active { background: var(--accent-light); border-left-color: var(--accent); color: var(--text); font-weight: 600; }
	.sidebar-link.completed .sl-title { color: var(--success); }
	.sl-icon { font-size: 16px; flex-shrink: 0; }
	.sl-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
	.sl-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.sl-level { font-size: 11px; font-weight: 600; }
	.sl-check { font-size: 14px; flex-shrink: 0; }

	/* Mobile */
	.sidebar-toggle {
		display: none;
		position: fixed; bottom: 20px; right: 20px; z-index: 100;
		background: var(--accent); color: #fff; border: none; border-radius: 100px;
		padding: 10px 20px; font-size: 14px; font-weight: 600;
		box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer;
	}
	.sidebar-overlay { display: none; }

	/* Main content */
	.module-content { padding: 32px 48px 64px; min-width: 0; }

	/* Module header */
	.module-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
	.mh-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
	.mh-icon { font-size: 32px; }
	.mh-level {
		display: inline-block; font-size: 12px; font-weight: 600;
		padding: 2px 10px; border-radius: 100px; margin-right: 8px;
	}
	.mh-duration { font-size: 13px; color: var(--text-muted); }
	.mh-title { font-size: 28px; font-weight: 700; color: var(--text); margin: 0 0 8px; }
	.mh-desc { font-size: 15px; color: var(--text-secondary); margin: 0; }

	/* Tabs */
	.tab-bar {
		display: flex; gap: 4px; margin-bottom: 24px;
		border-bottom: 2px solid var(--border); padding-bottom: 0;
	}
	.tab {
		padding: 10px 20px; border: none; background: none;
		font-size: 14px; font-weight: 600; color: var(--text-muted);
		cursor: pointer; border-bottom: 2px solid transparent;
		margin-bottom: -2px; transition: color 0.15s, border-color 0.15s;
	}
	.tab:hover { color: var(--text-secondary); }
	.tab.active { color: var(--accent); border-bottom-color: var(--accent); }

	/* Loading / Error */
	.loading-skeleton, .error-msg, .empty-exercise { text-align: center; padding: 32px 24px; }
	.loading-skeleton { display: flex; flex-direction: column; gap: 0.5rem; align-items: stretch; }
	.error-msg h2 { font-size: 24px; color: var(--danger); }
	.error-msg p { color: var(--text-muted); }
	.empty-exercise p { color: var(--text-muted); font-size: 15px; }

	/* Markdown body */
	.markdown-body { line-height: 1.75; font-size: 16px; color: var(--text); font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; }
	.markdown-body :global(h1) { font-size: 28px; font-weight: 700; margin: 40px 0 16px; color: var(--text); }
	.markdown-body :global(h2) { font-size: 22px; font-weight: 700; margin: 36px 0 12px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 8px; }
	.markdown-body :global(h3) { font-size: 18px; font-weight: 700; margin: 28px 0 10px; color: var(--text); }
	.markdown-body :global(h4) { font-size: 16px; font-weight: 600; margin: 24px 0 8px; }
	.markdown-body :global(p) { margin: 0 0 16px; }
	.markdown-body :global(ul), .markdown-body :global(ol) { margin: 0 0 16px; padding-left: 24px; }
	.markdown-body :global(li) { margin-bottom: 6px; }
	.markdown-body :global(code) { background: var(--surface-alt); padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: 'JetBrains Mono', monospace; }
	.markdown-body :global(pre) { background: #1a1a2e; color: #e2e8f0; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 0 0 20px; }
	.markdown-body :global(pre code) { background: none; padding: 0; color: inherit; font-size: 13px; }
	.markdown-body :global(table) { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 14px; }
	.markdown-body :global(th), .markdown-body :global(td) { padding: 10px 12px; border: 1px solid var(--border); text-align: left; }
	.markdown-body :global(th) { background: #f9fafb; font-weight: 600; }
	.markdown-body :global(blockquote) { border-left: 4px solid var(--accent); padding: 12px 20px; margin: 0 0 20px; background: var(--accent-light); border-radius: 0 8px 8px 0; }
	.markdown-body :global(a) { color: var(--accent); }
	.markdown-body :global(strong) { font-weight: 700; }
	.markdown-body :global(hr) { border: none; border-top: 1px solid var(--border); margin: 32px 0; }

	/* Navigation */
	.module-nav {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 16px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}
	.nav-btn {
		background: #f9fafb;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.nav-btn:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.1); }
	.nav-next { text-align: right; }
	.nav-dir { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
	.nav-title { display: block; font-size: 14px; font-weight: 600; color: var(--text); }
	.nav-check {
		background: #f9fafb; border: 1px solid var(--border); border-radius: 10px;
		padding: 16px 20px; font-size: 14px; cursor: pointer;
		transition: border-color 0.2s;
	}
	.nav-check:hover { border-color: var(--success); }

	/* Mobile responsive */
	@media (max-width: 860px) {
		.module-layout { grid-template-columns: 1fr; }
		.sidebar-toggle { display: block; }
		.module-sidebar {
			position: fixed; left: -300px; top: 0; width: 280px; z-index: 200;
			transition: left 0.3s ease;
		}
		.sidebar-open .module-sidebar { left: 0; }
		.sidebar-overlay {
			display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4);
			z-index: 150;
		}
		.module-content { padding: 24px 16px 64px; }
		.module-nav { grid-template-columns: 1fr; }
		.nav-next { text-align: left; }
		.breadcrumb { font-size: 12px; }
		.bc-current { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.mh-title { font-size: 22px; }
		.module-tabs { gap: 0; }
		.module-tab { padding: 10px 14px; font-size: 13px; }
		.reading-progress-bar { display: none; }
	}

	/* Reading progress */
	.read-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: var(--accent);
		z-index: 200;
		transition: width 0.1s ease-out;
		border-radius: 0 2px 2px 0;
	}

	/* Fullscreen toggle */
	.fs-toggle {
		position: fixed; top: 14px; left: 14px; z-index: 90;
		background: var(--surface, #fff); border: 1px solid var(--border, #e2e8f0);
		border-radius: 6px; padding: 8px 10px; cursor: pointer;
		color: var(--text-secondary, #666); font-size: 16px;
		transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
	}
	.fs-toggle:hover { background: var(--surface-alt, #f4f4f5); color: var(--text, #1a1a1a); }

	/* Fullscreen mode — hide course sidebar, content w-full */
	.module-layout.fullscreen .module-sidebar { display: none; }
	.module-layout.fullscreen { grid-template-columns: 1fr; max-width: none; margin: 0; }
	.module-layout.fullscreen .module-content { padding: 32px 64px 64px; max-width: 900px; margin: 0 auto; }
	.module-layout.fullscreen .fs-toggle { left: 14px; }

	/* Breadcrumb */
	.breadcrumb {
		display: flex; align-items: center; gap: 8px;
		font-size: 13px; margin-bottom: 24px; padding-bottom: 16px;
		border-bottom: 1px solid var(--border);
	}
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.bc-sep { color: var(--text-muted); font-size: 16px; }
	.bc-current { color: var(--text-secondary); font-weight: 600; }

	/* Fade-in on load */
	.module-content { animation: fadeIn 0.25s ease-out; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

	/* Keyboard shortcuts */
	.shortcuts-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
	.shortcuts-panel { background: var(--surface); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-lg); max-width: 360px; width: 90%; }
	.shortcuts-panel h3 { margin: 0 0 20px; font-size: 18px; color: var(--text); }
	.sc-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; font-size: 14px; color: var(--text-secondary); }
	kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 28px; padding: 0 8px; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 6px; font-family: 'Inter', monospace; font-size: 12px; font-weight: 600; color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
	.sc-close { margin-top: 20px; width: 100%; padding: 10px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; }
</style>
