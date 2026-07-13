<script lang="ts">
	import { projectsStore, type Project, type Step } from '$lib/stores/projects.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
	let project = $state<Project>(data.project);
	let currentStepIdx = $state(0);
	let code = $state('');
	let showHint = $state(false);
	let verifyResult = $state<{passed: boolean; checks: any[]; message: string} | null>(null);
	let activeTab = $state<'code' | 'preview'>('code');
	let verifying = $state(false);
	let saving = $state(false);
	let completedSteps = $state<number[]>([]);
	let projectCompleted = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		if (browser) {
			loadProgress();
		}
	});

	async function loadProgress() {
		if (!project || !browser) {
			if (!project) error = 'Project tidak ditemukan.';
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			await projectsStore.loadProgress(project.slug);
			const p = projectsStore.progress;
			if (p) {
				completedSteps = p.completedSteps || [];
				if (p.completed) projectCompleted = true;
				// Find first incomplete step
				let stepToLoad = 0;
				for (let i = 0; i < project.steps.length; i++) {
					if (!completedSteps.includes(project.steps[i].id)) {
						stepToLoad = i;
						break;
					}
				}
				currentStepIdx = stepToLoad;
				code = project.steps[stepToLoad]?.starterCode || '';
				// Restore code state if exists
				if (p.codeState && p.codeState[project.steps[stepToLoad]?.id]) {
					code = p.codeState[project.steps[stepToLoad].id];
				}
			}
		} catch (e) {
			console.error('Failed to load progress:', e);
			error = 'Gagal memuat progress. Coba refresh halaman.';
		} finally {
			loading = false;
		}
	}

	let currentStep = $derived(project?.steps[currentStepIdx] || null);
	let totalSteps = $derived(project?.steps.length || 0);
	let progressPct = $derived(totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0);

	function goToStep(index: number) {
		if (index < 0 || index >= totalSteps) return;
		currentStepIdx = index;
		const step = project.steps[index];
		const savedCode = projectsStore.progress.codeState?.[step.id];
		code = savedCode || step.starterCode || '';
		verifyResult = null;
		showHint = false;
		activeTab = 'code';
	}

	async function verifyStep() {
		if (!currentStep) return;
		verifying = true;
		try {
			const deviceId = localStorage.getItem('device_id') || 'anonymous';
			const res = await fetch(`/api/project/${project.slug}/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
				body: JSON.stringify({ code, stepId: currentStep.id }),
			});
			verifyResult = await res.json();
		} catch (e) {
			verifyResult = { passed: false, checks: [], message: 'Gagal verifikasi. Coba lagi.' };
		} finally {
			verifying = false;
		}
	}

	async function saveProgress() {
		if (!project || !browser) return;
		saving = true;
		projectsStore.saveCode(currentStep.id, code);
		try {
			const deviceId = localStorage.getItem('device_id') || 'anonymous';
			await fetch(`/api/project/${project.slug}/progress`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
				body: JSON.stringify({
					current_step: currentStep.id,
					completed_steps: completedSteps,
					code_state: projectsStore.progress.codeState,
				}),
			});
		} catch {} finally {
			saving = false;
		}
	}

	let autoSaveTimer: ReturnType<typeof setTimeout> | undefined;
	function onCodeChange(value: string) {
		code = value;
		projectsStore.saveCode(currentStep.id, value);
		clearTimeout(autoSaveTimer);
		autoSaveTimer = setTimeout(saveProgress, 2000);
	}

	async function completeStep() {
		if (!project) return;
		const ok = await projectsStore.completeStep(project.slug, currentStep.id);
		if (ok) {
			if (!completedSteps.includes(currentStep.id)) {
				completedSteps = [...completedSteps, currentStep.id];
			}
			projectsStore.saveCode(currentStep.id, code);
			await saveProgress();

			if (currentStepIdx < totalSteps - 1) {
				goToStep(currentStepIdx + 1);
			} else {
				projectCompleted = true;
				const gamification = (await import('$lib/stores/gamification.svelte')).gamification;
				gamification.addXp(50);
			}
		}
	}

	async function resetProgress() {
		if (!project || !confirm('Reset progress project ini?')) return;
		completedSteps = [];
		projectCompleted = false;
		currentStepIdx = 0;
		code = project.steps[0]?.starterCode || '';
		verifyResult = null;
		showHint = false;
		const deviceId = localStorage.getItem('device_id') || 'anonymous';
		await fetch(`/api/project/${project.slug}/progress`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
			body: JSON.stringify({ current_step: 0, completed_steps: [], code_state: {} }),
		});
	}
</script>

<svelte:head>
	<title>Studio: {project?.title} - RPL AI LMS</title>
</svelte:head>

<div class="workspace">
	<!-- Header bar -->
	<div class="workspace-header">
		<div class="header-left">
			<a href="/projects/{project?.slug}" class="back-link">←</a>
			<span class="project-title">{project?.title}</span>
			<span class="step-counter">Langkah {currentStepIdx + 1}/{totalSteps}</span>
		</div>
		<div class="header-center">
			<div class="progress-steps">
				{#each project?.steps || [] as step, i}
					<button
						class="step-dot"
						class:active={i === currentStepIdx}
						class:done={completedSteps.includes(step.id)}
						class:future={i > currentStepIdx}
						onclick={() => goToStep(i)}
						title={step.title}
					>{i + 1}</button>
				{/each}
			</div>
		</div>
		<div class="header-right">
			<span class="progress-pct">{progressPct}%</span>
			<button class="reset-btn" onclick={resetProgress} title="Reset progress">🔄</button>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="progress-bar-track">
		<div class="progress-bar-fill" style="width: {progressPct}%"></div>
	</div>

	{#if loading}
		<!-- Loading skeleton -->
		<div class="workspace-loading">
			<div class="loading-skeleton">
				<div class="skeleton-block skeleton-title"></div>
				<div class="skeleton-block skeleton-line skeleton-line--short"></div>
				<div class="skeleton-block skeleton-line"></div>
				<div class="skeleton-block skeleton-line"></div>
				<div class="skeleton-block skeleton-line skeleton-line--medium"></div>
				<div class="skeleton-block skeleton-editor"></div>
			</div>
			<p class="loading-text">Memuat studio...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="workspace-error">
			<span class="error-icon">❌</span>
			<h2>Gagal Memuat Project</h2>
			<p>{error}</p>
			<button class="action-btn" onclick={() => loadProgress()}>🔄 Coba Lagi</button>
			<a href="/projects" class="action-btn secondary">← Kembali ke Project Studio</a>
		</div>
	{:else if projectCompleted}
		<div class="completed-banner">
			<h2>🎉 Selamat! Kamu menyelesaikan {project.title}!</h2>
			<p>+50 XP telah diberikan.</p>
			<div class="completed-actions">
				<a href="/projects" class="action-btn">← Kembali ke Project Studio</a>
				<button class="action-btn secondary" onclick={resetProgress}>🔄 Ulangi Project</button>
			</div>
		</div>
	{:else if currentStep}
		<div class="workspace-body">
			<!-- Left: Instructions -->
			<div class="instruction-panel">
				<div class="step-header">
					<span class="step-badge">Langkah {currentStep.id}/{totalSteps}</span>
					<h2>{currentStep.title}</h2>
				</div>
				<div class="instruction-content">
					{currentStep.instruction}
				</div>

				{#if showHint}
					<div class="hint-box">
						<strong>💡 Petunjuk:</strong>
						<p>{currentStep.hint}</p>
					</div>
				{/if}
				<button class="hint-btn" onclick={() => (showHint = !showHint)}>
					{showHint ? '🙈 Sembunyikan' : '💡 Petunjuk'}
				</button>
			</div>

			<!-- Right: Code editor + Preview -->
			<div class="code-panel">
				<div class="panel-tabs">
					<button
						class="panel-tab"
						class:active={activeTab === 'code'}
						onclick={() => (activeTab = 'code')}
					>✏️ Editor</button>
					<button
						class="panel-tab"
						class:active={activeTab === 'preview'}
						onclick={() => (activeTab = 'preview')}
					>👁️ Preview</button>
				</div>

				<div class="panel-content">
					{#if activeTab === 'code'}
						<textarea
							class="code-editor"
							value={code}
							oninput={(e) => onCodeChange((e.target as HTMLTextAreaElement).value)}
							spellcheck="false"
							placeholder="Tulis kodemu di sini..."
						></textarea>
					{:else}
						<div class="preview-container">
							<iframe srcdoc={code} class="preview-frame" title="Preview" sandbox="allow-scripts"></iframe>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Footer: Verify + Next -->
		<div class="workspace-footer">
			<div class="footer-left">
				{#if verifyResult}
					<div class="verify-result" class:passed={verifyResult.passed} class:failed={!verifyResult.passed}>
						<span class="verify-icon">{verifyResult.passed ? '✅' : '❌'}</span>
						<span>{verifyResult.message}</span>
					</div>
				{/if}
				<span class="save-status">{saving ? 'Menyimpan...' : ''}</span>
			</div>
			<div class="footer-actions">
				<button class="verify-btn" onclick={verifyStep} disabled={verifying || !code.trim()}>
					{verifying ? '⏳ Mengecek...' : '✅ Verifikasi'}
				</button>
				<button
					class="next-btn"
					onclick={completeStep}
					disabled={!verifyResult?.passed}
				>
					{currentStepIdx < totalSteps - 1 ? '➡️ Langkah Selanjutnya' : '🏁 Selesaikan Project'}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.workspace {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--bg);
		overflow: hidden;
	}

	.workspace-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		gap: 1rem;
	}
	.header-left { display: flex; align-items: center; gap: 0.75rem; }
	.back-link { color: var(--accent); text-decoration: none; font-size: 1.2rem; }
	.project-title { font-weight: 600; font-size: 0.95rem; }
	.step-counter { color: var(--muted); font-size: 0.85rem; }
	.header-center { flex: 1; display: flex; justify-content: center; }
	.progress-steps { display: flex; gap: 4px; }
	.step-dot {
		width: 28px; height: 28px; border-radius: 50%;
		border: 2px solid var(--border); background: var(--surface);
		color: var(--muted); font-size: 0.75rem; font-weight: 600;
		cursor: pointer; transition: all 0.15s;
		display: flex; align-items: center; justify-content: center;
	}
	.step-dot.active { border-color: var(--accent); background: var(--accent); color: #fff; }
	.step-dot.done { border-color: #27ae60; background: #1b4332; color: #27ae60; }
	.step-dot.future { opacity: 0.5; }
	.step-dot:hover { opacity: 1; }
	.header-right { display: flex; align-items: center; gap: 0.5rem; }
	.progress-pct { font-size: 0.85rem; color: var(--muted); font-weight: 600; }
	.reset-btn { background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--muted); padding: 0.25rem; border-radius: 4px; }
	.reset-btn:hover { background: var(--hover); }

	.progress-bar-track { height: 3px; background: var(--border); }
	.progress-bar-fill { height: 100%; background: var(--accent); transition: width 0.3s; }

	/* Loading skeleton */
	.workspace-loading {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		gap: 1.5rem;
	}
	.loading-skeleton {
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.skeleton-block {
		background: linear-gradient(90deg, var(--surface) 0%, var(--hover) 50%, var(--surface) 100%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		border-radius: 6px;
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.skeleton-title { height: 22px; width: 60%; }
	.skeleton-line { height: 14px; width: 100%; }
	.skeleton-line--short { width: 40%; }
	.skeleton-line--medium { width: 75%; }
	.skeleton-editor { height: 200px; width: 100%; border-radius: 8px; margin-top: 0.5rem; }
	.loading-text { color: var(--muted); font-size: 0.9rem; }

	/* Error state */
	.workspace-error {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		gap: 1rem;
	}
	.error-icon { font-size: 3rem; }
	.workspace-error h2 { font-size: 1.3rem; }
	.workspace-error p { color: var(--text-secondary); max-width: 400px; }
	.workspace-error .action-btn {
		background: var(--accent); color: #fff; border: none; border-radius: 8px;
		padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; cursor: pointer;
		text-decoration: none; display: inline-block;
	}
	.workspace-error .action-btn.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
	.workspace-error .action-btn:hover { opacity: 0.9; }

	.completed-banner {
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		padding: 4rem 2rem; text-align: center; gap: 1rem; flex: 1;
	}
	.completed-banner h2 { font-size: 1.5rem; }
	.completed-banner p { color: var(--text-secondary); }
	.completed-actions { display: flex; gap: 1rem; margin-top: 1rem; }
	.action-btn {
		background: var(--accent); color: #fff; border: none; border-radius: 8px;
		padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; cursor: pointer;
		text-decoration: none; display: inline-block;
	}
	.action-btn.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }

	.workspace-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.instruction-panel {
		width: 40%;
		min-width: 320px;
		overflow-y: auto;
		padding: 1.5rem;
		border-right: 1px solid var(--border);
		background: var(--surface);
	}
	.step-header { margin-bottom: 1rem; }
	.step-badge {
		display: inline-block; background: var(--accent-dim); color: var(--accent);
		padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.step-header h2 { font-size: 1.2rem; font-weight: 600; }
	.instruction-content { font-size: 0.92rem; line-height: 1.7; color: var(--text-secondary); }
	.instruction-content .code-block {
		background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px;
		font-family: 'Fira Code', monospace; font-size: 0.85rem; overflow-x: auto;
		margin: 0.5rem 0;
	}
	.instruction-content .bullet { margin-left: 1rem; list-style: none; }
	.instruction-content strong { color: var(--text); }

	.hint-box {
		background: #1b4332; border: 1px solid #27ae60; border-radius: 8px;
		padding: 1rem; margin: 1rem 0; font-size: 0.9rem;
	}
	.hint-btn {
		background: none; border: 1px solid var(--border); color: var(--text-secondary);
		padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
	}
	.hint-btn:hover { border-color: var(--accent); }

	.code-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.panel-tabs {
		display: flex; border-bottom: 1px solid var(--border); background: var(--surface);
	}
	.panel-tab {
		padding: 0.6rem 1.2rem; background: none; border: none;
		color: var(--muted); font-size: 0.85rem; cursor: pointer;
		border-bottom: 2px solid transparent; transition: all 0.15s;
	}
	.panel-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
	.panel-content { flex: 1; display: flex; overflow: hidden; }

	.code-editor {
		flex: 1;
		background: #1e1e1e;
		color: #d4d4d4;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 14px;
		line-height: 1.6;
		padding: 1.5rem;
		border: none;
		resize: none;
		outline: none;
		tab-size: 2;
		width: 100%;
		min-height: 200px;
		box-sizing: border-box;
	}
	.code-editor::placeholder { color: #555; }

	.preview-container { flex: 1; background: #fff; }
	.preview-frame { width: 100%; height: 100%; border: none; }

	.workspace-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--surface);
		border-top: 1px solid var(--border);
		gap: 1rem;
	}
	.footer-left { display: flex; align-items: center; gap: 1rem; flex: 1; }
	.verify-result { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
	.verify-result.passed { color: #27ae60; }
	.verify-result.failed { color: #e74c3c; }
	.save-status { font-size: 0.8rem; color: var(--muted); }
	.footer-actions { display: flex; gap: 0.75rem; }
	.verify-btn, .next-btn {
		padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.9rem;
		font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s;
	}
	.verify-btn { background: var(--accent); color: #fff; }
	.verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.verify-btn:hover:not(:disabled) { opacity: 0.9; }
	.next-btn { background: #27ae60; color: #fff; }
	.next-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.next-btn:hover:not(:disabled) { opacity: 0.9; }

	/* Mobile responsive: stack vertically on <768px */
	@media (max-width: 767px) {
		.workspace {
			height: 100dvh;
		}

		.workspace-header {
			flex-wrap: wrap;
			padding: 0.5rem 0.75rem;
			gap: 0.4rem;
		}
		.header-center { order: 3; flex: 0 0 100%; justify-content: center; }
		.step-dot { width: 26px; height: 26px; font-size: 0.7rem; }

		.workspace-body {
			flex-direction: column;
			overflow-y: auto;
		}

		.instruction-panel {
			width: 100%;
			min-width: 0;
			border-right: none;
			border-bottom: 1px solid var(--border);
			padding: 1rem;
			max-height: 40vh;
			overflow-y: auto;
		}

		.code-panel {
			flex: 1;
			min-height: 300px;
		}

		.code-editor {
			font-size: 13px;
			padding: 1rem;
			min-height: 250px;
		}

		.preview-container { min-height: 300px; }

		.workspace-footer {
			flex-wrap: wrap;
			padding: 0.5rem 0.75rem;
		}
		.footer-left { flex: 0 0 100%; order: 2; }
		.footer-actions { flex: 1; justify-content: flex-end; }
		.verify-btn, .next-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }

		.completed-banner h2 { font-size: 1.2rem; }
		.completed-actions { flex-direction: column; }
	}
</style>
