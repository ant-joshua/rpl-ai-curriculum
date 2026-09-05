<script lang="ts">
	import { aiModules } from '$lib/stores/ai-course';
	import { parseMarkdown, stripFrontmatter } from '$lib/utils/markdown';
	import { onMount } from 'svelte';

	let completedModules = $state<Set<string>>(new Set());
	let mounted = $state(false);

	onMount(() => {
		try {
			const saved = localStorage.getItem('ai-course-progress');
			if (saved) completedModules = new Set(JSON.parse(saved));
		} catch {}
		mounted = true;
	});

	function toggleComplete(slug: string) {
		const next = new Set(completedModules);
		if (next.has(slug)) next.delete(slug);
		else next.add(slug);
		completedModules = next;
		try { localStorage.setItem('ai-course-progress', JSON.stringify([...next])); } catch {}
	}

	const totalDone = $derived(completedModules.size);
	const totalModules = aiModules.length;
	const progressPct = $derived(Math.round((totalDone / totalModules) * 100));

	const levels = ['Pemula', 'Intermediate', 'Advanced'] as const;
	const levelColors: Record<string, string> = { Pemula: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--danger)' };

	function getLevelModules(level: string) {
		return aiModules.filter(m => m.level === level);
	}
</script>

<svelte:head>
	<title>🎓 AI Complete Course — Dari Nol sampai Mahir</title>
	<meta name="description" content="Panduan lengkap AI untuk semua kalangan — SMK, Kuliah, dan Profesional" />
</svelte:head>

