<script lang="ts">
	import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
	import { aiModules, finalProject, type AiModule } from '$lib/stores/ai-course';
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

	const mod = $derived(data.module as AiModule);
	const next = $derived(data.next as AiModule | undefined);
	const prev = $derived(data.prev as AiModule | undefined);
	const levelColors: Record<string, string> = { Pemula: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };
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
</script>

<svelte:head>
	<title>{isFinalProject ? finalProject.title : mod.title} — AI Complete Course</title>
</svelte:head>

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
					<span class="sl-level" style="color: #2563eb">Capstone</span>
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
		<!-- Module header -->
		<div class="module-header">
			<div class="mh-top">
				<span class="mh-icon">{isFinalProject ? finalProject.icon : mod.icon}</span>
				<div>
					<span class="mh-level" style="background: {isFinalProject ? '#2563eb' : levelColors[mod.level]}10; color: {isFinalProject ? '#2563eb' : levelColors[mod.level]}; border: 1px solid {isFinalProject ? '#2563eb' : levelColors[mod.level]}30">
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
				<div class="loading">Memuat konten...</div>
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
				<div class="loading">Memuat latihan...</div>
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
		border-right: 1px solid #eee;
		background: #fafafa;
		padding: 20px 0;
	}
	.sidebar-header { padding: 0 16px 16px; border-bottom: 1px solid #eee; }
	.back-link { font-size: 13px; color: #2563eb; text-decoration: none; display: block; margin-bottom: 8px; }
	.back-link:hover { text-decoration: underline; }
	.sidebar-header h3 { font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0; }

	.sidebar-nav { padding: 8px 0; }
	.sidebar-link {
		display: flex; align-items: center; gap: 10px;
		padding: 8px 16px; text-decoration: none; color: #555;
		font-size: 13px; transition: background 0.15s;
		border-left: 3px solid transparent;
	}
	.sidebar-link:hover { background: #f0f0f0; }
	.sidebar-link.active { background: #eff6ff; border-left-color: #2563eb; color: #1a1a1a; font-weight: 600; }
	.sidebar-link.completed .sl-title { color: #16a34a; }
	.sl-icon { font-size: 16px; flex-shrink: 0; }
	.sl-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
	.sl-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.sl-level { font-size: 11px; font-weight: 600; }
	.sl-check { font-size: 14px; flex-shrink: 0; }

	/* Mobile */
	.sidebar-toggle {
		display: none;
		position: fixed; bottom: 20px; right: 20px; z-index: 100;
		background: #2563eb; color: #fff; border: none; border-radius: 100px;
		padding: 10px 20px; font-size: 14px; font-weight: 600;
		box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer;
	}
	.sidebar-overlay { display: none; }

	/* Main content */
	.module-content { padding: 32px 48px 64px; min-width: 0; }

	/* Module header */
	.module-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
	.mh-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
	.mh-icon { font-size: 32px; }
	.mh-level {
		display: inline-block; font-size: 12px; font-weight: 600;
		padding: 2px 10px; border-radius: 100px; margin-right: 8px;
	}
	.mh-duration { font-size: 13px; color: #888; }
	.mh-title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
	.mh-desc { font-size: 15px; color: #666; margin: 0; }

	/* Tabs */
	.tab-bar {
		display: flex; gap: 4px; margin-bottom: 24px;
		border-bottom: 2px solid #eee; padding-bottom: 0;
	}
	.tab {
		padding: 10px 20px; border: none; background: none;
		font-size: 14px; font-weight: 600; color: #888;
		cursor: pointer; border-bottom: 2px solid transparent;
		margin-bottom: -2px; transition: color 0.15s, border-color 0.15s;
	}
	.tab:hover { color: #555; }
	.tab.active { color: #2563eb; border-bottom-color: #2563eb; }

	/* Loading / Error */
	.loading, .error-msg, .empty-exercise { text-align: center; padding: 64px 24px; }
	.loading { color: #888; font-size: 16px; }
	.error-msg h2 { font-size: 24px; color: #ef4444; }
	.error-msg p { color: #888; }
	.empty-exercise p { color: #888; font-size: 15px; }

	/* Markdown body */
	.markdown-body { line-height: 1.75; font-size: 16px; color: #333; }
	.markdown-body :global(h1) { font-size: 28px; font-weight: 700; margin: 40px 0 16px; color: #1a1a1a; }
	.markdown-body :global(h2) { font-size: 22px; font-weight: 700; margin: 36px 0 12px; color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 8px; }
	.markdown-body :global(h3) { font-size: 18px; font-weight: 700; margin: 28px 0 10px; color: #1a1a1a; }
	.markdown-body :global(h4) { font-size: 16px; font-weight: 600; margin: 24px 0 8px; }
	.markdown-body :global(p) { margin: 0 0 16px; }
	.markdown-body :global(ul), .markdown-body :global(ol) { margin: 0 0 16px; padding-left: 24px; }
	.markdown-body :global(li) { margin-bottom: 6px; }
	.markdown-body :global(code) { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: 'JetBrains Mono', monospace; }
	.markdown-body :global(pre) { background: #1a1a2e; color: #e2e8f0; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 0 0 20px; }
	.markdown-body :global(pre code) { background: none; padding: 0; color: inherit; font-size: 13px; }
	.markdown-body :global(table) { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 14px; }
	.markdown-body :global(th), .markdown-body :global(td) { padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left; }
	.markdown-body :global(th) { background: #f9fafb; font-weight: 600; }
	.markdown-body :global(blockquote) { border-left: 4px solid #2563eb; padding: 12px 20px; margin: 0 0 20px; background: #eff6ff; border-radius: 0 8px 8px 0; }
	.markdown-body :global(a) { color: #2563eb; }
	.markdown-body :global(strong) { font-weight: 700; }
	.markdown-body :global(hr) { border: none; border-top: 1px solid #eee; margin: 32px 0; }

	/* Navigation */
	.module-nav {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 16px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid #eee;
	}
	.nav-btn {
		background: #f9fafb;
		border: 1px solid #eee;
		border-radius: 10px;
		padding: 16px;
		text-decoration: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.nav-btn:hover { border-color: #2563eb; box-shadow: 0 2px 8px rgba(37,99,235,0.1); }
	.nav-next { text-align: right; }
	.nav-dir { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
	.nav-title { display: block; font-size: 14px; font-weight: 600; color: #1a1a1a; }
	.nav-check {
		background: #f9fafb; border: 1px solid #eee; border-radius: 10px;
		padding: 16px 20px; font-size: 14px; cursor: pointer;
		transition: border-color 0.2s;
	}
	.nav-check:hover { border-color: #22c55e; }

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
</style>
