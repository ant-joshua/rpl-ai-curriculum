<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { onMount } from 'svelte';
	import { projectsStore, type Project } from '$lib/stores/projects.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let project = $state<Project | null>(data.project);
	let progress = $state<any>(null);
	let started = $state(false);

	const projectIcons: Record<string, string> = {
		'portfolio-site': '🌐',
		'interactive-quiz': '📝',
		'task-manager-api': '📋',
		'component-gallery': '🧩',
		'fullstack-blog': '📝',
	};

	onMount(async () => {
		if (project) {
			projectsStore.loadProject(project.slug);
			await projectsStore.loadProgress(project.slug);
			progress = projectsStore.progress;
			started = progress.currentStep > 0;
		}
	});

	function getDifficultyEmoji(d: string) {
		if (d === 'beginner') return '🌱';
		if (d === 'intermediate') return '📐';
		return '🚀';
	}

	function getDifficultyLabel(d: string) {
		if (d === 'beginner') return 'Pemula';
		if (d === 'intermediate') return 'Menengah';
		return 'Mahir';
	}

	function startProject() {
		goto(`/projects/${project?.slug}/workspace`);
	}
</script>

<svelte:head>
	<title>{project?.title || 'Project'} - RPL AI LMS</title>
</svelte:head>

<div class="detail-page">
	{#if project}
		<a href="/projects" class="back-link">← Kembali ke Project Studio</a>

		<div class="detail-header">
			<div class="detail-icon">{projectIcons[project.slug] || '📁'}</div>
			<div class="detail-info">
				<h1>{project.title}</h1>
				<p>{project.description}</p>
				<div class="detail-meta">
					<span class="meta-item">{getDifficultyEmoji(project.difficulty)} {getDifficultyLabel(project.difficulty)}</span>
					<span class="meta-item">⏱ {project.timeEstimate}</span>
					<span class="meta-item">📄 {project.steps.length} langkah</span>
				</div>
				<div class="tech-badges">
					{#each project.techs as tech}
						<span class="tech-badge">{tech}</span>
					{/each}
				</div>
			</div>
		</div>

		<div class="steps-preview">
			<h2>📋 Langkah-langkah</h2>
			<div class="steps-list">
				{#each project.steps as step, i}
					<div class="step-item">
						<div class="step-number" class:done={progress?.completedSteps?.includes(step.id)}>
							{progress?.completedSteps?.includes(step.id) ? '✅' : i + 1}
						</div>
						<div class="step-info">
							<h4>{step.title}</h4>
							<p>{step.instruction.substring(0, 120)}...</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="action-bar">
			{#if started}
				<button class="start-btn" onclick={startProject}>
					▶️ Lanjutkan (Langkah {progress.currentStep})
				</button>
			{:else}
				<button class="start-btn" onclick={startProject}>
					🚀 Mulai Project
				</button>
			{/if}
		</div>
	{:else}
		<div class="not-found">
			<h2>Project tidak ditemukan</h2>
			<a href="/projects" class="back-link">← Kembali</a>
		</div>
	{/if}
</div>

<style>
	.detail-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}
	.back-link {
		color: var(--accent);
		text-decoration: none;
		font-size: 0.9rem;
		display: inline-block;
		margin-bottom: 1.5rem;
	}
	.back-link:hover { text-decoration: underline; }
	.detail-header {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		margin-bottom: 2rem;
	}
	.detail-icon { font-size: 4rem; }
	.detail-info { flex: 1; }
	.detail-info h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
	.detail-info p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }
	.detail-meta { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
	.meta-item { font-size: 0.9rem; color: var(--muted); }
	.tech-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
	.tech-badge {
		background: var(--accent-dim); color: var(--accent);
		padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.82rem; font-weight: 500;
	}
	.steps-preview { margin-bottom: 2rem; }
	.steps-preview h2 { font-size: 1.2rem; margin-bottom: 1rem; }
	.steps-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.step-item {
		display: flex; gap: 1rem; align-items: flex-start;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: 8px; padding: 1rem;
	}
	.step-number {
		width: 32px; height: 32px; border-radius: 50%;
		background: var(--accent-dim); color: var(--accent);
		display: flex; align-items: center; justify-content: center;
		font-weight: 700; font-size: 0.85rem; flex-shrink: 0;
	}
	.step-number.done { background: #1b4332; color: #27ae60; }
	.step-info h4 { font-size: 0.95rem; margin-bottom: 0.25rem; }
	.step-info p { font-size: 0.85rem; color: var(--muted); }
	.action-bar { text-align: center; padding: 1.5rem 0; }
	.start-btn {
		background: var(--accent); color: #fff; border: none;
		border-radius: 10px; padding: 1rem 2.5rem;
		font-size: 1.1rem; font-weight: 600; cursor: pointer;
		transition: opacity 0.2s;
	}
	.start-btn:hover { opacity: 0.9; }
	.not-found { text-align: center; padding: 4rem 2rem; }
	.not-found h2 { margin-bottom: 1rem; }
</style>