<div class="ai-course-page">
	<!-- Hero -->
	<div class="hero">
		<div class="hero-badge">🎓 Free Course</div>
		<h1>AI Complete Course</h1>
		<p class="hero-sub">Dari Nol sampai Mahir — Pengenalan AI, Prompt Engineering, Agents, Coding, dan Use Case Sehari-hari</p>
		<div class="hero-meta">
			<span>📚 {totalModules} Modul</span>
			<span>⏱️ ~10 jam total</span>
			<span>🎯 Semua level</span>
		</div>

		<!-- Progress -->
		<div class="progress-section">
			<div class="progress-header">
				<span>Progress kamu</span>
				<span>{totalDone}/{totalModules} ({progressPct}%)</span>
			</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progressPct}%"></div>
			</div>
		</div>
	</div>

	<!-- Module Grid by Level -->
	{#each levels as level}
		<section class="level-section">
			<h2 class="level-title">
				<span class="level-dot" style="background: {levelColors[level]}"></span>
				Level {level}
				<span class="level-count">{getLevelModules(level).length} modul</span>
			</h2>
			<div class="module-grid">
				{#each getLevelModules(level) as mod (mod.slug)}
					<a href="/ai-course/{mod.slug}" class="module-card" class:completed={completedModules.has(mod.slug)}>
						<div class="module-top">
							<span class="module-icon">{mod.icon}</span>
							<span class="module-num">#{mod.index}</span>
						</div>
						<h3 class="module-title">{mod.title}</h3>
						<p class="module-desc">{mod.description}</p>
						<div class="module-footer">
							<span class="module-duration">⏱️ {mod.duration}</span>
							<button
								class="check-btn"
								class:done={completedModules.has(mod.slug)}
								onclick={(e) => { e.preventDefault(); e.stopPropagation(); toggleComplete(mod.slug); }}
								title={completedModules.has(mod.slug) ? 'Tandai belum selesai' : 'Tandai selesai'}
							>
								{completedModules.has(mod.slug) ? '✅' : '⬜'}
							</button>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<!-- Final Project -->
	<section class="final-project-section">
		<a href="/ai-course/20-final-project" class="final-project-card">
			<div class="fp-icon">🏆</div>
			<div class="fp-content">
				<h2>Final Project</h2>
				<p>Demonstrasikan pemahaman AI kamu dengan project nyata. Pilih 1 dari 5 project:</p>
				<div class="fp-options">
					<span>🤖 Study Assistant</span>
					<span>📝 Content Creator</span>
					<span>📊 Research Report</span>
					<span>⚡ Automation</span>
					<span>⚖️ Ethics Case Study</span>
				</div>
			</div>
			<span class="fp-arrow">→</span>
		</a>
	</section>

	<!-- Bottom CTA -->
	<div class="bottom-cta">
		{#if totalDone === totalModules}
			<div class="congrats">
				<h2>🎉 Selamat!</h2>
				<p>Kamu udah selesai semua {totalModules} modul! Kamu sekarang paham AI dari dasar sampai lanjutan.</p>
			</div>
		{:else}
			<div class="suggestion">
				<p>💡 <strong>Tip:</strong> Kerjakan modul berurutan dari Level Pemula untuk hasil terbaik.</p>
				<p>Progress kamu disimpan otomatis di browser ini.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.ai-course-page {
		max-width: 1180px;
		margin: 0 auto;
		padding: 32px 24px 64px;
	}

	/* Hero */
	.hero { text-align: center; margin-bottom: 48px; }
	.hero-badge {
		display: inline-block;
		background: var(--accent-light);
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		padding: 4px 14px;
		border-radius: 100px;
		margin-bottom: 16px;
	}
	.hero h1 { font-size: 36px; font-weight: 700; color: var(--text); margin: 0 0 12px; }
	.hero-sub { font-size: 17px; color: var(--text-secondary); max-width: 640px; margin: 0 auto 20px; line-height: 1.6; }
	.hero-meta { display: flex; justify-content: center; gap: 24px; color: var(--text-muted); font-size: 14px; margin-bottom: 28px; }

	/* Progress */
	.progress-section { max-width: 480px; margin: 0 auto; }
	.progress-header { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; }
	.progress-bar { height: 8px; background: var(--border); border-radius: 100px; overflow: hidden; }
	.progress-fill { height: 100%; background: linear-gradient(90deg, var(--success), var(--success)); border-radius: 100px; transition: width 0.4s ease; }

	/* Level Section */
	.level-section { margin-bottom: 40px; }
	.level-title {
		display: flex; align-items: center; gap: 10px;
		font-size: 20px; font-weight: 700; color: var(--text);
		margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
	}
	.level-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
	.level-count { font-size: 13px; color: var(--text-muted); font-weight: 400; margin-left: auto; }

	/* Module Grid */
	.module-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}
	.module-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-decoration: none;
		color: inherit;
		transition: box-shadow 0.2s, border-color 0.2s;
		cursor: pointer;
	}
	.module-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #d1d5db; }
	.module-card.completed { border-color: var(--success); background: var(--success-light); }

	.module-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.module-icon { font-size: 28px; }
	.module-num { font-size: 12px; color: var(--text-muted); font-weight: 600; }
	.module-title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 6px; }
	.module-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 14px; }
	.module-footer { display: flex; justify-content: space-between; align-items: center; }
	.module-duration { font-size: 12px; color: var(--text-muted); }

	.check-btn {
		background: none; border: none; font-size: 18px; cursor: pointer;
		padding: 2px; border-radius: 4px; transition: transform 0.15s;
	}
	.check-btn:hover { transform: scale(1.2); }
	.check-btn.done { opacity: 0.7; }

	/* Final Project */
	.final-project-section { margin: 48px 0 24px; }
	.final-project-card {
		display: flex; align-items: center; gap: 20px;
		background: linear-gradient(135deg, var(--accent-light), var(--success-light));
		border: 2px solid var(--accent)20;
		border-radius: 16px; padding: 28px;
		text-decoration: none; color: inherit;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.final-project-card:hover { border-color: var(--accent)40; box-shadow: 0 4px 20px rgba(37,99,235,0.1); }
	.fp-icon { font-size: 40px; flex-shrink: 0; }
	.fp-content { flex: 1; }
	.fp-content h2 { font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 6px; }
	.fp-content p { font-size: 14px; color: var(--text-secondary); margin: 0 0 12px; }
	.fp-options { display: flex; flex-wrap: wrap; gap: 8px; }
	.fp-options span {
		background: var(--surface); border: 1px solid #e5e7eb;
		padding: 4px 10px; border-radius: 100px;
		font-size: 12px; font-weight: 500; color: var(--text-secondary);
	}
	.fp-arrow { font-size: 24px; color: var(--accent); font-weight: 700; }

	/* Bottom CTA */
	.bottom-cta { text-align: center; margin-top: 32px; }
	.congrats {
		background: linear-gradient(135deg, var(--success-light), #dcfce7);
		border-radius: 16px; padding: 32px;
	}
	.congrats h2 { font-size: 24px; margin: 0 0 8px; }
	.congrats p { color: var(--text-secondary); margin: 0; }
	.suggestion {
		background: var(--warning-light, rgba(184,134,11,0.08)); border: 1px solid var(--warning);
		border-radius: 12px; padding: 20px; text-align: left; max-width: 600px; margin: 0 auto;
	}
	.suggestion p { margin: 4px 0; font-size: 14px; color: var(--text-secondary); }

	@media (max-width: 640px) {
		.hero h1 { font-size: 26px; }
		.hero-meta { flex-direction: column; gap: 6px; }
		.module-grid { grid-template-columns: 1fr; }
	}
</style>
