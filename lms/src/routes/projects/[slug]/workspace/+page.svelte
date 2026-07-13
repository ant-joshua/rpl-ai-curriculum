<script lang="ts">
	import { projectsStore, type Project, type Step } from '$lib/stores/projects.svelte';
	import { browser } from '$app/environment';
	import CodeSandbox from '$lib/components/CodeSandbox.svelte';
	import ServerPreview from '$lib/components/ServerPreview.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();
	let project = $state<Project>(data.project);
	let currentStepIdx = $state(0);
	let code = $state('');
	let showHint = $state(false);
	let verifyResult = $state<{passed: boolean; checks: any[]; message: string} | null>(null);
	let activeTab = $state<'code' | 'preview'>('code');
	let mobileTab = $state<'instructions' | 'code' | 'preview'>('instructions');
	let verifying = $state(false);
	let saving = $state(false);
	let completedSteps = $state<number[]>([]);
	let projectCompleted = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const browserPreviewProjects = ['portfolio-site', 'interactive-quiz', 'component-gallery', 'fullstack-blog'];
	let isBrowserProject = $derived(browserPreviewProjects.includes(project?.slug));
	let editorLang = $derived.by(() => {
		const techs = project?.techs || [];
		if (techs.some((t: string) => /html/i.test(t))) return 'html';
		if (techs.some((t: string) => /typescript|ts/i.test(t))) return 'typescript';
		if (techs.some((t: string) => /javascript|js/i.test(t))) return 'javascript';
		if (techs.some((t: string) => /css/i.test(t))) return 'css';
		return 'html';
	});

	$effect(() => {
		if (browser) loadProgress();
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
				let stepToLoad = 0;
				for (let i = 0; i < project.steps.length; i++) {
					if (!completedSteps.includes(project.steps[i].id)) {
						stepToLoad = i;
						break;
					}
				}
				currentStepIdx = stepToLoad;
				code = project.steps[stepToLoad]?.starterCode || '';
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

	function getAuthHeaders(): Record<string, string> {
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (auth.authToken) {
			headers['Authorization'] = `Bearer ${auth.authToken}`;
		} else {
			const deviceId = localStorage.getItem('device_id') || 'anonymous';
			headers['x-device-id'] = deviceId;
		}
		return headers;
	}

	async function verifyStep() {
		if (!currentStep) return;
		verifying = true;
		try {
			const res = await fetch(`/api/project/${project.slug}/verify`, {
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify({ code, stepId: currentStep.id }),
			});
			verifyResult = await res.json();
			if (verifyResult.passed) {
				addToast('Verifikasi berhasil!', 'success');
			} else {
				addToast(verifyResult.message || 'Verifikasi gagal. Coba lagi.', 'error');
			}
		} catch {
			verifyResult = { passed: false, checks: [], message: 'Gagal verifikasi. Coba lagi.' };
			addToast('Gagal verifikasi. Coba lagi.', 'error');
		} finally {
			verifying = false;
		}
	}

	async function saveProgress() {
		if (!project || !browser) return;
		saving = true;
		projectsStore.saveCode(currentStep.id, code);
		try {
			await fetch(`/api/project/${project.slug}/progress`, {
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify({
					current_step: currentStep.id,
					completed_steps: completedSteps,
					code_state: projectsStore.progress.codeState,
				}),
			});
			addToast('Progress tersimpan', 'success');
		} catch {
			addToast('Gagal menyimpan progress', 'error');
		} finally {
			saving = false;
		}
	}

	let autoSaveTimer: ReturnType<typeof setTimeout> | undefined;

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
				addToast('Langkah selesai!', 'success');
				goToStep(currentStepIdx + 1);
			} else {
				projectCompleted = true;
				const gam = (await import('$lib/stores/gamification.svelte')).gamification;
				gam.addXp(50);
				addToast(`🎉 Project "${project.title}" selesai! +50 XP`, 'success');
			}
		} else {
			addToast('Gagal menyelesaikan langkah', 'error');
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
		await fetch(`/api/project/${project.slug}/progress`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({ current_step: 0, completed_steps: [], code_state: {} }),
		});
	}
</script>

<svelte:head>
	<title>Studio: {project?.title} - RPL AI LMS</title>
</svelte:head>

