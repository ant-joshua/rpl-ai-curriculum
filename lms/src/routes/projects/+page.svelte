<script lang="ts">
	import { onMount } from 'svelte';
	import { projectsStore, type Project } from '$lib/stores/projects.svelte';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';

	let projects = $state<Project[]>([]);
	let filterDifficulty = $state('all');
	let completedProjects = $state<string[]>([]);
	let loading = $state(true);

	const projectIcons: Record<string, string> = {
		'portfolio-site': '🌐',
		'interactive-quiz': '📝',
		'task-manager-api': '📋',
		'component-gallery': '🧩',
		'fullstack-blog': '📝',
	};

	onMount(async () => {
		await projectsStore.loadProjects();
		projects = projectsStore.projects;
		await loadCompleted();
		loading = false;
	});

	async function loadCompleted() {
		if (!browser) return;
		try {
			const deviceId = localStorage.getItem('device_id') || 'anonymous';
			const res = await fetch('/api/projects', { headers: { 'x-device-id': deviceId } });
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					completedProjects = json.data
						.filter((p: any) => p.completed_at)
						.map((p: any) => p.project_slug);
				}
			}
		} catch {}
	}

	let filteredProjects = $derived(
		filterDifficulty === 'all'
			? projects
			: projects.filter((p) => p.difficulty === filterDifficulty)
	);

	function isCompleted(slug: string) {
		return completedProjects.includes(slug);
	}
</script>

<div class="projects-page">
	<h1>🚀 Project Studio</h1>
	<p class="subtitle">Belajar dengan bikin project nyata, step-by-step. Pilih project, ikuti instruksi, verifikasi kode, dapatkan XP!</p>

	<div class="filter-bar">
		<button
			class="filter-btn"
			class:active={filterDifficulty === 'all'}
			onclick={() => (filterDifficulty = 'all')}
		>Semua</button>
		<button
			class="filter-btn"
			class:active={filterDifficulty === 'beginner'}
			onclick={() => (filterDifficulty = 'beginner')}
		>🌱 Pemula</button>
		<button
			class="filter-btn"
			class:active={filterDifficulty === 'intermediate'}
			onclick={() => (filterDifficulty = 'intermediate')}
		>📐 Menengah</button>
		<button
			class="filter-btn"
			class:active={filterDifficulty === 'advanced'}
			onclick={() => (filterDifficulty = 'advanced')}
		>🚀 Mahir</button>
	</div>

	{#if loading}
		<div class="project-grid">
			{#each [1, 2, 3, 4] as _}
				<div class="skeleton-card">
					<div class="skeleton skeleton-icon"></div>
					<div class="skeleton skeleton-title"></div>
					<div class="skeleton skeleton-desc"></div>
					<div class="skeleton skeleton-desc skeleton-desc--short"></div>
					<div class="skeleton-card-footer">
						<div class="skeleton skeleton-badge"></div>
						<div class="skeleton skeleton-meta"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if filteredProjects.length === 0}
		<div class="empty-state">
			<span class="empty-icon">📭</span>
			<h2>Tidak ada project ditemukan</h2>
			<p>
				{#if filterDifficulty !== 'all'}
					Tidak ada project dengan tingkat <strong>{filterDifficulty}</strong>. Coba pilih filter lain.
				{:else}
					Belum ada project yang tersedia. Silakan cek lagi nanti.
				{/if}
			</p>
			{#if filterDifficulty !== 'all'}
				<button class="empty-cta" onclick={() => (filterDifficulty = 'all')}>Lihat Semua Project</button>
			{/if}
		</div>
	{:else}
		<div in:fade={{ duration: 200 }}>
			<div class="project-grid">
				{#each filteredProjects as project}
					<a href="/projects/{project.slug}" class="project-card">
						<div class="card-header">
							<span class="project-icon">{projectIcons[project.slug] || '📁'}</span>
							{#if isCompleted(project.slug)}
								<span class="completed-badge">✅</span>
							{/if}
						</div>
						<h3>{project.title}</h3>
						<p>{project.description}</p>
						<div class="card-meta">
							<div class="tech-badges">
								{#each project.techs as tech}
									<span class="tech-badge">{tech}</span>
								{/each}
							</div>
							<div class="meta-row">
								<span class="difficulty {project.difficulty}">{project.difficulty}</span>
								<span class="time">⏱ {project.timeEstimate}</span>
								<span class="steps-count">{project.steps.length} langkah</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.projects-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	h1 {
		font-size: 1.8rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: var(--muted);
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}
	.filter-bar {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}
	.filter-btn {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.15s;
	}
	.filter-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}
	.filter-btn.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	/* Loading skeleton cards */
	.skeleton-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.skeleton {
		background: linear-gradient(90deg, var(--surface) 0%, var(--hover) 50%, var(--surface) 100%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		border-radius: 6px;
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.skeleton-icon { width: 48px; height: 48px; border-radius: 10px; }
	.skeleton-title { width: 70%; height: 20px; }
	.skeleton-desc { width: 100%; height: 14px; }
	.skeleton-desc--short { width: 55%; }
	.skeleton-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.5rem; }
	.skeleton-badge { width: 80px; height: 22px; border-radius: 4px; }
	.skeleton-meta { width: 100px; height: 16px; border-radius: 4px; }

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		gap: 0.75rem;
	}
	.empty-icon { font-size: 3rem; }
	.empty-state h2 { font-size: 1.3rem; font-weight: 600; }
	.empty-state p { color: var(--text-secondary); max-width: 400px; }
	.empty-cta {
		background: var(--accent); color: #fff; border: none; border-radius: 8px;
		padding: 0.6rem 1.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer;
		margin-top: 0.5rem;
	}
	.empty-cta:hover { opacity: 0.9; }

	.project-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		text-decoration: none;
		color: var(--text);
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.project-card:hover {
		border-color: var(--accent);
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.15);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.project-icon {
		font-size: 2.5rem;
	}
	.completed-badge {
		font-size: 1.2rem;
	}
	h3 {
		font-size: 1.15rem;
		font-weight: 600;
	}
	p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.card-meta {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.tech-badges {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.tech-badge {
		background: var(--accent-dim);
		color: var(--accent);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.78rem;
		font-weight: 500;
	}
	.meta-row {
		display: flex;
		gap: 1rem;
		font-size: 0.82rem;
		color: var(--muted);
		align-items: center;
	}
	.difficulty.beginner { color: #27ae60; }
	.difficulty.intermediate { color: #f39c12; }
	.difficulty.advanced { color: #e74c3c; }

	/* Mobile responsive */
	@media (max-width: 767px) {
		.projects-page { padding: 1rem; }
		h1 { font-size: 1.4rem; }
		.project-grid { grid-template-columns: 1fr; gap: 1rem; }
		.skeleton-card { padding: 1rem; }
	}
</style>