<div class="workspace">
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

	<div class="progress-bar-track">
		<div class="progress-bar-fill" style="width: {progressPct}%"></div>
	</div>

	{#if loading}
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
			<!-- Mobile tab bar (hidden on desktop) -->
			<div class="mobile-tab-bar">
				<button
					class="mobile-tab"
					class:active={mobileTab === 'instructions'}
					onclick={() => (mobileTab = 'instructions')}
				>📝 Instruksi</button>
				<button
					class="mobile-tab"
					class:active={mobileTab === 'code'}
					onclick={() => { mobileTab = 'code'; activeTab = 'code'; }}
				>✏️ Code</button>
				<button
					class="mobile-tab"
					class:active={mobileTab === 'preview'}
					onclick={() => { mobileTab = 'preview'; activeTab = 'preview'; }}
				>👁️ Preview</button>
			</div>

			<div class="instruction-panel" class:mobile-show={mobileTab === 'instructions'}>
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
				<div class="mobile-verify-row">
					<button class="verify-btn" onclick={verifyStep} disabled={verifying || !code.trim()}>
						{verifying ? '⏳ Mengecek...' : '✅ Verifikasi'}
					</button>
				</div>
			</div>

			<div class="code-panel" class:mobile-show={mobileTab === 'code' || mobileTab === 'preview'}>
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
						<CodeEditor
							bind:value={code}
							lang={editorLang}
							onchange={(v) => {
								code = v;
								projectsStore.saveCode(currentStep.id, v);
								clearTimeout(autoSaveTimer);
								autoSaveTimer = setTimeout(saveProgress, 2000);
							}}
						/>
					{:else if isBrowserProject}
						<CodeSandbox bind:code />
					{:else}
						<ServerPreview
							projectSlug={project?.slug}
							techs={project?.techs}
							stepTitle={currentStep?.title}
							stepInstruction={currentStep?.instruction}
							starterCode={code}
						/>
					{/if}
				</div>
			</div>
		</div>

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

	.workspace-loading {
		flex: 1; display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		padding: 3rem 2rem; gap: 1.5rem;
	}
	.loading-skeleton { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 0.75rem; }
	.skeleton-block {
		background: linear-gradient(90deg, var(--surface) 0%, var(--hover) 50%, var(--surface) 100%);
		background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: 6px;
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

	.workspace-error {
		flex: 1; display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		padding: 4rem 2rem; text-align: center; gap: 1rem;
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

	.workspace-body { display: flex; flex: 1; overflow: hidden; }

	.instruction-panel {
		width: 40%; min-width: 320px;
		overflow-y: auto; padding: 1.5rem;
		border-right: 1px solid var(--border); background: var(--surface);
	}
	.step-header { margin-bottom: 1rem; }
	.step-badge {
		display: inline-block; background: var(--accent-dim); color: var(--accent);
		padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.step-header h2 { font-size: 1.2rem; font-weight: 600; }
	.instruction-content { font-size: 0.92rem; line-height: 1.7; color: var(--text-secondary); }
	.hint-box {
		background: #1b4332; border: 1px solid #27ae60; border-radius: 8px;
		padding: 1rem; margin: 1rem 0; font-size: 0.9rem;
	}
	.hint-btn {
		background: none; border: 1px solid var(--border); color: var(--text-secondary);
		padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
	}
	.hint-btn:hover { border-color: var(--accent); }

	.code-panel { flex: 1; display: flex; flex-direction: column; }
	.panel-tabs { display: flex; border-bottom: 1px solid var(--border); background: var(--surface); }
	.panel-tab {
		padding: 0.6rem 1.2rem; background: none; border: none;
		color: var(--muted); font-size: 0.85rem; cursor: pointer;
		border-bottom: 2px solid transparent; transition: all 0.15s;
	}
	.panel-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
	.panel-content { flex: 1; display: flex; overflow: hidden; }

	.workspace-footer {
		display: flex; align-items: center; justify-content: space-between;
		padding: 0.75rem 1rem; background: var(--surface);
		border-top: 1px solid var(--border); gap: 1rem;
	}
	.footer-left { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
	.verify-result {
		padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem;
		display: flex; align-items: center; gap: 0.4rem;
	}
	.verify-result.passed { background: #1b4332; color: #27ae60; }
	.verify-result.failed { background: #4a1a1a; color: #e74c3c; }
	.save-status { font-size: 0.8rem; color: var(--muted); }
	.footer-actions { display: flex; gap: 0.5rem; }
	.verify-btn, .next-btn {
		padding: 0.5rem 1.2rem; border: none; border-radius: 8px;
		font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
	}
	.verify-btn { background: var(--accent-dim); color: var(--accent); }
	.verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.next-btn { background: var(--accent); color: #fff; }
	.next-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.verify-btn:hover:not(:disabled), .next-btn:hover:not(:disabled) { opacity: 0.9; }

	/* Mobile tab bar — hidden on desktop */
	.mobile-tab-bar { display: none; }
	.mobile-verify-row { display: none; }

	@media (max-width: 768px) {
		.workspace-body { flex-direction: column; position: relative; }

		.mobile-tab-bar {
			display: flex;
			background: var(--surface);
			border-bottom: 1px solid var(--border);
			flex-shrink: 0;
			position: sticky;
			top: 0;
			z-index: 10;
		}

		.mobile-tab {
			flex: 1;
			padding: 0.75rem 0.5rem;
			min-height: 44px;
			background: none;
			border: none;
			border-bottom: 2px solid transparent;
			color: var(--muted);
			font-size: 0.85rem;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.15s;
			text-align: center;
			font-family: inherit;
		}

		.mobile-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
		.mobile-tab:active { background: var(--hover); }

		.instruction-panel {
			width: 100%; min-width: 0;
			border-right: none; border-bottom: 1px solid var(--border);
			display: none; overflow-y: auto; flex: 1;
		}
		.instruction-panel.mobile-show { display: block; }

		.code-panel { display: none; flex: 1; }
		.code-panel.mobile-show { display: flex; flex-direction: column; }

		.mobile-verify-row { display: block; margin-top: 1rem; }

		.mobile-verify-row .verify-btn {
			width: 100%; padding: 0.75rem 1.2rem;
			min-height: 44px;
			background: var(--accent-dim); color: var(--accent);
			border: none; border-radius: 8px;
			font-size: 0.9rem; font-weight: 600; cursor: pointer;
			font-family: inherit; transition: opacity 0.15s;
		}
		.mobile-verify-row .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
		.mobile-verify-row .verify-btn:hover:not(:disabled) { opacity: 0.9; }

		.header-center { display: none; }
		.step-dot { width: 24px; height: 24px; font-size: 0.7rem; }

		.verify-btn, .next-btn { min-height: 44px; padding: 0.6rem 1rem; }
	}
</style>
